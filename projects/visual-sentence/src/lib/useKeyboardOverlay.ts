import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Keyboard must overlay the photo panel. Never treat it as extra safe-area
 * or as a reason to reflow the 50/50 poster.
 */
export function useKeyboardOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvent, () => setOpen(true));
    const hide = Keyboard.addListener(hideEvent, () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const sync = () => {
      const focused = document.activeElement as HTMLElement | null;
      const editing =
        !!focused &&
        (focused.tagName === 'INPUT' ||
          focused.tagName === 'TEXTAREA' ||
          focused.isContentEditable);
      const occluded = window.innerHeight - viewport.height > 120;
      setOpen(editing && occluded);
    };

    viewport.addEventListener('resize', sync);
    document.addEventListener('focusin', sync);
    document.addEventListener('focusout', sync);
    return () => {
      viewport.removeEventListener('resize', sync);
      document.removeEventListener('focusin', sync);
      document.removeEventListener('focusout', sync);
    };
  }, []);

  return open;
}
