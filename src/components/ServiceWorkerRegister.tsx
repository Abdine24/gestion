'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      const baseUrl = window.location.pathname.endsWith('/')
        ? window.location.pathname
        : `${window.location.pathname}/`;
      const swUrl = `${baseUrl}sw.js`;

      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register(swUrl)
          .then((registration) => {
            console.log('PWA ServiceWorker actif: ', registration.scope);
          })
          .catch((err) => {
            console.warn('ServiceWorker enregistrement (normal en dev): ', err);
          });
      });
    }
  }, []);

  return null;
}
