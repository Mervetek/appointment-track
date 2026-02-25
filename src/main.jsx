import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Service Worker kaydı (bildirimler için)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
      .then((reg) => {
        console.log('[App] SW kayıtlı ✅');
        // SW güncellemelerini otomatik uygula
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing;
          if (newSW) {
            newSW.addEventListener('statechange', () => {
              if (newSW.state === 'activated') {
                console.log('[App] Yeni SW aktif ✅');
              }
            });
          }
        });
        // Her sayfa yüklemesinde güncelleme kontrolü
        reg.update().catch(() => { });
      })
      .catch((err) => {
        console.log('SW registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
