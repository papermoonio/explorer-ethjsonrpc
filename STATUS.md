# STATUS.md — WebSocket Block Subscriptions

## Current Phase: COMPLETE
## Overall Progress: 5/5 phases complete

| Phase | Status | Notes |
|-------|--------|-------|
| 1. Chain Type + Config | DONE | wsUrl field, 3s polling, env var |
| 2. WebSocket Client Module | DONE | ws-client.ts with cache |
| 3. Block Subscription Hook | DONE | useBlockSubscription + GlobalSubscriptions |
| 4. Add Chain Dialog UI | DONE | Optional wsUrl input + validation |
| 5. Tests + Docs | DONE | 10 new tests, README updated |

## Final Stats
- Build: passing
- Tests: 47/47 passing (37 existing + 10 new)
- New files: 3 (ws-client.ts, use-block-subscription.ts, ws-client.test.ts)
- Modified files: 6 (chains.ts, env.ts, .env.example, App.tsx, app-store.ts, add-chain-dialog.tsx, en.ts, README.md)
