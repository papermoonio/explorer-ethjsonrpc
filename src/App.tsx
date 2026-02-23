import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import Dashboard from '@/pages/dashboard'
import BlockDetailPage from '@/pages/block-detail-page'
import BlockRawPage from '@/pages/block-raw-page'
import BlockListPage from '@/pages/block-list-page'
import TxDetailPage from '@/pages/tx-detail-page'
import TxRawPage from '@/pages/tx-raw-page'
import AddressPage from '@/pages/address-page'
import ProducerStatsPage from '@/pages/producer-stats-page'
import { useBlockSubscription } from '@/hooks/use-block-subscription'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

/** Headless component that activates global WebSocket subscriptions. */
function GlobalSubscriptions() {
  useBlockSubscription()
  return null
}

/** Layout route that wraps all page content in an ErrorBoundary. */
function PageLayout() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSubscriptions />
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route element={<PageLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/block/:hashOrNumber" element={<BlockDetailPage />} />
                <Route path="/block/:hashOrNumber/raw" element={<BlockRawPage />} />
                <Route path="/blocks/:number" element={<BlockListPage />} />
                <Route path="/blocks" element={<BlockListPage />} />
                <Route path="/tx/:hash" element={<TxDetailPage />} />
                <Route path="/tx/:hash/raw" element={<TxRawPage />} />
                <Route path="/address/:address" element={<AddressPage />} />
                <Route path="/stats/producers" element={<ProducerStatsPage />} />
                <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">404</h1><p className="text-muted-foreground mt-2">Page not found</p></div>} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
