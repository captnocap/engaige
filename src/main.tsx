import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeDisplay } from './stores/displayStore.js'
import { initializeSettings } from './stores/settingsStore.js'

// Initialize settings and display on app load
initializeDisplay()
initializeSettings()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)