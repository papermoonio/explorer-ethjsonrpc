export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE ?? 'Block Explorer',
  appLogoUrl: import.meta.env.VITE_APP_LOGO_URL ?? '',
  appFaviconUrl: import.meta.env.VITE_APP_FAVICON_URL ?? '',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION ?? '',
  primaryColor: import.meta.env.VITE_APP_PRIMARY_COLOR ?? '#6366f1',
  defaultRpcUrl: import.meta.env.VITE_DEFAULT_RPC_URL ?? 'https://ethereum-rpc.publicnode.com',
  defaultChainName: import.meta.env.VITE_DEFAULT_CHAIN_NAME ?? 'Ethereum',
  defaultWsUrl: import.meta.env.VITE_DEFAULT_WS_URL ?? '',
  defaultChainId: import.meta.env.VITE_DEFAULT_CHAIN_ID ?? '1',
  chainsConfig: import.meta.env.VITE_CHAINS_CONFIG ?? '',
  docsUrl: import.meta.env.VITE_DOCS_URL ?? '',
  githubUrl: import.meta.env.VITE_GITHUB_URL ?? '',
} as const
