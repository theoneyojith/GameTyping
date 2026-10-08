import type { CharState, TypingEngineState, TypingMetrics } from './types'

/**
 * Initializes a pure Typing Engine state for a given target text.
 */
export function createEngineState(targetText: string): TypingEngineState {
  return {
    targetText,
    typedText: '',
    currentIndex: 0,
    startTime: null,
    endTime: null,
    isStarted: false,
    isComplete: false,
    totalKeystrokes: 0,
    errorCount: 0,
    correctedCount: 0,
    weakKeys: {},
    samples: [],
  }
}

/**
 * Pure function to process a single key input event.
 */
export function processKeystroke(
  state: TypingEngineState,
  key: string,
  timestamp: number = Date.now()
): TypingEngineState {
  if (state.isComplete) {
    return state
  }

  // Handle Backspace
  if (key === 'Backspace') {
    if (state.typedText.length === 0) {
      return state
    }

    const newTypedText = state.typedText.slice(0, -1)
    const newIndex = newTypedText.length

    return {
      ...state,
      typedText: newTypedText,
      currentIndex: newIndex,
      correctedCount: state.correctedCount + 1,
    }
  }

  // Ignore non-printable and modifier keys
  if (key.length !== 1) {
    return state
  }

  // Start timer at the first valid keystroke
  const startTime = state.startTime !== null ? state.startTime : timestamp
  const isStarted = true
  const totalKeystrokes = state.totalKeystrokes + 1

  // Target char at current position
  const targetChar = state.targetText[state.currentIndex]
  const isCorrect = key === targetChar

  let errorCount = state.errorCount
  const weakKeys = { ...state.weakKeys }

  if (!isCorrect) {
    errorCount += 1
    if (targetChar) {
      const keyLabel = targetChar === ' ' ? 'Space' : targetChar.toLowerCase()
      weakKeys[keyLabel] = (weakKeys[keyLabel] || 0) + 1
    }
  }

  const newTypedText = state.typedText + key
  const newIndex = newTypedText.length
  const isComplete = newIndex >= state.targetText.length
  const endTime = isComplete ? timestamp : null

  // Capture periodic telemetry sample
  const elapsedSec = Math.max((timestamp - startTime) / 1000, 0.1)
  const samples = [...state.samples]
  const shouldSample =
    samples.length === 0 ||
    elapsedSec - samples[samples.length - 1].timeOffsetSec >= 1 ||
    isComplete

  if (shouldSample) {
    let correctCount = 0
    for (let i = 0; i < newTypedText.length; i++) {
      if (newTypedText[i] === state.targetText[i]) {
        correctCount++
      }
    }
    const sampleWpm = Math.round((correctCount / 5) / (elapsedSec / 60))
    const sampleRawWpm = Math.round((newTypedText.length / 5) / (elapsedSec / 60))
    const sampleAccuracy =
      totalKeystrokes > 0
        ? Math.max(0, Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 1000) / 10)
        : 100

    samples.push({
      timeOffsetSec: Math.round(elapsedSec * 10) / 10,
      wpm: sampleWpm,
      rawWpm: sampleRawWpm,
      accuracy: sampleAccuracy,
      errors: errorCount,
    })
  }

  return {
    ...state,
    typedText: newTypedText,
    currentIndex: newIndex,
    startTime,
    endTime,
    isStarted,
    isComplete,
    totalKeystrokes,
    errorCount,
    weakKeys,
    samples,
  }
}

/**
 * Calculates current real-time metrics from the engine state.
 */
export function calculateMetrics(
  state: TypingEngineState,
  now: number = Date.now()
): TypingMetrics {
  const targetLength = state.targetText.length
  if (targetLength === 0) {
    return {
      wpm: 0,
      rawWpm: 0,
      accuracy: 100,
      elapsedSeconds: 0,
      correctChars: 0,
      errorChars: 0,
      totalKeystrokes: 0,
      progressPercent: 0,
      isComplete: false,
    }
  }

  let correctChars = 0
  let errorChars = 0
  for (let i = 0; i < state.typedText.length; i++) {
    if (state.typedText[i] === state.targetText[i]) {
      correctChars++
    } else {
      errorChars++
    }
  }

  const elapsedMillis =
    state.startTime !== null
      ? (state.endTime ?? now) - state.startTime
      : 0
  const elapsedSeconds = Math.max(elapsedMillis / 1000, 0)
  const elapsedMinutes = elapsedSeconds / 60

  let wpm = 0
  let rawWpm = 0

  if (elapsedMinutes > 0 && state.isStarted) {
    wpm = Math.round((correctChars / 5) / elapsedMinutes)
    rawWpm = Math.round((state.typedText.length / 5) / elapsedMinutes)
  }

  // Accuracy formula: (total keystrokes - all mistakes made) / total keystrokes
  let accuracy = 100
  if (state.totalKeystrokes > 0) {
    const calculated = ((state.totalKeystrokes - state.errorCount) / state.totalKeystrokes) * 100
    accuracy = Math.max(0, Math.min(100, Math.round(calculated * 10) / 10))
  }

  const progressPercent = Math.min(
    100,
    Math.round((state.typedText.length / targetLength) * 1000) / 10
  )

  return {
    wpm,
    rawWpm,
    accuracy,
    elapsedSeconds: Math.round(elapsedSeconds * 10) / 10,
    correctChars,
    errorChars,
    totalKeystrokes: state.totalKeystrokes,
    progressPercent,
    isComplete: state.isComplete,
  }
}

/**
 * Returns structured character states for rendering.
 */
export function getCharStates(state: TypingEngineState): CharState[] {
  const result: CharState[] = []
  const targetLen = state.targetText.length

  for (let i = 0; i < targetLen; i++) {
    const targetChar = state.targetText[i]
    if (i < state.typedText.length) {
      const typedChar = state.typedText[i]
      result.push({
        targetChar,
        typedChar,
        status: typedChar === targetChar ? 'correct' : 'wrong',
        index: i,
      })
    } else {
      result.push({
        targetChar,
        status: 'pending',
        index: i,
      })
    }
  }

  return result
}
