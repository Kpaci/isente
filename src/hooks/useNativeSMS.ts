import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { parseMoMoSMS } from '../lib/momoParser';
import { ParsedMoMoSMS } from '../types/finance';

export interface NativeSMSEventPayload {
  sender?: string;
  message: string;
  timestamp?: number;
}

export function useNativeSMS() {
  const [isNative, setIsNative] = useState(false);
  const [detectedReceipt, setDetectedReceipt] = useState<ParsedMoMoSMS | null>(null);
  const [hasSMSPermission, setHasSMSPermission] = useState<boolean>(true);

  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);

    // Handler for native Android broadcast event
    const handleNativeMoMoSMS = (event: Event) => {
      try {
        const customEvent = event as CustomEvent<string | NativeSMSEventPayload>;
        let rawMessage = '';

        if (typeof customEvent.detail === 'string') {
          try {
            const parsedJson = JSON.parse(customEvent.detail);
            rawMessage = parsedJson.message || '';
          } catch {
            rawMessage = customEvent.detail;
          }
        } else if (customEvent.detail && typeof customEvent.detail === 'object') {
          rawMessage = customEvent.detail.message || '';
        }

        if (!rawMessage || !rawMessage.trim()) return;

        // Run through our verified MoMo parser
        const parsed = parseMoMoSMS(rawMessage);
        if (parsed && parsed.amount > 0) {
          setDetectedReceipt(parsed);
        }
      } catch (err) {
        console.warn('Error handling native SMS event:', err);
      }
    };

    window.addEventListener('momoSMSReceived', handleNativeMoMoSMS);

    return () => {
      window.removeEventListener('momoSMSReceived', handleNativeMoMoSMS);
    };
  }, []);

  const dismissDetected = useCallback(() => {
    setDetectedReceipt(null);
  }, []);

  return {
    isNative,
    detectedReceipt,
    hasSMSPermission,
    dismissDetected,
  };
}
