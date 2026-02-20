# Explorer JSON-RPC

A lightweight Ethereum block explorer that communicates directly with any
EVM-compatible JSON-RPC endpoint. No backend server or indexer is required --
the browser talks to the RPC node over HTTP and renders everything client-side.

## Features

- Direct JSON-RPC communication (no backend, no indexer)
- Multi-network support with preconfigured chains via `VITE_CHAINS_CONFIG`
- Real-time block updates via WebSocket subscriptions (with HTTP polling fallback)
- Per-deployment branding (logo, favicon, colors, chart colors, title)
- Dashboard with network stats and block charts
- Block list and block detail pages with pagination
- Transaction detail pages with receipt display
- Address pages with balance, nonce, contract detection, and recent activity
- Block producer statistics with pie chart visualization
- Custom chain management (add and remove endpoints at runtime)
- Light/dark theme with system preference detection
- Responsive design
- Internationalization support

## Quick Start

```bash
git clone <repo-url>
cd explorer-jsonrpc
pnpm install
cp .env.example .env    # optional -- defaults work out of the box
pnpm dev
```

The development server starts at `http://localhost:5173` by default.

## Environment Variables

All configuration is done through `VITE_*` environment variables. Copy
`.env.example` to `.env` and edit as needed.

> **Important:** Hex color values must be quoted in `.env` files because `#`
> starts a comment in dotenv. Use `VITE_APP_PRIMARY_COLOR="#E6007A"` (not
> `VITE_APP_PRIMARY_COLOR=#E6007A`).

### Branding

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_TITLE` | `Block Explorer` | Page title shown in the browser tab and header. |
| `VITE_APP_LOGO_URL` | *(empty)* | URL or path to a logo image displayed in the header. |
| `VITE_APP_FAVICON_URL` | *(empty)* | URL or path to a custom favicon. |
| `VITE_APP_DESCRIPTION` | *(empty)* | Meta description for SEO and social previews. |
| `VITE_APP_PRIMARY_COLOR` | `#6366f1` | Primary brand color. All UI colors (buttons, accents, borders, ring) and chart colors are derived from this. |
| `VITE_APP_CHART_COLOR_1` | *(derived from primary)* | Color for the left chart (Transactions per Block). |
| `VITE_APP_CHART_COLOR_2` | *(primary hue +60°)* | Color for the right chart (Gas Used per Block). |

### Preconfigured Chains

Use `VITE_CHAINS_CONFIG` to define multiple networks in the chain dropdown.
Each entry is a JSON object with the chain details:

| Variable | Default | Description |
|---|---|---|
| `VITE_CHAINS_CONFIG` | *(empty)* | JSON array of chain objects (see below). Overrides individual chain vars when set. |

```env
VITE_CHAINS_CONFIG='[{"name":"Moonbeam","chainId":1284,"rpcUrl":"https://rpc.api.moonbeam.network","wsUrl":"wss://wss.api.moonbeam.network"},{"name":"Moonriver","chainId":1285,"rpcUrl":"https://rpc.api.moonriver.moonbeam.network","wsUrl":"wss://wss.api.moonriver.moonbeam.network"},{"name":"Moonbase Alpha","chainId":1287,"rpcUrl":"https://rpc.api.moonbase.moonbeam.network","network":"testnet"}]'
```

Each chain object supports:

| Field | Required | Default | Description |
|---|---|---|---|
| `name` | Yes | | Display name in the dropdown. |
| `chainId` | Yes | | EIP-155 chain ID. |
| `rpcUrl` | Yes | | HTTP JSON-RPC endpoint. |
| `wsUrl` | No | | WebSocket endpoint for real-time subscriptions. |
| `symbol` | No | `ETH` | Native currency symbol. |
| `network` | No | `mainnet` | One of `mainnet`, `testnet`, or `devnet`. |
| `decimals` | No | `18` | Native currency decimals. |

### Single Chain Fallback

If `VITE_CHAINS_CONFIG` is not set, these individual vars define a single default chain:

| Variable | Default | Description |
|---|---|---|
| `VITE_DEFAULT_RPC_URL` | `https://ethereum-rpc.publicnode.com` | JSON-RPC HTTP endpoint. |
| `VITE_DEFAULT_CHAIN_NAME` | `Ethereum` | Display name for the default chain. |
| `VITE_DEFAULT_CHAIN_ID` | `1` | EIP-155 chain ID. |
| `VITE_DEFAULT_WS_URL` | *(empty)* | WebSocket endpoint for real-time block subscriptions. |

### External Links

| Variable | Default | Description |
|---|---|---|
| `VITE_DOCS_URL` | *(empty)* | URL to external documentation. Hidden when empty. |
| `VITE_GITHUB_URL` | *(empty)* | URL to the GitHub repository. Hidden when empty. |

## Multi-Client Deployment

