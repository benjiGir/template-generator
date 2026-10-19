import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { TemplatesListPage } from "@/pages/templates/TemplatesListPage";
import { TemplateStartPage } from "@/pages/templates/TemplateStartPage";
import { TemplateWorkflowRoute } from "@/pages/templates/TemplateWorkflowRoute";
import { TemplateThemePage } from "@/pages/templates/TemplateThemePage";
import { TemplateBuildPage } from "@/pages/templates/TemplateBuildPage";
import { TemplatePublishPage } from "@/pages/templates/TemplatePublishPage";
import { ComponentsListPage } from "@/pages/components/ComponentsListPage";
import { PresetWorkflowRoute, PresetEntry } from "@/pages/components/PresetWorkflowRoute";
import { ComponentEditPage } from "@/pages/components/ComponentEditPage";
import { ComponentSavePage } from "@/pages/components/ComponentSavePage";
import { DocumentsListPage } from "@/pages/documents/DocumentsListPage";
import { DocumentSelectPage } from "@/pages/documents/DocumentSelectPage";
import { DocumentWorkflowRoute, DocumentEntryRedirect } from "@/pages/documents/DocumentWorkflowRoute";
import { DocumentFillPage } from "@/pages/documents/DocumentFillPage";
import { DocumentPreviewPage } from "@/pages/documents/DocumentPreviewPage";
import { DocumentExportPage } from "@/pages/documents/DocumentExportPage";

/** Anciennes URL de l'éditeur (/templates/:id/edit) */
function LegacyTemplateEdit() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/templates/${id}/build`} replace />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <DashboardPage /> },

      // Studio de Publication
      { path: "/documents",     element: <DocumentsListPage /> },
      { path: "/documents/new", element: <DocumentSelectPage /> },
      {
        path: "/documents/:id",
        element: <DocumentWorkflowRoute />,
        children: [
          { index: true,       element: <DocumentEntryRedirect /> },
          { path: "fill",      element: <DocumentFillPage /> },
          { path: "preview",   element: <DocumentPreviewPage /> },
          { path: "export",    element: <DocumentExportPage /> },
        ],
      },

      // Atelier Templates
      { path: "/templates",          element: <TemplatesListPage /> },
      { path: "/templates/new",      element: <TemplateStartPage /> },
      { path: "/templates/:id/edit", element: <LegacyTemplateEdit /> },
      {
        path: "/templates/:id",
        element: <TemplateWorkflowRoute />,
        children: [
          { index: true,     element: <Navigate to="build" replace /> },
          { path: "theme",   element: <TemplateThemePage /> },
          { path: "build",   element: <TemplateBuildPage /> },
          { path: "publish", element: <TemplatePublishPage /> },
        ],
      },

      // Bibliothèque de presets (« new » ou identifiant du preset modifié)
      { path: "/components", element: <ComponentsListPage /> },
      {
        path: "/components/:presetId",
        element: <PresetWorkflowRoute />,
        children: [
          { index: true,       element: <PresetEntry /> },
          { path: "configure", element: <ComponentEditPage /> },
          { path: "save",      element: <ComponentSavePage /> },
        ],
      },

      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
