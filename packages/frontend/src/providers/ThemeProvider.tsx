import { createContext, useContext, useEffect } from 'react'

// Define the shape of the context value for a fixed dark theme
interface ThemeProviderState {
  theme: 'dark'
  resolvedTheme: 'dark'
}

// Initial state, always dark
const initialState: ThemeProviderState = {
  theme: 'dark',
  resolvedTheme: 'dark',
}

// Create the context
const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// Define the props for the provider
interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    const root = window.document.documentElement
    // Clean up any existing theme classes
    root.classList.remove('light', 'dark')
    // Always apply the 'dark' class
    root.classList.add('dark')
  }, []) // Runs once on mount

  // Value is fixed since theme is fixed
  const value: ThemeProviderState = {
    theme: 'dark',
    resolvedTheme: 'dark',
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// Custom hook to use the theme context
export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context // Returns { theme: 'dark', resolvedTheme: 'dark' }
}
