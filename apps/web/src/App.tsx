import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { DashboardPage } from "@/pages/DashboardPage";
import { EditorPage } from "@/pages/EditorPage";

const router = createBrowserRouter([
  { path: "/", element: <DashboardPage /> },
  { path: "/editor/:id", element: <EditorPage /> },
]);

export function App() {
  return <RouterProvider router={router} />;
}
