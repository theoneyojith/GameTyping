import { TypingMetrics } from '@/engine/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX, RotateCcw, Zap, Target, Timer, AlertCircle } from 'lucide-react'

interface StatsBarProps {
  metrics: TypingMetrics
  mode: 'story' | 'timed'
  timeRemaining?: number | null
  soundActive: boolean
  onToggleSound: () => void
  onReset: () => void
}

export function StatsBar({
  metrics,
  mode,
  timeRemaining,
  soundActive,
  onToggleSound,
  onReset,
}: StatsBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-card/70 backdrop-blur-xs shadow-xs">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-6 font-mono">
          {/* WPM */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
              <Zap className="size-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Speed</div>
              <div className="text-xl font-bold leading-none">
                {metrics.wpm} <span className="text-xs font-normal text-muted-foreground">WPM</span>
              </div>
            </div>
          </div>

          {/* Accuracy */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-accent/30 text-accent-foreground">
              <Target className="size-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Accuracy</div>
              <div className="text-xl font-bold leading-none">
                {metrics.accuracy}<span className="text-xs font-normal text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Time / Timer */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-secondary text-secondary-foreground">
              <Timer className="size-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {mode === 'timed' ? 'Time Left' : 'Time'}
              </div>
              <div className="text-xl font-bold leading-none">
                {mode === 'timed' ? `${timeRemaining ?? 0}s` : `${metrics.elapsedSeconds}s`}
              </div>
            </div>
          </div>

          {/* Errors */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-destructive/10 text-destructive">
              <AlertCircle className="size-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Mistakes</div>
              <div className="text-xl font-bold leading-none text-destructive">
                {metrics.errorChars}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSound}
            className="h-8 px-2.5 font-mono text-xs text-muted-foreground hover:text-foreground"
            title={soundActive ? 'Mute key audio' : 'Enable key audio'}
          >
            {soundActive ? <Volume2 className="size-4 text-primary" /> : <VolumeX className="size-4 text-muted-foreground" />}
            <span className="hidden sm:inline ml-1">{soundActive ? 'Sound On' : 'Muted'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-8 gap-1.5 font-mono text-xs"
            title="Restart session (Esc)"
          >
            <RotateCcw className="size-3.5" />
            <span>Restart</span>
          </Button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="space-y-1">
        <Progress value={metrics.progressPercent} className="h-2" />
        <div className="flex justify-between text-[11px] font-mono text-muted-foreground px-1">
          <span>{metrics.correctChars} chars typed</span>
          <span>{metrics.progressPercent}% completed</span>
        </div>
      </div>
    </div>
  )
}
