import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalSubscriptions />
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/block/:hashOrNumber" element={<ErrorBoundary><BlockDetailPage /></ErrorBoundary>} />
              <Route path="/block/:hashOrNumber/raw" element={<ErrorBoundary><BlockRawPage /></ErrorBoundary>} />
              <Route path="/blocks/:number" element={<ErrorBoundary><BlockListPage /></ErrorBoundary>} />
              <Route path="/blocks" element={<ErrorBoundary><BlockListPage /></ErrorBoundary>} />
              <Route path="/tx/:hash" element={<ErrorBoundary><TxDetailPage /></ErrorBoundary>} />
              <Route path="/tx/:hash/raw" element={<ErrorBoundary><TxRawPage /></ErrorBoundary>} />
              <Route path="/address/:address" element={<ErrorBoundary><AddressPage /></ErrorBoundary>} />
              <Route path="/stats/producers" element={<ErrorBoundary><ProducerStatsPage /></ErrorBoundary>} />
              <Route path="*" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">404</h1><p className="text-muted-foreground mt-2">Page not found</p></div>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
