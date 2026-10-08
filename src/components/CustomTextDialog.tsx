import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Sparkles, FileEdit } from 'lucide-react'

interface CustomTextDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (title: string, author: string, text: string) => void
}

export function CustomTextDialog({ isOpen, onClose, onSubmit }: CustomTextDialogProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || text.trim().length < 10) {
      setError('Please provide at least 10 characters of text to practice.')
      return
    }

    onSubmit(title || 'Custom Passage', author || 'You', text)
    setTitle('')
    setAuthor('')
    setText('')
    setError(null)
    onClose()
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50">
      <Card className="w-full max-w-xl border-2 border-border shadow-2xl bg-card">
        <form onSubmit={handleSubmit}>
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2">
                <FileEdit className="size-5 text-primary" />
                <CardTitle className="text-xl font-sans">Practice Custom Text</CardTitle>
              </div>
              <CardDescription className="font-mono text-xs mt-1">
                Paste any article, quote, or code passage to practice typing.
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

          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase">Title</label>
                <input
                  type="text"
                  placeholder="e.g. My Favorite Speech"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground uppercase">Author / Source</label>
                <input
                  type="text"
                  placeholder="e.g. Maya Angelou"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-background px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono text-muted-foreground uppercase">Passage Text</label>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {wordCount} words • {charCount} chars
                </span>
              </div>
              <textarea
                rows={6}
                placeholder="Paste or write the text here..."
                value={text}
                onChange={(e) => {
                  setText(e.target.value)
                  if (error) setError(null)
                }}
                className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {error && (
              <div className="text-xs font-mono text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t border-border/60 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="font-mono text-xs">
              Cancel
            </Button>
            <Button type="submit" variant="default" className="gap-2 font-mono text-xs">
              <Sparkles className="size-3.5" />
              <span>Load Passage</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
