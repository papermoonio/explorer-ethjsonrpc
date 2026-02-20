import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  loading?: boolean
  className?: string
}

export function StatCard({ label, value, icon, loading, className }: StatCardProps) {
  return (
    <Card className={cn('py-4', className)}>
      <CardContent className="flex items-center gap-3 px-4">
        {icon && (
          <div className="text-muted-foreground shrink-0">{icon}</div>
        )}
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">{label}</p>
          {loading ? (
            <Skeleton className="mt-1 h-5 w-24" />
          ) : (
            <p className="truncate text-lg font-semibold">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
