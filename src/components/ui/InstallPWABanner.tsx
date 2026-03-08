import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function InstallPWABanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-xl p-4 flex items-center gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <img src="/icons/icon-192x192.png" alt="PlanteiCerto" className="w-10 h-10 rounded-lg" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-foreground font-bold text-sm">Instalar PlanteiCerto</p>
          <p className="text-muted-foreground text-[11px] leading-tight">
            Acesse rapidamente pelo celular, como um app nativo.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <button
            onClick={handleInstall}
            className="bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1.5 rounded-lg border-none cursor-pointer hover:opacity-90 transition-opacity"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="text-muted-foreground text-[10px] font-medium px-3 py-1 rounded-lg border-none cursor-pointer hover:text-foreground bg-transparent transition-colors text-center"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
