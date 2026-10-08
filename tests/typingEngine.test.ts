import { describe, it, expect } from 'vitest'
import {
  createEngineState,
  processKeystroke,
  calculateMetrics,
  getCharStates,
} from '../src/engine/typingEngine'

describe('Typing Engine Pure Functions', () => {
  it('initializes state properly for target text', () => {
    const text = 'Hello world!'
    const state = createEngineState(text)

    expect(state.targetText).toBe(text)
    expect(state.typedText).toBe('')
    expect(state.currentIndex).toBe(0)
    expect(state.isStarted).toBe(false)
    expect(state.isComplete).toBe(false)
    expect(state.totalKeystrokes).toBe(0)
    expect(state.errorCount).toBe(0)
  })

  it('handles correct typing sequence', () => {
    let state = createEngineState('Cat')
    const t0 = 1000

    state = processKeystroke(state, 'C', t0)
    expect(state.isStarted).toBe(true)
    expect(state.startTime).toBe(t0)
    expect(state.typedText).toBe('C')
    expect(state.currentIndex).toBe(1)
    expect(state.errorCount).toBe(0)

    state = processKeystroke(state, 'a', t0 + 200)
    expect(state.typedText).toBe('Ca')

    state = processKeystroke(state, 't', t0 + 400)
    expect(state.typedText).toBe('Cat')
    expect(state.isComplete).toBe(true)
    expect(state.endTime).toBe(t0 + 400)
  })

  it('tracks errors and updates weakKeys map', () => {
    let state = createEngineState('Tree')
    const t0 = 1000

    // Press wrong key 'R' instead of 'T'
    state = processKeystroke(state, 'R', t0)
    expect(state.typedText).toBe('R')
    expect(state.errorCount).toBe(1)
    expect(state.weakKeys['t']).toBe(1)

    const metrics = calculateMetrics(state, t0 + 1000)
    expect(metrics.accuracy).toBe(0) // 0 correct out of 1
    expect(metrics.errorChars).toBe(1)
  })

  it('handles backspace correctly and preserves cumulative error count', () => {
    let state = createEngineState('Book')
    const t0 = 1000

    // Type 'B' (correct)
    state = processKeystroke(state, 'B', t0)
    // Type 'x' (wrong)
    state = processKeystroke(state, 'x', t0 + 100)
    expect(state.typedText).toBe('Bx')
    expect(state.errorCount).toBe(1)
    expect(state.totalKeystrokes).toBe(2)

    // Backspace
    state = processKeystroke(state, 'Backspace', t0 + 200)
    expect(state.typedText).toBe('B')
    expect(state.currentIndex).toBe(1)
    expect(state.errorCount).toBe(1) // Error count is retained per spec!
    expect(state.correctedCount).toBe(1)

    // Type 'o' (correct)
    state = processKeystroke(state, 'o', t0 + 300)
    expect(state.typedText).toBe('Bo')
    expect(state.totalKeystrokes).toBe(3)

    // Total keystrokes = 3, errors = 1 -> Accuracy = (3 - 1)/3 = 66.7%
    const metrics = calculateMetrics(state, t0 + 400)
    expect(metrics.accuracy).toBe(66.7)
  })

  it('ignores modifier keys like Shift and Ctrl', () => {
    let state = createEngineState('A')
    state = processKeystroke(state, 'Shift')
    state = processKeystroke(state, 'Control')
    state = processKeystroke(state, 'Alt')

    expect(state.isStarted).toBe(false)
    expect(state.typedText).toBe('')
    expect(state.totalKeystrokes).toBe(0)
  })

  it('calculates WPM and metrics accurately', () => {
    let state = createEngineState('Hello world') // 11 characters
    const t0 = 0

    for (let i = 0; i < 'Hello world'.length; i++) {
      state = processKeystroke(state, 'Hello world'[i], t0 + i * 1000)
    }

    expect(state.isComplete).toBe(true)

    // 11 chars typed in 10 seconds = (11 / 5) / (10 / 60) = 2.2 * 6 = 13.2 -> 13 WPM
    const metrics = calculateMetrics(state, 10000)
    expect(metrics.isComplete).toBe(true)
    expect(metrics.correctChars).toBe(11)
    expect(metrics.wpm).toBe(13)
    expect(metrics.accuracy).toBe(100)
    expect(metrics.progressPercent).toBe(100)
  })

  it('generates structured char states for rendering', () => {
    let state = createEngineState('Hello')
    state = processKeystroke(state, 'H')
    state = processKeystroke(state, 'a') // wrong

    const charStates = getCharStates(state)
    expect(charStates).toHaveLength(5)
    expect(charStates[0]).toEqual({ targetChar: 'H', typedChar: 'H', status: 'correct', index: 0 })
    expect(charStates[1]).toEqual({ targetChar: 'e', typedChar: 'a', status: 'wrong', index: 1 })
    expect(charStates[2]).toEqual({ targetChar: 'l', status: 'pending', index: 2 })
    expect(charStates[3]).toEqual({ targetChar: 'l', status: 'pending', index: 3 })
    expect(charStates[4]).toEqual({ targetChar: 'o', status: 'pending', index: 4 })
  })
})
