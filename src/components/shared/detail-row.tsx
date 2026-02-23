import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 border-b px-4 py-3 last:border-b-0">
      <span className="text-muted-foreground text-sm font-medium">{label}</span>
      <span className="text-sm break-all">{children}</span>
    </div>
  )
}

export function SkeletonDetail({ rows }: { rows: number }) {
  return (
    <Card className="py-4">
      <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
      <CardContent>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="grid grid-cols-[180px_1fr] gap-4 border-b px-4 py-3 last:border-b-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
