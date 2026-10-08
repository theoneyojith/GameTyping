import { useState, useEffect } from 'react'
import {
  getSessions,
  getUserStats,
  getAggregatedWeakKeys,
  clearSessions,
  TypingSessionRecord,
  UserStats,
} from '@/lib/storage'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { WeakKeysHeatmap } from '@/components/WeakKeysHeatmap'
import { X, Trophy, Trash2, Clock, Zap, Target, BookOpen, Layers } from 'lucide-react'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [sessions, setSessions] = useState<TypingSessionRecord[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalTests: 0,
    topWpm: 0,
    averageWpm: 0,
    topAccuracy: 0,
    averageAccuracy: 0,
    totalTimeSec: 0,
    totalWordsTyped: 0,
  })
  const [aggregatedWeakKeys, setAggregatedWeakKeys] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<'sessions' | 'heatmap'>('sessions')

  useEffect(() => {
    if (isOpen) {
      setSessions(getSessions())
      setStats(getUserStats())
      setAggregatedWeakKeys(getAggregatedWeakKeys())
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your typing history and stats?')) {
      clearSessions()
      setSessions([])
      setStats(getUserStats())
      setAggregatedWeakKeys({})
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
      <Card className="w-full max-w-2xl border-2 border-border shadow-2xl bg-card max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="size-5 text-amber-500" />
              <CardTitle className="text-xl font-sans">Typing Analytics & History</CardTitle>
            </div>
            <CardDescription className="font-mono text-xs mt-1">
              Your personal performance analytics across all sessions
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-8 rounded-full"
          >
            <X className="size-4" />
          </Button>
        </CardHeader>

        {/* Stats Highlights Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-muted/20 border-b border-border/60 shrink-0">
          <div className="p-2.5 rounded-lg bg-card border border-border text-center font-mono">
            <div className="text-[10px] text-muted-foreground uppercase flex items-center justify-center gap-1">
              <Zap className="size-3 text-primary" /> Top Speed
            </div>
            <div className="text-2xl font-bold text-primary mt-0.5">{stats.topWpm}</div>
            <div className="text-[10px] text-muted-foreground">WPM (Avg: {stats.averageWpm})</div>
          </div>

          <div className="p-2.5 rounded-lg bg-card border border-border text-center font-mono">
            <div className="text-[10px] text-muted-foreground uppercase flex items-center justify-center gap-1">
              <Target className="size-3 text-foreground" /> Top Accuracy
            </div>
            <div className="text-2xl font-bold text-foreground mt-0.5">{stats.topAccuracy}%</div>
            <div className="text-[10px] text-muted-foreground">Avg: {stats.averageAccuracy}%</div>
          </div>

          <div className="p-2.5 rounded-lg bg-card border border-border text-center font-mono">
            <div className="text-[10px] text-muted-foreground uppercase flex items-center justify-center gap-1">
              <BookOpen className="size-3 text-secondary-foreground" /> Tests Done
            </div>
            <div className="text-2xl font-bold text-foreground mt-0.5">{stats.totalTests}</div>
            <div className="text-[10px] text-muted-foreground">{stats.totalWordsTyped} words</div>
          </div>

          <div className="p-2.5 rounded-lg bg-card border border-border text-center font-mono">
            <div className="text-[10px] text-muted-foreground uppercase flex items-center justify-center gap-1">
              <Clock className="size-3 text-muted-foreground" /> Time Spent
            </div>
            <div className="text-2xl font-bold text-foreground mt-0.5">
              {Math.floor(stats.totalTimeSec / 60)}m {stats.totalTimeSec % 60}s
            </div>
            <div className="text-[10px] text-muted-foreground">Practice duration</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-border/40 shrink-0">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`pb-2 text-xs font-mono border-b-2 font-medium transition-all ${
              activeTab === 'sessions'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Past Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`pb-2 text-xs font-mono border-b-2 font-medium transition-all flex items-center gap-1 ${
              activeTab === 'heatmap'
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="size-3" />
            <span>Weak-Keys Heatmap</span>
          </button>
        </div>

        {/* Content Area */}
        <CardContent className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'sessions' ? (
            sessions.length === 0 ? (
              <div className="text-center py-12 font-mono text-xs text-muted-foreground border border-dashed rounded-xl border-border/80">
                No sessions completed yet. Practice passages to track your progress!
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-card hover:bg-muted/10 transition-colors flex flex-wrap items-center justify-between gap-3 font-mono text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{s.storyTitle}</span>
                        <Badge variant="notebook" className="text-[10px] py-0 px-1.5 font-normal">
                          {s.author}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(s.date).toLocaleDateString()} at {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {s.elapsedSeconds}s
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-base font-bold text-primary">{s.wpm} WPM</div>
                        <div className="text-[10px] text-muted-foreground">Raw: {s.rawWpm}</div>
                      </div>
                      <div>
                        <div className="text-base font-bold text-foreground">{s.accuracy}%</div>
                        <div className="text-[10px] text-destructive">{s.errorCount} err</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <WeakKeysHeatmap weakKeys={aggregatedWeakKeys} />
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t border-border/60 p-4 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={sessions.length === 0}
            className="text-xs font-mono text-destructive hover:bg-destructive/10 gap-1.5"
          >
            <Trash2 className="size-3.5" />
            <span>Clear History</span>
          </Button>

          <Button type="button" variant="default" size="sm" onClick={onClose} className="font-mono text-xs">
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
