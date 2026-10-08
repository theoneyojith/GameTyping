import { useState, useEffect, useCallback } from 'react'
import { useStories } from '@/hooks/useStories'
import { useTypingSession } from '@/hooks/useTypingSession'
import { getUserStats, UserStats } from '@/lib/storage'
import { StoryPicker } from '@/components/StoryPicker'
import { TextDisplay } from '@/components/TextDisplay'
import { StatsBar } from '@/components/StatsBar'
import { ResultCard } from '@/components/ResultCard'
import { CustomTextDialog } from '@/components/CustomTextDialog'
import { HistoryModal } from '@/components/HistoryModal'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Keyboard,
  BarChart2,
  Trophy,
  Sparkles,
  Info,
} from 'lucide-react'

export default function App() {
  const [mode, setMode] = useState<'story' | 'timed'>('story')
  const [timeLimitSec, setTimeLimitSec] = useState<number>(60)
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState<boolean>(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false)
  const [userStats, setUserStats] = useState<UserStats>({
    totalTests: 0,
    topWpm: 0,
    averageWpm: 0,
    topAccuracy: 0,
    averageAccuracy: 0,
    totalTimeSec: 0,
    totalWordsTyped: 0,
  })

  // Stories hook
  const {
    stories,
    currentStory,
    selectedLength,
    isLoadingOnline,
    onlineError,
    setSelectedLength,
    selectStoryById,
    nextStory,
    randomStory,
    setCustomStory,
    fetchWikipediaStory,
  } = useStories()

  // Typing session hook
  const {
    engineState,
    metrics,
    charStates,
    isFocused,
    timeRemaining,
    soundActive,
    hiddenInputRef,
    setIsFocused,
    handleKeyDown,
    resetSession,
    toggleSound,
  } = useTypingSession({
    targetText: currentStory.text,
    storyId: currentStory.id,
    storyTitle: currentStory.title,
    author: currentStory.author,
    mode,
    timeLimitSec,
  })

  // Refresh user stats whenever a test completes or modal opens
  const refreshStats = useCallback(() => {
    setUserStats(getUserStats())
  }, [])

  useEffect(() => {
    refreshStats()
  }, [engineState.isComplete, refreshStats])

  const handleModeChange = (newMode: 'story' | 'timed', timeLimit: number = 60) => {
    setMode(newMode)
    setTimeLimitSec(timeLimit)
    resetSession()
  }

  // Keyboard shortcut listener for Tab -> Next Story and Esc -> Restart
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (isCustomDialogOpen || isHistoryModalOpen) return

      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        nextStory()
      }
    }

    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [nextStory, isCustomDialogOpen, isHistoryModalOpen])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      {/* Header */}
      <header className="border-b border-border/70 bg-card/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-xs">
              <Keyboard className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight font-sans">TypeCraft</h1>
                <Badge variant="notebook" className="hidden sm:inline-flex text-[10px] py-0 px-1.5 font-mono">
                  Notebook
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground font-mono hidden sm:block">
                Literature & Classic Passage Typing
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-2">
            {userStats.topWpm > 0 && (
              <Badge variant="outline" className="hidden md:inline-flex gap-1.5 py-1 font-mono text-xs">
                <Trophy className="size-3 text-amber-500" />
                <span>Best: {userStats.topWpm} WPM</span>
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refreshStats()
                setIsHistoryModalOpen(true)
              }}
              className="h-8 gap-1.5 font-mono text-xs"
              title="View your typing analytics and history"
            >
              <BarChart2 className="size-3.5 text-primary" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Typing Workspace */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Story Selector & Options */}
        <StoryPicker
          stories={stories}
          currentStory={currentStory}
          selectedLength={selectedLength}
          isLoadingOnline={isLoadingOnline}
          onlineError={onlineError}
          mode={mode}
          timeLimitSec={timeLimitSec}
          onSelectStory={selectStoryById}
          onLengthChange={setSelectedLength}
          onRandomStory={randomStory}
          onFetchWikipedia={fetchWikipediaStory}
          onOpenCustomDialog={() => setIsCustomDialogOpen(true)}
          onModeChange={handleModeChange}
        />

        {/* Live Stats Bar */}
        <StatsBar
          metrics={metrics}
          mode={mode}
          timeRemaining={timeRemaining}
          soundActive={soundActive}
          onToggleSound={toggleSound}
          onReset={resetSession}
        />

        {/* Core Typing Area / Results View */}
        {engineState.isComplete ? (
          <ResultCard
            metrics={metrics}
            samples={engineState.samples}
            weakKeys={engineState.weakKeys}
            storyTitle={currentStory.title}
            author={currentStory.author}
            onReset={resetSession}
            onNextStory={nextStory}
            onOpenHistory={() => setIsHistoryModalOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            <TextDisplay
              charStates={charStates}
              currentIndex={engineState.currentIndex}
              isFocused={isFocused}
              hiddenInputRef={hiddenInputRef}
              onFocusChange={setIsFocused}
              onKeyDown={handleKeyDown}
            />

            {/* Quick Keyboard Shortcuts Footer */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-muted-foreground px-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/40 font-mono text-[10px]">
                    Esc
                  </kbd>
                  <span>Restart</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted/40 font-mono text-[10px]">
                    Tab
                  </kbd>
                  <span>Next Story</span>
                </span>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1">
                <Info className="size-3" />
                <span>Timer starts automatically on first keystroke</span>
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 py-4 mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-primary" />
            <span>TypeCraft • Notebook Theme with Pure Typing Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Public Domain Classics & Wikipedia REST API</span>
          </div>
        </div>
      </footer>

      {/* Dialog Modals */}
      <CustomTextDialog
        isOpen={isCustomDialogOpen}
        onClose={() => setIsCustomDialogOpen(false)}
        onSubmit={(title, author, text) => {
          setCustomStory(title, author, text)
          resetSession()
        }}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </div>
  )
}
