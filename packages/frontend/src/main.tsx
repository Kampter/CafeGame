import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import { ThemeProvider } from './providers/ThemeProvider'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider storageKey="cafegame-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
