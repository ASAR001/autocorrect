import { createContext, useContext, createSignal, createEffect, type ParentProps, type Accessor } from 'solid-js'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Accessor<Theme>; toggleTheme: () => void }>()

function getInitialTheme(): Theme {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') as Theme | null : null
  return stored === 'light' || stored === 'dark' ? stored : 'dark'
}

const initial = getInitialTheme()
if (typeof document !== 'undefined') {
  document.documentElement.classList.add(initial)
}

export function ThemeProvider(props: ParentProps) {
  const [theme, setTheme] = createSignal<Theme>(initial)

  createEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme())
    localStorage.setItem('theme', theme())
  })

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
