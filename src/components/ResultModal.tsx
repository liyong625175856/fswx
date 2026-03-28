import { useEffect } from "react";

type ResultModalProps = {
  open: boolean;
  title: string;
  description: string;
  code?: string;
  orderNo?: string;
  onClose: () => void;
};

/**
 * 通用结果弹窗：用于展示购买成功与兑换码。
 */
export function ResultModal({
  open,
  title,
  description,
  code,
  orderNo,
  onClose,
}: ResultModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
        {code ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              兑换码
            </p>
            <p className="mt-1 break-all font-mono text-lg font-bold text-emerald-900">
              {code}
            </p>
          </div>
        ) : null}
        {orderNo ? (
          <p className="mt-3 text-xs text-slate-500">订单号：{orderNo}</p>
        ) : null}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
}
