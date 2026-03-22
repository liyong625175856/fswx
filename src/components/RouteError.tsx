import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export function RouteError() {
  const error = useRouteError();

  let message = "未知错误";
  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4">
      <h1 className="text-lg font-semibold text-slate-900">路由错误</h1>
      <p className="mt-2 text-center text-sm text-slate-600">{message}</p>
    </div>
  );
}
