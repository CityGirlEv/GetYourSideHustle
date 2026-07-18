/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_BUILD_ID: string;
  readonly VITE_META_PIXEL_ID?: string;
  readonly VITE_META_PIXEL_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
