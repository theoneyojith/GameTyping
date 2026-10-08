import { useState, useEffect, useCallback, useRef } from 'react'
import {
  createEngineState,
  processKeystroke,
  calculateMetrics,
  getCharStates,
} from '@/engine/typingEngine'
import { TypingEngineState, TypingMetrics, CharState } from '@/engine/types'
import { soundManager } from '@/lib/soundEffects'
import { saveSession } from '@/lib/storage'
import confetti from 'canvas-confetti'

export interface UseTypingSessionProps {
  targetText: string
  storyId: string
  storyTitle: string
  author: string
  mode?: 'story' | 'timed'
  timeLimitSec?: number
}

export function useTypingSession({
  targetText,
  storyId,
  storyTitle,
  author,
  mode = 'story',
  timeLimitSec = 60,
}: UseTypingSessionProps) {
  const [engineState, setEngineState] = useState<TypingEngineState>(() =>
    createEngineState(targetText)
  )
  const [metrics, setMetrics] = useState<TypingMetrics>(() =>
    calculateMetrics(createEngineState(targetText))
  )
  const [isFocused, setIsFocused] = useState<boolean>(true)
  const [timeRemaining, setTimeRemaining] = useState<number>(timeLimitSec)
  const [soundActive, setSoundActive] = useState<boolean>(() => soundManager.isEnabled())

  const savedRecordRef = useRef<boolean>(false)
  const hiddenInputRef = useRef<HTMLInputElement | null>(null)

  // Reset engine when target text changes
  useEffect(() => {
    const newState = createEngineState(targetText)
    setEngineState(newState)
    setMetrics(calculateMetrics(newState))
    setTimeRemaining(timeLimitSec)
    savedRecordRef.current = false
    hiddenInputRef.current?.focus()
  }, [targetText, timeLimitSec])

  // Live timer tick for calculating real-time metrics during active session
  useEffect(() => {
    if (!engineState.isStarted || engineState.isComplete) {
      return
    }

    const intervalId = setInterval(() => {
      const now = Date.now()
      const updatedMetrics = calculateMetrics(engineState, now)
      setMetrics(updatedMetrics)

      if (mode === 'timed' && engineState.startTime) {
        const elapsed = (now - engineState.startTime) / 1000
        const remaining = Math.max(0, Math.ceil(timeLimitSec - elapsed))
        setTimeRemaining(remaining)

        if (remaining <= 0) {
          // Complete timed session
          setEngineState((prev) => ({
            ...prev,
            isComplete: true,
            endTime: now,
          }))
        }
      }
    }, 100)

    return () => clearInterval(intervalId)
  }, [engineState, mode, timeLimitSec])

  // Handle completion effects and persistence
  useEffect(() => {
    if (engineState.isComplete && !savedRecordRef.current) {
      savedRecordRef.current = true
      const finalMetrics = calculateMetrics(engineState, engineState.endTime || Date.now())
      setMetrics(finalMetrics)

      soundManager.playCompleteSound()

      // Celebrate with confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8c8273', '#e06c75', '#98c379', '#e5c07b', '#61afef'],
        })
      } catch {
        // Confetti fallback
      }

      // Save to localStorage history
      saveSession({
        storyId,
        storyTitle,
        author,
        wpm: finalMetrics.wpm,
        rawWpm: finalMetrics.rawWpm,
        accuracy: finalMetrics.accuracy,
        errorCount: engineState.errorCount,
        elapsedSeconds: finalMetrics.elapsedSeconds,
        samples: engineState.samples,
        weakKeys: engineState.weakKeys,
        mode,
      })
    }
  }, [engineState, storyId, storyTitle, author, mode])

  const handleKey = useCallback(
    (key: string) => {
      if (engineState.isComplete) return

      const targetChar = engineState.targetText[engineState.currentIndex]
      const isError = key !== 'Backspace' && key !== targetChar

      // Trigger audio click feedback
      soundManager.playKeyClick(isError)

      setEngineState((prev) => {
        const next = processKeystroke(prev, key, Date.now())
        setMetrics(calculateMetrics(next))
        return next
      })
    },
    [engineState.isComplete, engineState.targetText, engineState.currentIndex]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLDivElement>) => {
      // Prevent default scrolling on spacebar inside typing test
      if (e.key === ' ' || e.key === 'Backspace') {
        e.preventDefault()
      }

      if (e.key === 'Tab') {
        return // Allow tab navigation
      }

      if (e.key === 'Escape') {
        // Quick restart shortcut
        resetSession()
        return
      }

      handleKey(e.key)
    },
    [handleKey]
  )

  const resetSession = useCallback(() => {
    const newState = createEngineState(targetText)
    setEngineState(newState)
    setMetrics(calculateMetrics(newState))
    setTimeRemaining(timeLimitSec)
    savedRecordRef.current = false
    hiddenInputRef.current?.focus()
  }, [targetText, timeLimitSec])

  const toggleSound = useCallback(() => {
    const nextState = soundManager.toggleSound()
    setSoundActive(nextState)
  }, [])

  const charStates: CharState[] = getCharStates(engineState)

  return {
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
  }
}
