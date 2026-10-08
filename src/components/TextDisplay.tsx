import React, { useRef, useEffect } from 'react'
import { CharState } from '@/engine/types'
import { cn } from '@/lib/utils'
import { MousePointerClick } from 'lucide-react'

interface TextDisplayProps {
  charStates: CharState[]
  currentIndex: number
  isFocused: boolean
  hiddenInputRef: React.RefObject<HTMLInputElement | null>
  onFocusChange: (focused: boolean) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function TextDisplay({
  charStates,
  currentIndex,
  isFocused,
  hiddenInputRef,
  onFocusChange,
  onKeyDown,
}: TextDisplayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const activeCharRef = useRef<HTMLSpanElement | null>(null)

  // Ensure focus is kept
  const handleClick = () => {
    hiddenInputRef.current?.focus()
    onFocusChange(true)
  }

  // Auto-scroll passage if text is long
  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const container = containerRef.current
      const activeEl = activeCharRef.current

      const containerRect = container.getBoundingClientRect()
      const activeRect = activeEl.getBoundingClientRect()

      if (activeRect.bottom > containerRect.bottom - 40 || activeRect.top < containerRect.top + 40) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentIndex])

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={cn(
        'relative rounded-2xl border-2 transition-all cursor-text select-none min-h-[220px] max-h-[360px] overflow-y-auto p-8 shadow-sm',
        'bg-card/90 notebook-ruled notebook-margin pl-10 sm:pl-12 font-mono text-lg sm:text-xl leading-[36px] tracking-wide',
        isFocused ? 'border-border/90 shadow-md ring-2 ring-primary/20' : 'border-border/40 opacity-90'
      )}
    >
      {/* Hidden input for real mobile & desktop keyboard capture */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none w-0 h-0 top-0 left-0"
        onKeyDown={onKeyDown}
        onFocus={() => onFocusChange(true)}
        onBlur={() => onFocusChange(false)}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck="false"
        aria-label="Typing test input"
      />

      {/* Focus Lost Overlay */}
      {!isFocused && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center rounded-xl z-20 transition-opacity">
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card border border-border shadow-lg text-sm font-sans font-medium text-foreground animate-bounce">
            <MousePointerClick className="size-4 text-primary" />
            <span>Click here or press any key to focus</span>
          </div>
        </div>
      )}

      {/* Render Text Characters */}
      <div className="break-words whitespace-pre-wrap">
        {charStates.map((charState, idx) => {
          const isCurrent = idx === currentIndex
          const isSpace = charState.targetChar === ' '

          return (
            <span
              key={idx}
              ref={isCurrent ? activeCharRef : null}
              className={cn(
                'relative transition-colors duration-75',
                // Pending characters
                charState.status === 'pending' && 'text-muted-foreground/60',
                // Correct characters
                charState.status === 'correct' && 'text-foreground font-semibold',
                // Wrong characters
                charState.status === 'wrong' &&
                  (isSpace
                    ? 'bg-destructive/30 text-destructive underline decoration-wavy'
                    : 'text-destructive bg-destructive/15 underline font-bold rounded-xs px-0.5')
              )}
            >
              {/* Animated Notebook Cursor Indicator */}
              {isCurrent && (
                <span
                  className="absolute -left-[1px] top-1 bottom-1 w-[2.5px] bg-primary rounded-full animate-pulse shadow-xs z-10"
                  aria-hidden="true"
                />
              )}
              {charState.targetChar}
            </span>
          )
        })}
      </div>
    </div>
  )
}
