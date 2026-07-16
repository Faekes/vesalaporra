import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const INSTALL_PROMPT_READY_EVENT =
  'vesalaporra:install-prompt-ready'

const INSTALL_PROMPT_STORAGE_KEY =
  '__VESALAPORRA_INSTALL_PROMPT__'

const INSTALL_CAPTURE_FLAG =
  '__VESALAPORRA_INSTALL_CAPTURE_READY__'

if (
  typeof window !== 'undefined' &&
  !window[INSTALL_CAPTURE_FLAG]
) {
  window[INSTALL_CAPTURE_FLAG] = true

  window[INSTALL_PROMPT_STORAGE_KEY] =
    window[INSTALL_PROMPT_STORAGE_KEY] ?? null

  window.addEventListener(
    'beforeinstallprompt',
    (event) => {
      event.preventDefault()

      window[INSTALL_PROMPT_STORAGE_KEY] = event

      window.dispatchEvent(
        new Event(INSTALL_PROMPT_READY_EVENT),
      )
    },
  )

  window.addEventListener(
    'appinstalled',
    () => {
      window[INSTALL_PROMPT_STORAGE_KEY] = null
    },
  )
}

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
    const registration =
      await navigator.serviceWorker.register(
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