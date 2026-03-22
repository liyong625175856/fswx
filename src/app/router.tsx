import { createBrowserRouter } from "react-router-dom";

import { Layout } from "@/components/Layout";
import { RouteError } from "@/components/RouteError";
import { HomePage } from "@/pages/HomePage";
import { StitchHomePage } from "@/stitch";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteError />,
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: "/stitch-preview",
    element: <StitchHomePage />,
    errorElement: <RouteError />,
  },
]);
