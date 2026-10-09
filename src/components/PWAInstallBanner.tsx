'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if app is already running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  if (isInstalled || isDismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <div className="relative bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-b border-sky-800/40 px-4 py-2.5 text-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-white flex items-center gap-1.5">
              Installer l&apos;application GestionLocative Pro
              <span className="text-[10px] bg-sky-500/20 text-sky-300 font-medium px-2 py-0.5 rounded-full border border-sky-500/30">
                PWA Mobile & Desktop
              </span>
            </p>
            <p className="text-slate-400 text-xs hidden sm:block">
              Accédez à vos loyers et quittances hors-ligne directement depuis votre écran d&apos;accueil.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Installer
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showIOSInstructions && (
        <div className="mt-3 p-3 bg-slate-900/90 border border-sky-500/30 rounded-xl text-xs text-slate-300">
          <p className="font-semibold text-sky-400 mb-1 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" /> Installation sur iOS (iPhone / iPad) :
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Appuyez sur le bouton de <strong>Partage</strong> en bas de Safari (l&apos;icône avec la flèche vers le haut).</li>
            <li>Faites défiler vers le bas et sélectionnez <strong>« Sur l&apos;écran d&apos;accueil »</strong>.</li>
            <li>Appuyez sur <strong>Ajouter</strong> en haut à droite.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
