import LivenessCheck from "./components/liveness-check"
import { ThemeProvider } from "./components/theme-provider"
import { ThemeToggle } from "./components/theme-toggle"

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="face-liveness-theme">
      <div className="relative min-h-screen bg-background">
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <main className="p-4 md:p-8">
          <LivenessCheck />
        </main>
      </div>
    </ThemeProvider>
  )
}
