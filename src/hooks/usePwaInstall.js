// src/hooks/usePwaInstall.js
import { useState, useEffect, useCallback } from 'react';

export default function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkInstalled = () => {
      if (typeof window === 'undefined') return false;
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')
      );
    };

    setIsInstalled(checkInstalled());

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua) && !window.MSStream);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (isIOS) return 'ios';
    if (!deferredPrompt) {
      // No native prompt available — signal caller to show fallback instructions
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      const accepted = outcome === 'accepted';
      setDeferredPrompt(null);
      setIsInstallable(false);
      if (accepted) setIsInstalled(true);
      return accepted;
    } catch (err) {
      console.warn('PWA install prompt failed:', err);
      return false;
    }
  }, [deferredPrompt, isIOS]);

  return { isInstallable, isInstalled, isIOS, promptInstall };
}