import { useParams, Link } from 'react-router-dom'
import { isAddress } from 'viem'
import { usePageTitle } from '@/hooks/use-page-title'
import { truncateAddress } from '@/lib/formatters'
import { useAddress } from '@/hooks/use-address'
import { useAppStore } from '@/stores/app-store'
import { AddressInfo } from '@/components/address/address-info'
import { AddressTxList } from '@/components/address/address-tx-list'
import { Card, CardContent } from '@/components/ui/card'

export default function AddressPage() {
  const { address } = useParams()
  usePageTitle(address ? `Address ${truncateAddress(address)}` : 'Address')
  const { data, isLoading, error } = useAddress(address)
  const currencySymbol = useAppStore((s) => s.selectedChain.nativeCurrency.symbol)

  const valid = !!address && isAddress(address)

  if (!valid) {
    return (
      <div className="space-y-4 p-6">
        <Link to="/" className="text-primary text-sm hover:underline">
          &larr; Back to dashboard
        </Link>
        <Card className="py-4">
          <CardContent>
            <p className="text-destructive">
              Invalid Ethereum address.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 p-6">
        <Link to="/" className="text-primary text-sm hover:underline">
          &larr; Back to dashboard
        </Link>
        <Card className="py-4">
          <CardContent>
            <p className="text-destructive">
              Failed to load address data. The address may not exist or the RPC endpoint may be unreachable.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <Link to="/" className="text-primary text-sm hover:underline">
        &larr; Back to dashboard
      </Link>

      <AddressInfo
        address={address}
        balance={data?.balance}
        nonce={data?.nonce}
        code={data?.code}
        loading={isLoading}
        currencySymbol={currencySymbol}
      />

      <AddressTxList address={address} />
    </div>
  )
}
