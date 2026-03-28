/**
 * 购买 / 发码服务
 *
 * 排查「控制台有 unused，前端却提示缺货」时（勿改计划文件，以下为操作说明）：
 * 1) RLS：表编辑器使用高权限，浏览器使用 anon key。若 anon 无 SELECT，可见行数为 0 且不报错。
 *    在 Supabase → Authentication → Policies 为 dkcodes 配置 FOR SELECT（开发验证可用 USING (true)）。
 * 2) status：代码使用 .eq("status", "unused") 精确匹配，库中不能是 "Unused"、不能含空格。
 * 3) Network：F12 → Network → 过滤 rest/v1/dkcodes，响应体 [] 且无 error 多为 RLS 或条件不匹配。
 */

import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase";

export type VipType = "seasonal" | "half-year" | "yearly" | "lifetime";

export type PurchaseInput = {
  vipType: VipType;
  amount: number;
};

export type PurchaseErrorCode =
  | "NOT_CONNECTED"
  | "PERMISSION_SELECT"
  | "PERMISSION_UPDATE"
  | "PERMISSION_INSERT"
  | "NO_VISIBLE_CODES"
  | "NO_UNUSED_MATCH"
  | "OUT_OF_STOCK"
  | "CODE_ALREADY_TAKEN"
  | "NO_USER"
  | "ORDER_CREATE_FAILED"
  | "ROLLBACK_FAILED"
  | "UNKNOWN";

export type PurchaseError = {
  code: PurchaseErrorCode;
  message: string;
  fixHint: string;
};

export type PurchaseSuccess = {
  ok: true;
  orderNo: string;
  code: string;
};

export type PurchaseFailure = {
  ok: false;
  error: PurchaseError;
};

export type PurchaseResult = PurchaseSuccess | PurchaseFailure;

const PERMISSION_DENIED_CODES = new Set(["42501", "PGRST301"]);

function isPermissionError(error: PostgrestError | null): boolean {
  if (!error) {
    return false;
  }
  if (error.code && PERMISSION_DENIED_CODES.has(error.code)) {
    return true;
  }
  return /permission denied|row level security|rls/i.test(error.message);
}

function createOrderNo(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

function failure(
  code: PurchaseErrorCode,
  message: string,
  fixHint: string,
): PurchaseFailure {
  return { ok: false, error: { code, message, fixHint } };
}

async function checkConnectionAndPermissions() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return failure(
      "NOT_CONNECTED",
      "Supabase 尚未连接，无法购买。",
      "请在 .env 中配置 VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY，并在 Vercel 同步环境变量。",
    );
  }

  // 购买前的轻量连通性和 select 权限检查，不写入数据。
  const codesProbe = await supabase.from("dkcodes").select("id", { count: "exact", head: true });
  if (codesProbe.error) {
    console.error("[purchase] dkcodes select probe failed", codesProbe.error);
    return isPermissionError(codesProbe.error)
      ? failure(
          "PERMISSION_SELECT",
          "缺少读取 dkcodes 的权限。",
          "请检查 Supabase RLS：为当前角色放行 dkcodes 的 SELECT 策略。",
        )
      : failure(
          "NOT_CONNECTED",
          "无法连接到 Supabase（dkcodes）。",
          "请检查 Supabase URL/Key、网络与项目状态。",
        );
  }

  const usersProbe = await supabase.from("dkusers").select("id", { count: "exact", head: true });
  if (usersProbe.error) {
    console.error("[purchase] dkusers select probe failed", usersProbe.error);
    return isPermissionError(usersProbe.error)
      ? failure(
          "PERMISSION_SELECT",
          "缺少读取 dkusers 的权限。",
          "请检查 Supabase RLS：为当前角色放行 dkusers 的 SELECT 策略。",
        )
      : failure(
          "NOT_CONNECTED",
          "无法连接到 Supabase（dkusers）。",
          "请检查 Supabase URL/Key、网络与项目状态。",
        );
  }

  // 匿名角色下「可见的 unused 行数」。与无 where 的总可见行数对比，可区分 RLS 全挡 vs 无匹配 status。
  const unusedProbe = await supabase
    .from("dkcodes")
    .select("id", { count: "exact", head: true })
    .eq("status", "unused");
  if (unusedProbe.error) {
    console.error("[purchase] dkcodes unused count probe failed", unusedProbe.error);
    return isPermissionError(unusedProbe.error)
      ? failure(
          "PERMISSION_SELECT",
          "无法按 status='unused' 统计兑换码（可能被 RLS 拒绝）。",
          "请检查 dkcodes：是否允许 anon 对 status='unused' 行执行 SELECT。",
        )
      : failure("NOT_CONNECTED", "无法连接到 Supabase（dkcodes unused 统计）。", "请检查网络与项目状态。");
  }

  const dkcodesVisibleTotal = codesProbe.count ?? 0;
  const dkcodesVisibleUnused = unusedProbe.count ?? 0;

  return { ok: true as const, supabase, dkcodesVisibleTotal, dkcodesVisibleUnused };
}

