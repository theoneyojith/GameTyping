import { useState } from 'react'
import { TypingMetrics, WpmSample } from '@/engine/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, RotateCcw, ArrowRight, Share2, Check, BarChart2 } from 'lucide-react'

interface ResultCardProps {
  metrics: TypingMetrics
  samples: WpmSample[]
  weakKeys: Record<string, number>
  storyTitle: string
  author: string
  onReset: () => void
  onNextStory: () => void
  onOpenHistory: () => void
}

export function ResultCard({
  metrics,
  samples,
  weakKeys,
  storyTitle,
  author,
  onReset,
  onNextStory,
  onOpenHistory,
}: ResultCardProps) {
  const [copied, setCopied] = useState(false)

  // Determine Rank / Grade
  let rank = 'Novice'
  let rankColor = 'bg-secondary text-secondary-foreground'
  let rankBadge = 'C'

  if (metrics.wpm >= 95 && metrics.accuracy >= 98) {
    rank = 'Grandmaster'
    rankColor = 'bg-primary text-primary-foreground'
    rankBadge = 'S+'
  } else if (metrics.wpm >= 80 && metrics.accuracy >= 96) {
    rank = 'Master Typist'
    rankColor = 'bg-primary/90 text-primary-foreground'
    rankBadge = 'S'
  } else if (metrics.wpm >= 60 && metrics.accuracy >= 94) {
    rank = 'Expert'
    rankColor = 'bg-accent text-accent-foreground'
    rankBadge = 'A'
  } else if (metrics.wpm >= 40 && metrics.accuracy >= 90) {
    rank = 'Proficient'
    rankColor = 'bg-secondary text-secondary-foreground'
    rankBadge = 'B'
  }

  // Sorted weak keys
  const sortedWeakKeys = Object.entries(weakKeys)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Render SVG Sparkline
  const renderSparkline = () => {
    if (samples.length < 2) return null

    const maxWpm = Math.max(...samples.map((s) => s.wpm), 30)
    const width = 360
    const height = 80
    const padding = 10

    const points = samples.map((sample, idx) => {
      const x = padding + (idx / (samples.length - 1)) * (width - 2 * padding)
      const y = height - padding - (sample.wpm / maxWpm) * (height - 2 * padding)
      return `${x},${y}`
    })

    const pathData = `M ${points.join(' L ')}`

    return (
      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
          <span>Speed Trend Over Time</span>
          <span>Peak: {maxWpm} WPM</span>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/20 p-2 flex justify-center">
          <svg width={width} height={height} className="w-full h-20 overflow-visible">
            {/* Grid line */}
            <line
              x1="0"
              y1={height - padding}
              x2={width}
              y2={height - padding}
              stroke="currentColor"
              className="text-border/40"
              strokeDasharray="4"
            />
            {/* Speed curve */}
            <path
              d={pathData}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            />
          </svg>
        </div>
      </div>
    )
  }

  const handleShare = () => {
    const text = `I just typed "${storyTitle}" at ${metrics.wpm} WPM with ${metrics.accuracy}% accuracy on TypeCraft Notebook!`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="border-2 border-primary/40 shadow-xl overflow-hidden animate-in fade-in-50 duration-300">
      <CardHeader className="bg-muted/30 border-b border-border/60 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              <CardTitle className="text-xl font-sans">Passage Completed!</CardTitle>
            </div>
            <CardDescription className="font-mono text-xs mt-1">
              "{storyTitle}" by {author}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">Grade:</span>
            <div className={`px-2.5 py-1 rounded-md font-mono font-bold text-sm ${rankColor}`}>
              {rankBadge} ({rank})
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <div className="text-xs font-mono text-muted-foreground uppercase">Net Speed</div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-primary mt-1">
              {metrics.wpm}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">WPM</div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <div className="text-xs font-mono text-muted-foreground uppercase">Accuracy</div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-foreground mt-1">
              {metrics.accuracy}%
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
              {metrics.errorChars} errors
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <div className="text-xs font-mono text-muted-foreground uppercase">Raw Speed</div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-muted-foreground mt-1">
              {metrics.rawWpm}
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">Raw WPM</div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
            <div className="text-xs font-mono text-muted-foreground uppercase">Time</div>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-foreground mt-1">
              {metrics.elapsedSeconds}s
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
              {metrics.totalKeystrokes} keystrokes
            </div>
          </div>
        </div>

        {/* Speed Trend Chart */}
        {renderSparkline()}

        {/* Weak Keys Section */}
        {sortedWeakKeys.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
            <div className="text-xs font-mono font-medium text-foreground flex items-center justify-between">
              <span>Keys to Practice (Typos Detected)</span>
              <span className="text-[11px] text-muted-foreground">Frequency</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {sortedWeakKeys.map(([key, count]) => (
                <Badge key={key} variant="notebook" className="gap-1.5 py-1 px-2.5">
                  <span className="font-bold text-destructive font-mono">
                    {key === ' ' ? 'Space' : `"${key}"`}
                  </span>
                  <span className="text-muted-foreground text-[10px]">({count}x)</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-muted/20 border-t border-border/60 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={onReset} className="gap-2">
            <RotateCcw className="size-4" />
            <span>Try Again</span>
          </Button>

          <Button variant="outline" onClick={onNextStory} className="gap-2 font-mono">
            <span>Next Passage</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onOpenHistory} className="gap-1.5 font-mono text-xs">
            <BarChart2 className="size-4" />
            <span>Analytics</span>
          </Button>

          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1.5 font-mono text-xs">
            {copied ? <Check className="size-4 text-green-600" /> : <Share2 className="size-4" />}
            <span>{copied ? 'Copied Link' : 'Share'}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
