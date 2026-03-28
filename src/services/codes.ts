import { getSupabaseBrowserClient } from "@/lib/supabase";

export type CodesServiceError = "NOT_CONFIGURED" | "QUERY_FAILED";

/**
 * 首页健康检查接口：用于提示 Supabase 是否可连通。
 */
export async function listCodes(): Promise<
  { ok: true; data: { total: number | null } } | { ok: false; error: CodesServiceError }
> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, error: "NOT_CONFIGURED" };
  }

  const probe = await supabase.from("dkcodes").select("id", { count: "exact", head: true });
  if (probe.error) {
    console.error("[codes] listCodes probe failed", probe.error);
    return { ok: false, error: "QUERY_FAILED" };
  }

  return { ok: true, data: { total: probe.count } };
}
