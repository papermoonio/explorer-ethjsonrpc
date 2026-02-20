import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { truncateHash } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface HashDisplayProps {
  hash: string
  truncate?: boolean
  className?: string
}

export function HashDisplay({ hash, truncate = true, className }: HashDisplayProps) {
  const [copied, setCopied] = useState(false)

  const displayText = truncate ? truncateHash(hash) : hash

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(hash)
      toast.success('Copied!')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const Icon = copied ? Check : Copy

  return (
    <span className={cn('inline-flex items-center gap-1 font-mono text-sm', className)}>
      <span>{displayText}</span>
      <button
        type="button"
        onClick={handleCopy}
        className="text-muted-foreground hover:text-foreground inline-flex shrink-0 cursor-pointer p-0.5"
        aria-label="Copy hash"
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
    </span>
  )
}
