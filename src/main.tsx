import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker for Android & Chromium installability
const registerPWA = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('MoMoPay ServiceWorker registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('ServiceWorker registration note:', err);
      });
  }
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    registerPWA();
  } else {
    window.addEventListener('load', registerPWA);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
