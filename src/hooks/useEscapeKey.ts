import { useEffect } from 'react';

/**
 * Hook to trigger a callback when the user presses the 'Escape' key
 */
export function useEscapeKey(onEscape: () => void, isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Esc') {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape, isEnabled]);
}
