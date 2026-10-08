import { WpmSample } from '@/engine/types'

export interface TypingSessionRecord {
  id: string
  date: string
  storyId: string
  storyTitle: string
  author: string
  wpm: number
  rawWpm: number
  accuracy: number
  errorCount: number
  elapsedSeconds: number
  samples: WpmSample[]
  weakKeys: Record<string, number>
  mode: 'story' | 'timed'
}

export interface UserStats {
  totalTests: number
  topWpm: number
  averageWpm: number
  topAccuracy: number
  averageAccuracy: number
  totalTimeSec: number
  totalWordsTyped: number
}

const STORAGE_KEY = 'typecraft_history_v1'

export function getSessions(): TypingSessionRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as TypingSessionRecord[]
  } catch (err) {
    console.error('Failed to parse saved sessions', err)
    return []
  }
}

export function saveSession(session: Omit<TypingSessionRecord, 'id' | 'date'>): TypingSessionRecord {
  const newRecord: TypingSessionRecord = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    date: new Date().toISOString(),
  }

  const existing = getSessions()
  const updated = [newRecord, ...existing].slice(0, 100) // store up to 100 records
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed to persist session to localStorage', err)
  }

  return newRecord
}

export function clearSessions(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function getUserStats(): UserStats {
  const sessions = getSessions()
  if (sessions.length === 0) {
    return {
      totalTests: 0,
      topWpm: 0,
      averageWpm: 0,
      topAccuracy: 0,
      averageAccuracy: 0,
      totalTimeSec: 0,
      totalWordsTyped: 0,
    }
  }

  let topWpm = 0
  let topAccuracy = 0
  let sumWpm = 0
  let sumAccuracy = 0
  let totalTimeSec = 0
  let totalWordsTyped = 0

  for (const s of sessions) {
    if (s.wpm > topWpm) topWpm = s.wpm
    if (s.accuracy > topAccuracy) topAccuracy = s.accuracy
    sumWpm += s.wpm
    sumAccuracy += s.accuracy
    totalTimeSec += s.elapsedSeconds
    totalWordsTyped += Math.round((s.wpm * s.elapsedSeconds) / 60)
  }

  return {
    totalTests: sessions.length,
    topWpm,
    averageWpm: Math.round(sumWpm / sessions.length),
    topAccuracy,
    averageAccuracy: Math.round((sumAccuracy / sessions.length) * 10) / 10,
    totalTimeSec: Math.round(totalTimeSec),
    totalWordsTyped,
  }
}

export function getAggregatedWeakKeys(): Record<string, number> {
  const sessions = getSessions()
  const aggregated: Record<string, number> = {}

  for (const session of sessions) {
    if (!session.weakKeys) continue
    for (const [key, count] of Object.entries(session.weakKeys)) {
      aggregated[key] = (aggregated[key] || 0) + count
    }
  }

  return aggregated
}
