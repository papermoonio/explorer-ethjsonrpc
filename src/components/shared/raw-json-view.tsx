import { useRef, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface RawJsonViewProps {
  data: unknown
  className?: string
}

function bigIntReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') return `${value}n`
  return value
}

export function RawJsonView({ data, className }: RawJsonViewProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const json = useMemo(() => {
    try {
      return JSON.stringify(data, bigIntReplacer, 2)
    } catch {
      return '// Error: unable to serialize data'
    }
  }, [data])

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(json)
  }, [json])

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-3 top-3 rounded border bg-card px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        Copy
      </button>
      <pre
        ref={preRef}
        className="h-[600px] overflow-auto rounded-xl border bg-card p-4 text-[13px] leading-relaxed"
      >
        {json}
      </pre>
    </div>
  )
}
