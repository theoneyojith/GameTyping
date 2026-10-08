import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark")
    }
    return false
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [isDark])

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 font-mono text-xs"
      onClick={() => setIsDark((prev) => !prev)}
      title="Toggle theme"
    >
      {isDark ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4 text-slate-700" />}
      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
    </Button>
  )
}
