import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { TemplatesListPage } from "@/pages/templates/TemplatesListPage";
import { TemplateEditPage } from "@/pages/templates/TemplateEditPage";
import { ComponentsListPage } from "@/pages/components/ComponentsListPage";
import { DocumentsListPage } from "@/pages/documents/DocumentsListPage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <DashboardPage /> },
      { path: "/templates", element: <TemplatesListPage /> },
      { path: "/templates/:id/edit", element: <TemplateEditPage /> },
      { path: "/components", element: <ComponentsListPage /> },
      { path: "/documents", element: <DocumentsListPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
