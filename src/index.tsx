import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { I18nextProvider } from 'react-i18next'
import i18next from 'i18next'
import global_en from './translations/en/global.json'
import global_fr from './translations/fr/global.json'
import LanguageDetector from 'i18next-browser-languagedetector'
import { Toaster } from 'src/components/ui/toaster'
import { LogSnagProvider } from '@logsnag/react'

i18next.use(LanguageDetector).init({
  interpolation: { escapeValue: false },
  fallbackLng: 'en',
  resources: {
    en: {
      global: global_en,
    },
    fr: {
      global: global_fr,
    },
  },
  detection: {
    order: ['querystring', 'cookie'],
    caches: ['cookie'],
  },
})

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <LogSnagProvider
      token={process.env.REACT_APP_LOGSNAG_API_KEY!}
      project={process.env.REACT_APP_LOGSNAG_PROJECT!}
    >
      <I18nextProvider i18n={i18next}>
        <App />
        <Toaster />
      </I18nextProvider>
    </LogSnagProvider>
  </React.StrictMode>
)
