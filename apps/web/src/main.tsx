import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";

// Enregistrement de tous les composants du registre
import "@template-generator/component-registry/components";

import { App } from "./App";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>
);
