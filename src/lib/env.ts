import { z } from "zod";

const schema = z.object({
  VITE_SUPABASE_URL: z.string().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
});

export type AppEnv = {
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
};

let cached: AppEnv | null = null;

function readRaw() {
  return {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

/**
 * 解析后的前端环境变量。未配置 Supabase 时仍可启动应用。
 */
export function getEnv(): AppEnv {
  if (cached) {
    return cached;
  }

  const raw = readRaw();
  const parsed = schema.safeParse(raw);
  if (!parsed.success && import.meta.env.DEV) {
    console.warn("[env] 环境变量解析异常", parsed.error.flatten());
  }

  const url = (parsed.success
    ? parsed.data.VITE_SUPABASE_URL
    : raw.VITE_SUPABASE_URL
  )?.trim();
  const key = (parsed.success
    ? parsed.data.VITE_SUPABASE_ANON_KEY
    : raw.VITE_SUPABASE_ANON_KEY
  )?.trim();

  if (import.meta.env.DEV) {
    if ((url && !key) || (!url && key)) {
      console.warn("[env] VITE_SUPABASE_URL 与 VITE_SUPABASE_ANON_KEY 需同时配置。");
    }
    if (url) {
      const urlCheck = z.string().url().safeParse(url);
      if (!urlCheck.success) {
        console.warn("[env] VITE_SUPABASE_URL 不是合法 URL。");
      }
    }
  }

  cached = {
    supabaseUrl: url || undefined,
    supabaseAnonKey: key || undefined,
  };
  return cached;
}
