'use client';
import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt if user hasn't explicitly dismissed it recently
      if (!localStorage.getItem('pwa_prompt_dismissed')) {
        setShowPrompt(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-xl border border-gray-100">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#e97c2a]">
          <Download className="size-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">Installer Babydja</p>
          <p className="text-xs text-gray-500">Accès hors-ligne et plus rapide</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleInstall}
            className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-secondary/90"
          >
            Installer
          </button>
          <button onClick={handleDismiss} className="p-1.5 text-gray-400 hover:text-gray-600">
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
