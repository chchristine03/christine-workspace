import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardOverlay } from '../lib/useKeyboardOverlay';
import { colors } from '../theme';

type Props = {
  journal: ReactNode;
  source: ReactNode;
};

export function CompositionShell({ journal, source }: Props) {
  const insets = useSafeAreaInsets();
  const keyboardOpen = useKeyboardOverlay();
  const openHeightRef = useRef<number | null>(null);
  const [frozenHeight, setFrozenHeight] = useState<number | null>(null);

  const onRootLayout = useCallback(
    (event: LayoutChangeEvent) => {
      if (keyboardOpen) {
        return;
      }
      openHeightRef.current = event.nativeEvent.layout.height;
    },
    [keyboardOpen],
  );

  useEffect(() => {
    if (keyboardOpen) {
      if (openHeightRef.current != null) {
        setFrozenHeight(openHeightRef.current);
      }
      return;
    }
    setFrozenHeight(null);
  }, [keyboardOpen]);

  const paddingTop = webInset(insets.top, 'safe-area-inset-top');
  const paddingBottom = webInset(insets.bottom, 'safe-area-inset-bottom');

  return (
    <View onLayout={onRootLayout} style={styles.root}>
      <View
        style={[
          styles.chrome,
          { paddingTop, paddingBottom },
          frozenHeight != null ? { height: frozenHeight, flexGrow: 0, flexShrink: 0 } : null,
        ]}
      >
        <View style={styles.composition}>
          <View style={styles.half}>{journal}</View>
          <View style={styles.half}>{source}</View>
        </View>
      </View>
    </View>
  );
}

/** ZIP chrome bars are the device/browser safe area, not a second layout. */
function webInset(native: number, cssVar: 'safe-area-inset-top' | 'safe-area-inset-bottom') {
  if (Platform.OS !== 'web') {
    return native;
  }
  return `max(${native}px, env(${cssVar}, 0px))` as unknown as number;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.chrome,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? {
          height: '100dvh' as unknown as number,
          maxHeight: '100dvh' as unknown as number,
        }
      : null),
  },
  chrome: {
    flex: 1,
    backgroundColor: colors.chrome,
    overflow: 'hidden',
  },
  composition: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { maxWidth: 430 } : null),
  },
  half: {
    flex: 1,
    overflow: 'hidden',
  },
});