You can deploy separate instances for different clients from the same
codebase. Each deployment gets its own branding and preconfigured networks.

### With Netlify

1. Create a Netlify site per client, all pointing at the same repo.
2. Set client-specific environment variables on each site:

   **Moonbeam Explorer:**
   ```env
   VITE_APP_TITLE=Moonbeam Block Explorer
   VITE_APP_PRIMARY_COLOR="#5C34A2"
   VITE_APP_FAVICON_URL=https://docs.moonbeam.network/assets/images/logo.webp
   VITE_CHAINS_CONFIG='[{"name":"Moonbeam","chainId":1284,"rpcUrl":"https://rpc.api.moonbeam.network","wsUrl":"wss://wss.api.moonbeam.network"},{"name":"Moonriver","chainId":1285,"rpcUrl":"https://rpc.api.moonriver.moonbeam.network"},{"name":"Moonbase Alpha","chainId":1287,"rpcUrl":"https://rpc.api.moonbase.moonbeam.network","network":"testnet"}]'
   ```

   **Polkadot Explorer:**
   ```env
   VITE_APP_TITLE=Polkadot Block Explorer
   VITE_APP_PRIMARY_COLOR="#E6007A"
   VITE_CHAINS_CONFIG='[{"name":"Polkadot Hub","chainId":420420419,"rpcUrl":"https://eth-rpc.polkadot.io/","wsUrl":"wss://eth-rpc.polkadot.io/"},{"name":"Kusama Hub","chainId":420420418,"rpcUrl":"https://eth-rpc-kusama.polkadot.io/"}]'
   ```

3. Each site builds independently with its own variables baked in at build time.

### With Docker

```bash
docker build \
  --build-arg VITE_APP_PRIMARY_COLOR="#5C34A2" \
  --build-arg VITE_APP_TITLE="Moonbeam Explorer" \
  --build-arg 'VITE_CHAINS_CONFIG=[{"name":"Moonbeam","chainId":1284,"rpcUrl":"https://rpc.api.moonbeam.network"}]' \
  -t explorer-moonbeam .
```

## Example Configurations

### Moonbeam

```env
VITE_APP_TITLE=Moonbeam Block Explorer
VITE_APP_PRIMARY_COLOR="#5C34A2"
VITE_APP_CHART_COLOR_1="#5C34A2"
VITE_APP_CHART_COLOR_2="#00A3E0"
VITE_CHAINS_CONFIG='[{"name":"Moonbeam","chainId":1284,"rpcUrl":"https://rpc.api.moonbeam.network","wsUrl":"wss://wss.api.moonbeam.network","symbol":"GLMR"},{"name":"Moonriver","chainId":1285,"rpcUrl":"https://rpc.api.moonriver.moonbeam.network","symbol":"MOVR"},{"name":"Moonbase Alpha","chainId":1287,"rpcUrl":"https://rpc.api.moonbase.moonbeam.network","network":"testnet","symbol":"DEV"}]'
```

### Ethereum Mainnet (simple)

```env
VITE_DEFAULT_RPC_URL=https://ethereum-rpc.publicnode.com
VITE_DEFAULT_CHAIN_NAME=Ethereum
VITE_DEFAULT_CHAIN_ID=1
```

### Local Development (Hardhat / Anvil)

```env
VITE_DEFAULT_RPC_URL=http://127.0.0.1:8545
VITE_DEFAULT_CHAIN_NAME=Localhost
VITE_DEFAULT_CHAIN_ID=31337
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Vite development server with hot module replacement. |
| `pnpm build` | Type-check with `tsc` then produce a production build in `dist/`. |
| `pnpm preview` | Serve the production build locally for verification. |
| `pnpm test` | Run the test suite once with Vitest. |
| `pnpm test:watch` | Run Vitest in watch mode for continuous feedback during development. |

## Tech Stack

| Technology | Role |
|---|---|
| [Vite 6](https://vite.dev) | Build tool and dev server. |
| [React 19](https://react.dev) | UI library. |
| [TypeScript 5.7](https://www.typescriptlang.org) | Static type checking. |
| [viem 2](https://viem.sh) | Ethereum JSON-RPC client with batch HTTP and WebSocket transports. |
| [TanStack Query 5](https://tanstack.com/query) | Async server-state management with reorg-aware caching. |
| [Zustand 5](https://zustand.docs.pmnd.rs) | Lightweight client-state management. |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first CSS framework. |
| [shadcn/ui](https://ui.shadcn.com) | Accessible component primitives built on Radix UI. |
| [React Router 7](https://reactrouter.com) | Client-side routing. |
| [Recharts](https://recharts.org) | Composable chart library for React. |
| [Monaco Editor](https://microsoft.github.io/monaco-editor) | Code editor for raw JSON views. |
| [i18next](https://www.i18next.com) | Internationalization framework. |
| [Vitest](https://vitest.dev) | Unit and component testing. |

## License

MIT
