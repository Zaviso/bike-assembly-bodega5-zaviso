import { StrictMode } from 'react'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
