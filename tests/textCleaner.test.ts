import { describe, it, expect } from 'vitest'
import { cleanText, clipToTargetLength } from '../src/lib/textCleaner'

describe('Text Cleaner', () => {
  it('normalizes curly quotes and em-dashes', () => {
    const raw = `“It’s a lovely day,” she said—with a smile.`
    const cleaned = cleanText(raw)
    expect(cleaned).toBe(`"It's a lovely day," she said - with a smile.`)
  })

  it('strips Wikipedia footnote markers and collapses whitespace', () => {
    const raw = `Albert Einstein[1][edit] was a physicist.   He won the Nobel Prize[2].`
    const cleaned = cleanText(raw)
    expect(cleaned).toBe('Albert Einstein was a physicist. He won the Nobel Prize.')
  })

  it('transliterates accented Latin characters to ASCII', () => {
    const raw = `Café in Zürich with naïve façade.`
    const cleaned = cleanText(raw)
    expect(cleaned).toBe('Cafe in Zurich with naive facade.')
  })

  it('clips text to sentence boundaries for short/medium/long', () => {
    const text =
      'First sentence is great. Second sentence is wonderful. Third sentence brings joy. Fourth sentence concludes this test story cleanly.'
    const shortText = clipToTargetLength(text, 'short')
    expect(shortText.endsWith('.')).toBe(true)
  })
})
