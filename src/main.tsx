import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { App as CapacitorApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

if (Capacitor.getPlatform() === 'android') {
  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back()
    else CapacitorApp.exitApp()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
