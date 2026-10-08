import { StoryItem, LengthOption } from '@/hooks/useStories'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Globe, Shuffle, Plus, Clock, FileText, Loader2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StoryPickerProps {
  stories: StoryItem[]
  currentStory: StoryItem
  selectedLength: LengthOption
  isLoadingOnline: boolean
  onlineError: string | null
  mode: 'story' | 'timed'
  timeLimitSec: number
  onSelectStory: (id: string) => void
  onLengthChange: (length: LengthOption) => void
  onRandomStory: () => void
  onFetchWikipedia: () => void
  onOpenCustomDialog: () => void
  onModeChange: (mode: 'story' | 'timed', timeLimit?: number) => void
}

export function StoryPicker({
  stories,
  currentStory,
  selectedLength,
  isLoadingOnline,
  onlineError,
  mode,
  timeLimitSec,
  onSelectStory,
  onLengthChange,
  onRandomStory,
  onFetchWikipedia,
  onOpenCustomDialog,
  onModeChange,
}: StoryPickerProps) {
  return (
    <div className="space-y-4">
      {/* Upper Control Bar: Source & Modes */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-card/80 shadow-xs">
        {/* Story Selection & Random Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Story Selector Dropdown */}
          <div className="relative">
            <select
              value={currentStory.id}
              onChange={(e) => onSelectStory(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-3 pr-8 text-xs font-mono font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
            >
              {stories.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.title} ({story.author})
                </option>
              ))}
            </select>
            <BookOpen className="size-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Random Passage */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRandomStory}
            className="h-8.5 gap-1.5 font-mono text-xs"
            title="Pick a random literature story"
          >
            <Shuffle className="size-3.5" />
            <span className="hidden sm:inline">Random</span>
          </Button>

          {/* Wikipedia Online Fetch */}
          <Button
            variant="outline"
            size="sm"
            onClick={onFetchWikipedia}
            disabled={isLoadingOnline}
            className="h-8.5 gap-1.5 font-mono text-xs"
            title="Fetch a random Wikipedia summary"
          >
            {isLoadingOnline ? (
              <Loader2 className="size-3.5 animate-spin text-primary" />
            ) : (
              <Globe className="size-3.5 text-blue-500" />
            )}
            <span>Wiki</span>
          </Button>

          {/* Custom Text Dialog Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCustomDialog}
            className="h-8.5 gap-1.5 font-mono text-xs"
            title="Paste custom text to practice"
          >
            <Plus className="size-3.5" />
            <span>Custom</span>
          </Button>
        </div>

        {/* Filters: Mode & Length Selection */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Toggles */}
          <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
            <button
              onClick={() => onModeChange('story')}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
                mode === 'story'
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileText className="size-3" />
              <span>Full Story</span>
            </button>

            <button
              onClick={() => onModeChange('timed', 60)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
                mode === 'timed'
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Clock className="size-3" />
              <span>Timed {timeLimitSec}s</span>
            </button>
          </div>

          {/* Passage Length Toggles */}
          {mode === 'story' && (
            <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
              {(['short', 'medium', 'long'] as LengthOption[]).map((len) => (
                <button
                  key={len}
                  onClick={() => onLengthChange(len)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-mono uppercase transition-all cursor-pointer',
                    selectedLength === len
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {len}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Online Error Alert if any */}
      {onlineError && (
        <div className="text-xs font-mono p-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-between">
          <span>{onlineError}</span>
        </div>
      )}

      {/* Current Story Header Information */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{currentStory.title}</span>
          <span>•</span>
          <span>{currentStory.author}</span>
          {currentStory.category && (
            <Badge variant="notebook" className="text-[10px] py-0 px-1.5">
              {currentStory.category}
            </Badge>
          )}
        </div>

        {currentStory.attributionUrl && (
          <a
            href={currentStory.attributionUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            <span>Source Page</span>
            <ExternalLink className="size-3" />
          </a>
        )}
      </div>
    </div>
  )
}
