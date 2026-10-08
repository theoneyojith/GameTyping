import { useState, useCallback } from 'react'
import fallbackData from '@/data/fallbackStories.json'
import { cleanText, clipToTargetLength } from '@/lib/textCleaner'

export interface StoryItem {
  id: string
  title: string
  author: string
  source?: string
  category: string
  text: string
  attributionUrl?: string
  isOnline?: boolean
}

export type LengthOption = 'short' | 'medium' | 'long'

export function useStories() {
  const [stories, setStories] = useState<StoryItem[]>(fallbackData as StoryItem[])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [selectedLength, setSelectedLength] = useState<LengthOption>('medium')
  const [isLoadingOnline, setIsLoadingOnline] = useState<boolean>(false)
  const [onlineError, setOnlineError] = useState<string | null>(null)

  const rawCurrentStory = stories[currentIndex] || stories[0]

  // Clean and clip according to length selection
  const currentStory: StoryItem = {
    ...rawCurrentStory,
    text: clipToTargetLength(cleanText(rawCurrentStory.text), selectedLength),
  }

  const selectStoryById = useCallback((id: string) => {
    const idx = stories.findIndex((s) => s.id === id)
    if (idx !== -1) {
      setCurrentIndex(idx)
    }
  }, [stories])

  const nextStory = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % stories.length)
  }, [stories.length])

  const randomStory = useCallback(() => {
    if (stories.length <= 1) return
    let nextIdx = Math.floor(Math.random() * stories.length)
    if (nextIdx === currentIndex) {
      nextIdx = (nextIdx + 1) % stories.length
    }
    setCurrentIndex(nextIdx)
  }, [stories.length, currentIndex])

  const setCustomStory = useCallback((title: string, author: string, rawText: string) => {
    const cleaned = cleanText(rawText)
    const customStory: StoryItem = {
      id: `custom_${Date.now()}`,
      title: title.trim() || 'Custom Passage',
      author: author.trim() || 'You',
      source: 'User Input',
      category: 'Custom',
      text: cleaned,
    }

    setStories((prev) => [customStory, ...prev])
    setCurrentIndex(0)
  }, [])

  const fetchWikipediaStory = useCallback(async () => {
    setIsLoadingOnline(true)
    setOnlineError(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)

      const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`Wikipedia API error: ${res.status}`)
      }

      const data = await res.json()
      if (!data.extract || data.extract.trim().length < 60) {
        throw new Error('Article extract too short')
      }

      const cleanedText = cleanText(data.extract)
      const wikiStory: StoryItem = {
        id: `wiki_${data.pageid || Date.now()}`,
        title: data.title || 'Wikipedia Article',
        author: 'Wikipedia Contributors (CC BY-SA 4.0)',
        source: data.description || 'Wikipedia Knowledge Base',
        category: 'Wikipedia',
        text: cleanedText,
        attributionUrl: data.content_urls?.desktop?.page || 'https://en.wikipedia.org',
        isOnline: true,
      }

      setStories((prev) => [wikiStory, ...prev])
      setCurrentIndex(0)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure'
      console.warn('Could not fetch from Wikipedia, falling back to bundled story', msg)
      setOnlineError('Could not reach Wikipedia API. Loaded local fallback story.')
      randomStory()
    } finally {
      setIsLoadingOnline(false)
    }
  }, [randomStory])

  return {
    stories,
    currentStory,
    currentIndex,
    selectedLength,
    isLoadingOnline,
    onlineError,
    setSelectedLength,
    selectStoryById,
    nextStory,
    randomStory,
    setCustomStory,
    fetchWikipediaStory,
  }
}
