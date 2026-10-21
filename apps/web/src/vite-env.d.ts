/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL de l'API appelée directement par le front ; vide : URLs relatives (proxy Vite ou nginx) */
  readonly VITE_API_URL?: string;
}
