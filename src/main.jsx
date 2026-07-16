import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const registerVesalaporraServiceWorker = async () => {
  if (!import.meta.env.PROD) {
    return
  }

  if (!('serviceWorker' in navigator)) {
    console.warn(
      '[VESALAPORRA_PWA] Aquest navegador no suporta Service Worker.',
    )

    return
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/sw.js',
      {
        scope: '/',
      },
    )

    console.info(
      '[VESALAPORRA_PWA] Service Worker registrat correctament.',
      {
        scope: registration.scope,
      },
    )
  } catch (error) {
    console.error(
      '[VESALAPORRA_PWA] Error registrant el Service Worker.',
      error,
    )
  }
}

window.addEventListener('load', () => {
  void registerVesalaporraServiceWorker()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)