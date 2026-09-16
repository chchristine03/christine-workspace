import { Platform } from 'react-native';

function applyLock(el: HTMLElement) {
  el.style.height = '100dvh';
  el.style.maxHeight = '100dvh';
  el.style.overflow = 'hidden';
  el.style.margin = '0';
  el.style.overscrollBehavior = 'none';
}

/** Keep the web page from scrolling; honor iOS safe-area env() via viewport-fit. */
export function lockViewport() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }

  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
    );
  }

  applyLock(document.documentElement);
  applyLock(document.body);

  const root = document.getElementById('root');
  if (root) {
    applyLock(root);
  }

  const pin = () => {
    window.scrollTo(0, 0);
  };
  window.addEventListener('scroll', pin, { passive: true });
  document.addEventListener('focusin', pin);
}

