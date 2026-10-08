/**
 * Text cleaner and normalizer for typing passages.
 */

export interface CleanOptions {
  stripPunctuation?: boolean
  stripNumbers?: boolean
  targetLength?: 'short' | 'medium' | 'long' | 'all'
}

/**
 * Normalizes Unicode symbols, curly quotes, dashes, accents, and whitespace.
 */
export function cleanText(input: string, options: CleanOptions = {}): string {
  if (!input) return ''

  let text = input

  // Normalize Unicode
  text = text.normalize('NFKC')

  // Remove footnote markers like [1], [12], [edit], [citation needed]
  text = text.replace(/\[(?:\d+|edit|citation needed|note \d+)\]/gi, '')

  // Replace curly quotes, backticks, and fancy apostrophes
  text = text
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[`´]/g, "'")

  // Replace em dash, en dash, horizontal bars with hyphen/space
  text = text
    .replace(/[\u2014\u2015]/g, ' - ')
    .replace(/[\u2012\u2013]/g, '-')
    .replace(/\.{3,}|…/g, '...')

  // Strip un-typable symbols / control chars while preserving standard keyboard chars
  // Standard keyboard printable: ASCII 32-126
  text = text.replace(/[^\x20-\x7E\n]/g, (char) => {
    // Map common Latin accented characters to ASCII equivalents
    const accents: Record<string, string> = {
      à: 'a', á: 'a', â: 'a', ã: 'a', ä: 'a', å: 'a',
      è: 'e', é: 'e', ê: 'e', ë: 'e',
      ì: 'i', í: 'i', î: 'i', ï: 'i',
      ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o',
      ù: 'u', ú: 'u', û: 'u', ü: 'u',
      ñ: 'n', ç: 'c',
      À: 'A', Á: 'A', Â: 'A', Ã: 'A', Ä: 'A', Å: 'A',
      È: 'E', É: 'E', Ê: 'E', Ë: 'E',
      Ì: 'I', Í: 'I', Î: 'I', Ï: 'I',
      Ò: 'O', Ó: 'O', Ô: 'O', Õ: 'O', Ö: 'O',
      Ù: 'U', Ú: 'U', Û: 'U', Ü: 'U',
      Ñ: 'N', Ç: 'C',
    }
    return accents[char] || ''
  })

  // Optional: strip numbers
  if (options.stripNumbers) {
    text = text.replace(/[0-9]/g, '')
  }

  // Optional: strip punctuation
  if (options.stripPunctuation) {
    text = text.replace(/[^\w\s]/g, '')
  }

  // Collapse consecutive whitespaces and newlines
  text = text.replace(/\r\n|\r|\n/g, ' ')
  text = text.replace(/\s+/g, ' ').trim()

  // Sentence boundary clipping if targetLength specified
  if (options.targetLength && options.targetLength !== 'all') {
    text = clipToTargetLength(text, options.targetLength)
  }

  return text
}

/**
 * Clips text at clean sentence boundaries to match the target length.
 */
export function clipToTargetLength(
  text: string,
  targetLength: 'short' | 'medium' | 'long'
): string {
  const targetWords = {
    short: 40,
    medium: 90,
    long: 180,
  }[targetLength]

  const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [text]
  let result = ''
  let wordCount = 0

  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (!trimmed) continue

    const sentenceWordCount = trimmed.split(/\s+/).length
    if (result && wordCount + sentenceWordCount > targetWords * 1.35) {
      break
    }

    result = result ? `${result} ${trimmed}` : trimmed
    wordCount += sentenceWordCount

    if (wordCount >= targetWords) {
      break
    }
  }

  return result || text
}
