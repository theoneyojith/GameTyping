export type CharStatus = 'pending' | 'correct' | 'wrong' | 'current'

export interface CharState {
  targetChar: string
  typedChar?: string
  status: 'pending' | 'correct' | 'wrong'
  index: number
}

export interface WpmSample {
  timeOffsetSec: number
  wpm: number
  rawWpm: number
  accuracy: number
  errors: number
}

export interface TypingEngineState {
  targetText: string
  typedText: string
  currentIndex: number
  startTime: number | null
  endTime: number | null
  isStarted: boolean
  isComplete: boolean
  totalKeystrokes: number
  errorCount: number // Total wrong keystrokes (including those later backspaced)
  correctedCount: number
  weakKeys: Record<string, number> // Map of expected char -> typo count
  samples: WpmSample[]
}

export interface TypingMetrics {
  wpm: number
  rawWpm: number
  accuracy: number // 0 to 100
  elapsedSeconds: number
  correctChars: number
  errorChars: number
  totalKeystrokes: number
  progressPercent: number
  isComplete: boolean
}
