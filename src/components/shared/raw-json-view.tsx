import Editor from '@monaco-editor/react'
import { useResolvedTheme } from '@/stores/app-store'
import { Skeleton } from '@/components/ui/skeleton'
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
  const theme = useResolvedTheme()
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'light'
  let json: string
  try {
    json = JSON.stringify(data, bigIntReplacer, 2)
  } catch {
    json = '// Error: unable to serialize data'
  }

  return (
    <div className={cn('h-[600px]', className)}>
      <Editor
        language="json"
        value={json}
        theme={monacoTheme}
        loading={<Skeleton className="h-full w-full" />}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          fontSize: 13,
          wordWrap: 'on',
        }}
      />
    </div>
  )
}
