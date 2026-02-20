/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string
  readonly VITE_APP_LOGO_URL?: string
  readonly VITE_APP_FAVICON_URL?: string
  readonly VITE_APP_DESCRIPTION?: string
  readonly VITE_APP_PRIMARY_COLOR?: string
  readonly VITE_APP_SECONDARY_COLOR?: string
  readonly VITE_DEFAULT_RPC_URL?: string
  readonly VITE_DEFAULT_CHAIN_NAME?: string
  readonly VITE_DEFAULT_CHAIN_ID?: string
  readonly VITE_DOCS_URL?: string
  readonly VITE_GITHUB_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
