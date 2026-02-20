import { Link } from 'react-router-dom'
import { truncateAddress } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface AddressLinkProps {
  address: string
  truncate?: boolean
  className?: string
}

export function AddressLink({ address, truncate = true, className }: AddressLinkProps) {
  const displayText = truncate ? truncateAddress(address) : address

  return (
    <Link
      to={`/address/${encodeURIComponent(address)}`}
      title={address}
      className={cn('text-primary hover:underline font-mono text-sm', className)}
    >
      {displayText}
    </Link>
  )
}
