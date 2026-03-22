import { getSupabaseBrowserClient } from "@/lib/supabase";

export type CodesServiceError = "NOT_CONFIGURED" | "NOT_IMPLEMENTED";

/**
 * 列出可用码（占位）。表结构确定后在 Supabase 中实现查询。
 */
export async function listCodes(): Promise<
  { ok: true; data: unknown[] } | { ok: false; error: CodesServiceError }
> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, error: "NOT_CONFIGURED" };
  }

  void supabase;
  return { ok: false, error: "NOT_IMPLEMENTED" };
}

/**
 * 领取/核销单个码（占位）。
 */
export async function claimCode(
  codeId: string,
): Promise<{ ok: true } | { ok: false; error: CodesServiceError }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { ok: false, error: "NOT_CONFIGURED" };
  }

  void codeId;
  void supabase;
  return { ok: false, error: "NOT_IMPLEMENTED" };
}
