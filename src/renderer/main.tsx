import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Root element #root not found')
}

try {
  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (err) {
  console.error('Failed to mount app:', err)
  rootEl.innerHTML = `<p style="padding: 1rem; color: #b91c1c;">加载失败，请刷新或重启应用。</p>`
}
