import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './config/i18n'
import { initThemeSync } from './stores/app-store'
import { applyBrandColors, applyFavicon } from './lib/brand-colors'
import App from './App'

initThemeSync()
applyBrandColors()
applyFavicon()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
