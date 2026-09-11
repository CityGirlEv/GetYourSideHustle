import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { clearStaleChunkReloadFlag, installStaleChunkAutoReload } from './lib/first-load'

try {
  clearStaleChunkReloadFlag(sessionStorage)
  installStaleChunkAutoReload(window)
} catch {
  /* private mode / blocked storage */
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