async function reserveFirstUnusedCode() {
  const preflight = await checkConnectionAndPermissions();
  if (!preflight.ok) {
    return preflight;
  }
  const { supabase, dkcodesVisibleTotal, dkcodesVisibleUnused } = preflight;

  // 在抢码查询前先根据计数分流，避免「RLS 挡死」仍显示成单纯缺货。
  if (dkcodesVisibleUnused === 0) {
    if (dkcodesVisibleTotal === 0) {
      return failure(
        "NO_VISIBLE_CODES",
        "匿名角色下读不到任何 dkcodes 行（与控制台是否能看到数据无关）。",
        "请到 Supabase → Authentication → Policies，为表 public.dkcodes 添加允许 anon SELECT 的策略。若控制台能看到行而这里为 0，几乎一定是 RLS 未放行。开发验证可用：CREATE POLICY ... FOR SELECT USING (true);（上线请改为最小权限）。",
      );
    }
    return failure(
      "NO_UNUSED_MATCH",
      "能读到 dkcodes，但没有 status 精确等于 'unused' 的可用行。",
      "请执行：1) 在 SQL 中核对 status 是否全小写 unused、无首尾空格；2) 若已全部 assigned 请插入新码；3) 检查 RLS 的 USING 是否把 unused 行过滤掉。",
    );
  }

  // 重试 2 次，尽量规避并发抢码导致的瞬时冲突。
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const pick = await supabase
      .from("dkcodes")
      .select("id,code,status")
      .eq("status", "unused")
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (pick.error) {
      console.error("[purchase] select unused code failed", pick.error);
      return isPermissionError(pick.error)
        ? failure(
            "PERMISSION_SELECT",
            "无法读取可用兑换码。",
            "请检查 dkcodes 的 SELECT 策略是否允许当前角色读取 status='unused' 的记录。",
          )
        : failure("UNKNOWN", "查询可用兑换码失败。", "请稍后重试并检查网络日志。");
    }
    if (!pick.data) {
      if (import.meta.env.DEV) {
        console.warn("[purchase] pick unused returned empty row", {
          attempt,
          dkcodesVisibleTotal,
          dkcodesVisibleUnused,
          hint: "预检显示有 unused，但单行查询为空，可能被并发抢走或 RLS/条件瞬时变化。",
        });
      }
      return failure(
        "OUT_OF_STOCK",
        "暂无可分配的兑换码（查询结果为空）。",
        "若预检显示有库存仍出现本提示，可能是并发抢码；请重试。若控制台始终有 unused 而预检 unused 为 0，请按 NO_VISIBLE_CODES / NO_UNUSED_MATCH 的说明检查 RLS 与 status 字段。",
      );
    }

    const reserve = await supabase
      .from("dkcodes")
      .update({ status: "assigned" })
      .eq("id", pick.data.id)
      .eq("status", "unused")
      .select("id,code")
      .maybeSingle();

    if (reserve.error) {
      console.error("[purchase] reserve code failed", reserve.error);
      return isPermissionError(reserve.error)
        ? failure(
            "PERMISSION_UPDATE",
            "缺少更新 dkcodes 的权限，无法锁定兑换码。",
            "请在 Supabase RLS 中放行 dkcodes 的 UPDATE（至少允许从 unused 更新到 assigned）。",
          )
        : failure("UNKNOWN", "锁定兑换码失败。", "请稍后重试并检查 Supabase 日志。");
    }

    if (reserve.data) {
      return { ok: true as const, supabase, code: reserve.data };
    }
  }

  return failure(
    "CODE_ALREADY_TAKEN",
    "兑换码被并发请求占用，请重试。",
    "如并发较高，可通过后端 RPC/事务进一步收敛竞争窗口。",
  );
}

