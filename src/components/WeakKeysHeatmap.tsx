import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

interface WeakKeysHeatmapProps {
  weakKeys: Record<string, number>
}

export function WeakKeysHeatmap({ weakKeys }: WeakKeysHeatmapProps) {
  const entries = Object.entries(weakKeys).sort((a, b) => b[1] - a[1])

  if (entries.length === 0) {
    return (
      <div className="p-6 text-center text-xs font-mono text-muted-foreground border border-dashed rounded-xl border-border/80">
        No typo data recorded yet. Complete typing tests to see key error patterns!
      </div>
    )
  }

  const maxCount = Math.max(...entries.map(([, count]) => count), 1)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
        <AlertCircle className="size-4 text-amber-500" />
        <span>Keys with highest typo frequency (practice targets):</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {entries.slice(0, 12).map(([key, count]) => {
          const intensity = Math.min(100, Math.round((count / maxCount) * 100))
          return (
            <div
              key={key}
              className="p-3 rounded-lg border border-border/80 bg-card/60 flex items-center justify-between font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
                  {key === ' ' ? 'Space' : key}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-destructive">{count} errors</div>
                <div className="text-[10px] text-muted-foreground">{intensity}% relative</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-1.5 pt-2">
        <span className="text-[11px] font-mono text-muted-foreground mr-2">All Keys:</span>
        {entries.map(([key, count]) => (
          <Badge key={key} variant="notebook" className="text-[10px] py-0.5 px-2">
            <span className="font-bold text-foreground">{key}</span>: {count}
          </Badge>
        ))}
      </div>
    </div>
  )
}
