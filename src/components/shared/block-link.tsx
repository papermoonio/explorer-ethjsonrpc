import { Link } from 'react-router-dom'
import { formatNumber, truncateHash } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface BlockLinkProps {
  blockNumber?: bigint | number
  blockHash?: string
  className?: string
}

export function BlockLink({ blockNumber, blockHash, className }: BlockLinkProps) {
  const target = blockNumber != null ? String(blockNumber) : blockHash
  if (!target) return null

  const displayText =
    blockNumber != null ? formatNumber(blockNumber) : truncateHash(blockHash)

  return (
    <Link
      to={`/block/${encodeURIComponent(target)}`}
      title={target}
      className={cn('text-primary hover:underline font-mono text-sm', className)}
    >
      {displayText}
    </Link>
  )
}
