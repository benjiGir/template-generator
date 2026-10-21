import type { ComponentType } from "react";
import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { RouteError } from "@/components/ui/RouteError";
import { AppLoading } from "@/components/ui/AppLoading";

/**
 * Chaque écran est un fichier JavaScript à part, chargé à la première visite : l'accueil ne télécharge
 * ni l'éditeur (Lexical, dnd-kit), ni l'aperçu des documents, ni l'aide.
 */
function screen<M>(load: () => Promise<M>, pick: (module: M) => ComponentType) {
  return async () => ({ Component: pick(await load()) });
}

/** Anciennes URL de l'éditeur (/templates/:id/edit) */
function LegacyTemplateEdit() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/templates/${id}/build`} replace />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    // Premier affichage, le temps de charger l'écran demandé
    hydrateFallbackElement: <AppLoading />,
    children: [
      {
        // Un écran qui plante est remplacé par un message, la navigation reste autour
        errorElement: <RouteError />,
        children: [
          {
            path: "/",
            lazy: screen(
              () => import("@/pages/DashboardPage"),
              (m) => m.DashboardPage,
            ),
          },

          // Studio de Publication
          {
            path: "/documents",
            lazy: screen(
              () => import("@/pages/documents/DocumentsListPage"),
              (m) => m.DocumentsListPage,
            ),
          },
          {
            path: "/documents/new",
            lazy: screen(
              () => import("@/pages/documents/DocumentSelectPage"),
              (m) => m.DocumentSelectPage,
            ),
          },
          {
            path: "/documents/:id",
            lazy: screen(
              () => import("@/pages/documents/DocumentWorkflowRoute"),
              (m) => m.DocumentWorkflowRoute,
            ),
            children: [
              {
                index: true,
                lazy: screen(
                  () => import("@/pages/documents/DocumentWorkflowRoute"),
                  (m) => m.DocumentEntryRedirect,
                ),
              },
              {
                path: "fill",
                lazy: screen(
                  () => import("@/pages/documents/DocumentFillPage"),
                  (m) => m.DocumentFillPage,
                ),
              },
              {
                path: "preview",
                lazy: screen(
                  () => import("@/pages/documents/DocumentPreviewPage"),
                  (m) => m.DocumentPreviewPage,
                ),
              },
              {
                path: "export",
                lazy: screen(
                  () => import("@/pages/documents/DocumentExportPage"),
                  (m) => m.DocumentExportPage,
                ),
              },
            ],
          },

          // Atelier Templates
          {
            path: "/templates",
            lazy: screen(
              () => import("@/pages/templates/TemplatesListPage"),
              (m) => m.TemplatesListPage,
            ),
          },
          {
            path: "/templates/new",
            lazy: screen(
              () => import("@/pages/templates/TemplateStartPage"),
              (m) => m.TemplateStartPage,
            ),
          },
          { path: "/templates/:id/edit", element: <LegacyTemplateEdit /> },
          {
            path: "/templates/:id",
            lazy: screen(
              () => import("@/pages/templates/TemplateWorkflowRoute"),
              (m) => m.TemplateWorkflowRoute,
            ),
            children: [
              { index: true, element: <Navigate to="build" replace /> },
              {
                path: "theme",
                lazy: screen(
                  () => import("@/pages/templates/TemplateThemePage"),
                  (m) => m.TemplateThemePage,
                ),
              },
              {
                path: "build",
                lazy: screen(
                  () => import("@/pages/templates/TemplateBuildPage"),
                  (m) => m.TemplateBuildPage,
                ),
              },
              {
                path: "publish",
                lazy: screen(
                  () => import("@/pages/templates/TemplatePublishPage"),
                  (m) => m.TemplatePublishPage,
                ),
              },
            ],
          },

          // Bibliothèque de presets (« new » ou identifiant du preset modifié)
          {
            path: "/components",
            lazy: screen(
              () => import("@/pages/components/ComponentsListPage"),
              (m) => m.ComponentsListPage,
            ),
          },
          {
            path: "/components/:presetId",
            lazy: screen(
              () => import("@/pages/components/PresetWorkflowRoute"),
              (m) => m.PresetWorkflowRoute,
            ),
            children: [
              {
                index: true,
                lazy: screen(
                  () => import("@/pages/components/PresetWorkflowRoute"),
                  (m) => m.PresetEntry,
                ),
              },
              {
                path: "configure",
                lazy: screen(
                  () => import("@/pages/components/ComponentEditPage"),
                  (m) => m.ComponentEditPage,
                ),
              },
              {
                path: "save",
                lazy: screen(
                  () => import("@/pages/components/ComponentSavePage"),
                  (m) => m.ComponentSavePage,
                ),
              },
            ],
          },

          {
            path: "/aide",
            lazy: screen(
              () => import("@/pages/HelpPage"),
              (m) => m.HelpPage,
            ),
          },
          {
            path: "/aide/:slug",
            lazy: screen(
              () => import("@/pages/HelpPage"),
              (m) => m.HelpPage,
            ),
          },

          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
