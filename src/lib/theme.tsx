import { createContext, useContext, useEffect, useState } from "react"
import { z } from "zod"

const themeSchema = z.enum(["dark", "light"])
type Theme = z.infer<typeof themeSchema>

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme")
    const result = themeSchema.safeParse(stored)
    if (result.success) {
      return result.data
    }
  } catch {
    // Ignore errors
  }

  return "dark"
}

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(loadTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
