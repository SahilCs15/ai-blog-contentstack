import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { initLivePreviewOnce } from './lib/contentstack'
import './styles/app.css'

// Initialize Live Preview before anything renders/fetches, so the first query
// inside the Visual Builder iframe carries the live_preview hash.
initLivePreviewOnce()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
