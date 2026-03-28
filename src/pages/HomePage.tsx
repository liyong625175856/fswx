import { useEffect, useState } from "react";

import { listCodes } from "@/services/codes";

function serviceHint(
  result: Awaited<ReturnType<typeof listCodes>>,
): string {
  if (!result.ok) {
    if (result.error === "NOT_CONFIGURED") {
      return "Supabase 未配置：复制 .env.example 为 .env 并填写变量后可连接后端。";
    }
    return "Supabase 已配置，但当前无法读取 dkcodes。请检查网络或 RLS 策略。";
  }
  return `Supabase 已连接，当前可见码数量：${result.data.total ?? 0}`;
}

export function HomePage() {
  const [hint, setHint] = useState<string>("正在检查服务状态…");

  useEffect(() => {
    let cancelled = false;
    void listCodes().then((r) => {
      if (!cancelled) {
        setHint(serviceHint(r));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">欢迎使用发码系统</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
        工程已配置 Vite、React Router、Tailwind 与 Supabase
        客户端抽象层。将 Stitch 导出页面放入{" "}
        <code className="rounded bg-slate-200 px-1 py-0.5 text-xs">src/stitch/</code>{" "}
        并在路由中挂载即可。
      </p>
      <p className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
        {hint}
      </p>
    </div>
  );
}
