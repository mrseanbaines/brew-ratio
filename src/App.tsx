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

        <main className="flex-1 flex place-items-center px-6 py-8">
          <Calculator />
        </main>

        <footer className="px-6 py-4 text-center text-xs text-muted-foreground font-mono">
          Built by <ExternalLink href="https://seanbaines.com">Sean Baines</ExternalLink> /{" "}
          <ExternalLink href="https://handfulcoffee.com">Handful Coffee</ExternalLink>.
        </footer>
      </div>
    </ThemeProvider>
  )
}

const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-primary underline underline-offset-4 transition-all decoration-transparent hover:decoration-primary"
  >
    {children}
  </a>
)

export default App
