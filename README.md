# Explorer JSON-RPC

A lightweight Ethereum block explorer that communicates directly with any
EVM-compatible JSON-RPC endpoint. No backend server or indexer is required --
the browser talks to the RPC node over HTTP and renders everything client-side.

## Features

- Direct JSON-RPC communication (no backend, no indexer)
- Multi-network support via environment variables
- Real-time block updates via WebSocket subscriptions (with HTTP polling fallback)
- Per-deployment branding (logo, favicon, colors, title text)
- Dashboard with network stats and block charts
- Block list and block detail pages with pagination
- Transaction detail pages with receipt display
- Address pages with balance, nonce, contract detection, and recent activity
- Block producer statistics with pie chart visualization
- Light/dark theme with system preference detection
- Responsive design
- Custom chain management (add and remove RPC endpoints at runtime)
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

### Branding

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_TITLE` | `Block Explorer` | Page title shown in the browser tab and header. |
| `VITE_APP_LOGO_URL` | *(empty)* | URL or path to a logo image displayed in the header. |
| `VITE_APP_FAVICON_URL` | *(empty)* | URL or path to a custom favicon. |
| `VITE_APP_DESCRIPTION` | *(empty)* | Meta description used for SEO and social previews. `.env.example` provides a suggested value. |
| `VITE_APP_PRIMARY_COLOR` | `#6366f1` | Primary brand color used for buttons and accents. |
| `VITE_APP_SECONDARY_COLOR` | `#8b5cf6` | Secondary brand color used for gradients and highlights. |

### Chain Defaults

| Variable | Default | Description |
|---|---|---|
| `VITE_DEFAULT_RPC_URL` | `https://ethereum-rpc.publicnode.com` | JSON-RPC HTTP endpoint the explorer connects to on first load. |
| `VITE_DEFAULT_CHAIN_NAME` | `Ethereum` | Display name for the default chain. |
| `VITE_DEFAULT_CHAIN_ID` | `1` | EIP-155 chain ID for the default network. |
| `VITE_DEFAULT_WS_URL` | *(empty)* | Optional WebSocket endpoint (`wss://...`) for real-time block subscriptions. When set, new blocks appear instantly instead of polling. |

### External Links

| Variable | Default | Description |
|---|---|---|
| `VITE_DOCS_URL` | *(empty)* | URL to external documentation. Hidden when empty. |
| `VITE_GITHUB_URL` | *(empty)* | URL to the GitHub repository. Hidden when empty. |

## Deployment to Netlify

### Single-site deployment

1. Fork or clone this repository.
2. In the Netlify dashboard, click **Add new site > Import an existing project** and connect your repo.
3. Netlify will auto-detect the build settings from `netlify.toml` (`pnpm build`, publish `dist`).
4. Under **Site configuration > Environment variables**, add the `VITE_*` variables for your target network.
5. Trigger a deploy. The site will be available at your Netlify URL.

### Multi-network deployment

You can run separate Netlify sites for different networks -- for example
`eth-explorer.netlify.app` and `polygon-explorer.netlify.app` -- from the same
repository.

1. Create a new Netlify site for each network, all pointing at the same repo.
2. Set network-specific environment variables on each site:

   **eth-explorer** site:
   ```
   VITE_DEFAULT_RPC_URL=https://ethereum-rpc.publicnode.com
   VITE_DEFAULT_CHAIN_NAME=Ethereum
   VITE_DEFAULT_CHAIN_ID=1
   ```

   **polygon-explorer** site:
   ```
   VITE_DEFAULT_RPC_URL=https://polygon-bor-rpc.publicnode.com
   VITE_DEFAULT_CHAIN_NAME=Polygon
   VITE_DEFAULT_CHAIN_ID=137
   ```

3. Each site builds independently with its own variables baked in at build time.

Alternatively, you can use **branch-based deploys** with per-branch `.env`
files if you prefer to keep configuration in the repository rather than the
Netlify dashboard.

## Example Configurations

### Ethereum Mainnet

```env
VITE_DEFAULT_RPC_URL=https://ethereum-rpc.publicnode.com
VITE_DEFAULT_CHAIN_NAME=Ethereum
VITE_DEFAULT_CHAIN_ID=1
```

### Polygon

```env
VITE_DEFAULT_RPC_URL=https://polygon-bor-rpc.publicnode.com
VITE_DEFAULT_CHAIN_NAME=Polygon
VITE_DEFAULT_CHAIN_ID=137
```

### Arbitrum One

```env
VITE_DEFAULT_RPC_URL=https://arbitrum-one-rpc.publicnode.com
VITE_DEFAULT_CHAIN_NAME=Arbitrum One
VITE_DEFAULT_CHAIN_ID=42161
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
| [viem 2](https://viem.sh) | Ethereum JSON-RPC client with batch HTTP transport. |
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
