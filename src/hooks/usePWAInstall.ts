import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __beforeInstallPromptEvent?: BeforeInstallPromptEvent | null;
  }
}

// Early capture if event fires before React finishes mounting
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    window.__beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__beforeInstallPromptEvent) {
      return window.__beforeInstallPromptEvent;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isIframe, setIsIframe] = useState(false);

  // Check standalone mode and environment
  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const inIframe = window.self !== window.top;
    setIsIframe(inIframe);

    // Pick up pre-captured prompt if exists
    if (window.__beforeInstallPromptEvent && !deferredPrompt) {
      setDeferredPrompt(window.__beforeInstallPromptEvent);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      window.__beforeInstallPromptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if auto-install was requested via URL query ?pwa_install=1
      const params = new URLSearchParams(window.location.search);
      if (params.get('pwa_install') === '1') {
        params.delete('pwa_install');
        const newSearch = params.toString() ? `?${params.toString()}` : '';
        window.history.replaceState({}, '', `${window.location.pathname}${newSearch}${window.location.hash}`);
        const p = e as BeforeInstallPromptEvent;
        p.prompt().catch(() => {});
      }
    };

    const handleCustomPromptReady = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent>;
      if (customEvent.detail) {
        setDeferredPrompt(customEvent.detail);
      } else if (window.__beforeInstallPromptEvent) {
        setDeferredPrompt(window.__beforeInstallPromptEvent);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__beforeInstallPromptEvent = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handleCustomPromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If already in top-level with ?pwa_install=1 and prompt is already captured
    if (!inIframe) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('pwa_install') === '1' && window.__beforeInstallPromptEvent) {
        params.delete('pwa_install');
        const newSearch = params.toString() ? `?${params.toString()}` : '';
        window.history.replaceState({}, '', `${window.location.pathname}${newSearch}${window.location.hash}`);
        window.__beforeInstallPromptEvent.prompt().catch(() => {});
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handleCustomPromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [deferredPrompt]);

  const install = useCallback(async (): Promise<boolean> => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__beforeInstallPromptEvent : null);
    if (!promptEvent) return false;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        if (typeof window !== 'undefined') {
          window.__beforeInstallPromptEvent = null;
        }
        return true;
      }
    } catch (err) {
      console.warn('PWA install prompt error:', err);
    }
    return false;
  }, [deferredPrompt]);

  /**
   * Executes the PWA installation directly:
   * - If prompt is ready: triggers prompt directly
   * - If inside iframe: launches top-level window where Android Chrome allows beforeinstallprompt and 3-dots
   */
  const executeInstall = useCallback(async (): Promise<{ success: boolean; launchedTopWindow?: boolean }> => {
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? window.__beforeInstallPromptEvent : null);

    // 1. Direct prompt if available
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') {
            window.__beforeInstallPromptEvent = null;
          }
          return { success: true };
        }
        return { success: false };
      } catch (err) {
        console.warn('Error during direct install prompt:', err);
      }
    }

    // 2. If running inside an iframe (e.g. AI Studio preview), Android Chrome suppresses
    // the install prompt and 3-dots option. Open in top-level window with auto-install trigger.
    if (typeof window !== 'undefined' && window.self !== window.top) {
      const url = new URL(window.location.href);
      url.searchParams.set('pwa_install', '1');
      window.open(url.toString(), '_blank');
      return { success: false, launchedTopWindow: true };
    }

    return { success: false };
  }, [deferredPrompt]);

  return {
    isInstallable: Boolean(deferredPrompt || (typeof window !== 'undefined' && window.__beforeInstallPromptEvent)),
    isInstalled,
    isIOS,
    isIframe,
    install,
    executeInstall,
  };
}
