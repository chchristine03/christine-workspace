import { useEffect, useState } from 'react';

import { typography } from '../theme';

const MAX = typography.fontSize;
const MIN = typography.minFontSize;

export function lineHeightFor(fontSize: number): number {
  return fontSize * (typography.lineHeight / typography.fontSize);
}

export function useFitFontSize(availableHeight: number, contentHeight: number): {
  fontSize: number;
  atMinimum: boolean;
  overflowing: boolean;
} {
  const [fontSize, setFontSize] = useState(MAX);

  useEffect(() => {
    if (availableHeight <= 0 || contentHeight <= 0) {
      return;
    }
    if (contentHeight > availableHeight && fontSize > MIN) {
      setFontSize((size) => Math.max(MIN, size - 1));
      return;
    }
    if (contentHeight < availableHeight * 0.68 && fontSize < MAX) {
      setFontSize((size) => Math.min(MAX, size + 1));
    }
  }, [availableHeight, contentHeight, fontSize]);

  const atMinimum = fontSize <= MIN;
  return {
    fontSize,
    atMinimum,
    overflowing: atMinimum && contentHeight > availableHeight + 1,
  };
}