async function rollbackCodeStatus(codeId: number) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return failure(
      "ROLLBACK_FAILED",
      "下单失败且无法回滚兑换码状态（连接中断）。",
      "请手动检查 dkcodes.id 对应记录，必要时改回 unused。",
    );
  }

  const rollback = await supabase
    .from("dkcodes")
    .update({ status: "unused" })
    .eq("id", codeId)
    .eq("status", "assigned")
    .select("id")
    .maybeSingle();

  if (rollback.error || !rollback.data) {
    console.error("[purchase] rollback code failed", rollback.error);
    return failure(
      "ROLLBACK_FAILED",
      "下单失败，且回滚兑换码状态失败。",
      "请手动核对该兑换码状态，避免出现已占用但无订单的脏数据。",
    );
  }

  return { ok: true as const };
}

export async function runPurchaseFlow(input: PurchaseInput): Promise<PurchaseResult> {
  // 1) 查询 + 条件更新抢码（避免重复发码）。
  const reserve = await reserveFirstUnusedCode();
  if (!reserve.ok) {
    return reserve;
  }

  const { supabase, code } = reserve;

  // 2) 获取最近用户作为默认下单用户。
  const latestUser = await supabase
    .from("dkusers")
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestUser.error) {
    console.error("[purchase] query latest user failed", latestUser.error);
    await rollbackCodeStatus(code.id);
    return isPermissionError(latestUser.error)
      ? failure(
          "PERMISSION_SELECT",
          "缺少读取 dkusers 的权限，无法创建订单。",
          "请检查 dkusers 的 SELECT 策略是否允许当前角色读取用户。",
        )
      : failure("UNKNOWN", "查询默认用户失败。", "请稍后重试。");
  }

  if (!latestUser.data) {
    await rollbackCodeStatus(code.id);
    return failure("NO_USER", "未找到可下单用户。", "请先在 dkusers 表创建至少一条用户记录。");
  }

  const orderNo = createOrderNo();
  const orderInsert = await supabase
    .from("dkorders")
    .insert({
      order_no: orderNo,
      user_id: latestUser.data.id,
      code_id: code.id,
      vip_type: input.vipType,
      amount: input.amount,
      buy_time: new Date().toISOString(),
    })
    .select("id,order_no")
    .maybeSingle();

  if (orderInsert.error || !orderInsert.data) {
    console.error("[purchase] create order failed", orderInsert.error);
    const rollback = await rollbackCodeStatus(code.id);
    if (!rollback.ok) {
      return rollback;
    }
    return orderInsert.error && isPermissionError(orderInsert.error)
      ? failure(
          "PERMISSION_INSERT",
          "缺少写入 dkorders 的权限，订单创建失败。",
          "请在 Supabase RLS 中放行 dkorders 的 INSERT 策略。",
        )
      : failure(
          "ORDER_CREATE_FAILED",
          "订单创建失败，兑换码已自动回滚。",
          "请检查 dkorders 约束（唯一键、外键）以及 Supabase 日志。",
        );
  }

  return { ok: true, orderNo: orderInsert.data.order_no, code: code.code };
}
