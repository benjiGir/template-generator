import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { TemplatesListPage } from "@/pages/templates/TemplatesListPage";
import { TemplateStartPage } from "@/pages/templates/TemplateStartPage";
import { TemplateThemePage } from "@/pages/templates/TemplateThemePage";
import { TemplateEditPage } from "@/pages/templates/TemplateEditPage";
import { TemplatePublishPage } from "@/pages/templates/TemplatePublishPage";
import { ComponentsListPage } from "@/pages/components/ComponentsListPage";
import { ComponentSelectPage } from "@/pages/components/ComponentSelectPage";
import { ComponentEditPage } from "@/pages/components/ComponentEditPage";
import { ComponentSavePage } from "@/pages/components/ComponentSavePage";
import { DocumentsListPage } from "@/pages/documents/DocumentsListPage";
import { DocumentSelectPage } from "@/pages/documents/DocumentSelectPage";
import { DocumentFillPage } from "@/pages/documents/DocumentFillPage";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/",                          element: <DashboardPage /> },
      { path: "/templates",                 element: <TemplatesListPage /> },
      { path: "/templates/new",             element: <TemplateStartPage /> },
      { path: "/templates/:id/theme",       element: <TemplateThemePage /> },
      { path: "/templates/:id/edit",        element: <TemplateEditPage /> },
      { path: "/templates/:id/publish",     element: <TemplatePublishPage /> },
      { path: "/components",               element: <ComponentsListPage /> },
      { path: "/components/new",           element: <ComponentSelectPage /> },
      { path: "/components/new/edit",      element: <ComponentEditPage /> },
      { path: "/components/new/save",      element: <ComponentSavePage /> },
      { path: "/documents",                element: <DocumentsListPage /> },
      { path: "/documents/new",            element: <DocumentSelectPage /> },
      { path: "/documents/:id/fill",       element: <DocumentFillPage /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
