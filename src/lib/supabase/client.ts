import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getEnv } from "@/lib/env";

import type { Database } from "./types";

let client: SupabaseClient<Database> | null = null;

/**
 * 浏览器端 Supabase 单例。未配置环境变量时返回 null。
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (client) {
    return client;
  }

  const { supabaseUrl, supabaseAnonKey } = getEnv();
  if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.DEV) {
      console.warn(
        "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 未配置，发码相关接口不可用。",
      );
    }
    return null;
  }

  client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return client;
}
