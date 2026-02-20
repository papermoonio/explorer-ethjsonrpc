import { Link } from 'react-router-dom'
import { truncateHash } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface TxLinkProps {
  hash: string
  truncate?: boolean
  className?: string
}

export function TxLink({ hash, truncate = true, className }: TxLinkProps) {
  const displayText = truncate ? truncateHash(hash) : hash

  return (
    <Link
      to={`/tx/${encodeURIComponent(hash)}`}
      title={hash}
      className={cn('text-primary hover:underline font-mono text-sm', className)}
    >
      {displayText}
    </Link>
  )
}
