import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAppStore } from '@/stores/app-store'
import { removeViemClient } from '@/lib/viem-client'
import { removeWsClient } from '@/lib/ws-client'
import { detectProtocol, testEndpoint, testHttpRpc } from '@/lib/chain-test'
import { defaultChains, type Chain } from '@/config/chains'

interface AddChainDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddChainDialog({ open, onOpenChange }: AddChainDialogProps) {
  const { t } = useTranslation()
  const addCustomChain = useAppStore((s) => s.addCustomChain)
  const customChains = useAppStore((s) => s.customChains)

  const [endpointUrl, setEndpointUrl] = useState('')
  const [name, setName] = useState('')
  const [chainId, setChainId] = useState('')
  const [rpcUrl, setRpcUrl] = useState('')
  const [wsUrl, setWsUrl] = useState('')
  const [symbol, setSymbol] = useState('ETH')
  const [network, setNetwork] = useState<Chain['network']>('mainnet')
  const [testing, setTesting] = useState(false)
  const [testPassed, setTestPassed] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  /** Remove cached clients that were created during testing but never saved. */
  function cleanupTestedClients() {
    if (rpcUrl) removeViemClient(rpcUrl)
    if (wsUrl) removeWsClient(wsUrl).catch(() => {})
  }

  function resetForm(cleanup = true) {
    if (cleanup) cleanupTestedClients()
    setEndpointUrl('')
    setName('')
    setChainId('')
    setRpcUrl('')
    setWsUrl('')
    setSymbol('ETH')
    setNetwork('mainnet')
    setTesting(false)
    setTestPassed(false)
    setShowDetails(false)
  }

  async function handleTest() {
    setTesting(true)
    setTestPassed(false)

    // If details are visible, re-test the HTTP RPC URL
    if (showDetails && rpcUrl) {
      try {
        const remoteChainId = await testHttpRpc(rpcUrl)
        setChainId(String(remoteChainId))
        setTestPassed(true)
        toast.success(t('chain.testSuccess'))
      } catch {
        toast.error(t('chain.testFailed'))
      } finally {
        setTesting(false)
      }
      return
    }

    const url = endpointUrl.trim()
    if (!detectProtocol(url)) {
      toast.error(t('chain.invalidProtocol'))
      setTesting(false)
      return
    }

    try {
      const result = await testEndpoint(url)
      setChainId(String(result.chainId))
      setRpcUrl(result.rpcUrl)
      setWsUrl(result.wsUrl)
      setShowDetails(true)

      if (result.rpcUrl) {
        setTestPassed(true)
        toast.success(t('chain.testSuccess'))
      } else {
        toast.info(t('chain.httpRequired'))
      }
    } catch {
      toast.error(t('chain.testFailed'))
    } finally {
      setTesting(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const id = parseInt(chainId, 10)
    if (!name || !Number.isFinite(id) || id <= 0 || !rpcUrl) return

    if (defaultChains.some((c) => c.id === id) || customChains.some((c) => c.id === id)) {
      toast.error(`Chain ID ${id} already exists`)
      return
    }

    const chain: Chain = {
      id,
      name: name.toLowerCase().replace(/\s+/g, '-'),
      displayName: name,
      rpcUrl,
      wsUrl: wsUrl || undefined,
      network,
      nativeCurrency: { name: symbol, symbol, decimals: 18 },
    }

    addCustomChain(chain)
    toast.success(t('chain.saved'))
    resetForm(false) // skip cleanup — clients are now in use by the saved chain
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('chain.addTitle')}</DialogTitle>
          <DialogDescription>{t('chain.addDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Input
            placeholder={t('chain.endpointUrl')}
            type="url"
            value={endpointUrl}
            onChange={(e) => { setEndpointUrl(e.target.value); setTestPassed(false); setShowDetails(false) }}
            required
          />
          {!showDetails && (
            <Button
              type="button"
              variant="outline"
              onClick={handleTest}
              disabled={!endpointUrl.trim() || testing}
            >
              {testing ? t('chain.testing') : t('chain.testConnection')}
            </Button>
          )}

          {showDetails && (
            <>
              <Input
                placeholder={t('chain.httpRpcUrl')}
                type="url"
                value={rpcUrl}
                onChange={(e) => { setRpcUrl(e.target.value); setTestPassed(false) }}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTest}
                disabled={!rpcUrl.trim() || testing}
              >
                {testing ? t('chain.testing') : t('chain.testConnection')}
              </Button>
              {testPassed && (
                <Input
                  placeholder={t('chain.chainId')}
                  type="number"
                  value={chainId}
                  disabled
                />
              )}
              <Input
                placeholder={t('chain.name')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                placeholder={t('chain.symbol')}
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
              />
              <Select value={network} onValueChange={(v) => setNetwork(v as Chain['network'])}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('chain.networkType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mainnet">{t('chain.mainnet')}</SelectItem>
                  <SelectItem value="testnet">{t('chain.testnet')}</SelectItem>
                  <SelectItem value="devnet">{t('chain.devnet')}</SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button type="submit" disabled={!testPassed}>{t('chain.save')}</Button>
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
