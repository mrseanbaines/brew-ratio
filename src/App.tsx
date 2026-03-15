import { Calculator } from "@/components/Calculator"
import { ThemeToggle } from "@/components/ThemeToggle"
import { ThemeProvider } from "@/lib/theme"

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-svh bg-background flex flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <h1 className="text-lg font-medium tracking-tight">BrewRatio</h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-start justify-center px-6 py-8">
          <Calculator />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
