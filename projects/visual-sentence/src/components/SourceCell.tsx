import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import {
  containPlacement,
  coverPlacement,
  holeInCoverCell,
} from '../lib/cropMath';
import { colors } from '../theme';
import type { NormalizedCrop, SourceImage } from '../types';
import { Bitmap } from './Bitmap';
import { CropOverlay } from './CropOverlay';

type Props = {
  image: SourceImage;
  active: boolean;
  onActivate: () => void;
  onImageChange: (patch: Partial<SourceImage>) => void;
  onCropChange: (crop: NormalizedCrop) => void;
};

export function SourceCell({
  image,
  active,
  onActivate,
  onImageChange,
  onCropChange,
}: Props) {
  const cellRef = useRef<View>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof ResizeObserver === 'undefined') {
      return;
    }
    const element = cellRef.current as unknown as HTMLElement | null;
    if (!element) {
      return;
    }
    const sync = () => {
      const rect = element.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const placement =
    size.width > 0
      ? active
        ? containPlacement(size.width, size.height, image.naturalWidth, image.naturalHeight)
        : coverPlacement(size.width, size.height, image.naturalWidth, image.naturalHeight)
      : null;
  const hole =
    image.crop && size.width > 0
      ? holeInCoverCell(
          size.width,
          size.height,
          image.naturalWidth,
          image.naturalHeight,
          image.crop,
        )
      : null;

  const choosePhoto = async () => {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    const asset = result.assets?.[0];
    if (!asset) {
      return;
    }
    const dimensions = await imageDimensions(asset.uri, asset.width, asset.height);
    onImageChange({
      source: { uri: asset.uri },
      naturalWidth: dimensions.width,
      naturalHeight: dimensions.height,
      crop: { x: 0.2, y: 0.3, width: 0.6, height: 0.4 },
    });
    onActivate();
  };

  return (
    <View ref={cellRef} onLayout={onLayout} style={styles.cell}>
      {placement && image.source != null ? (
        <Bitmap
          source={image.source}
          style={{
            position: 'absolute',
            width: placement.renderedWidth,
            height: placement.renderedHeight,
            left: placement.offsetX,
            top: placement.offsetY,
          }}
        />
      ) : (
        <View style={[styles.fallback, { backgroundColor: colors.cells[0] }]} />
      )}
      {image.source == null ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Choose a photo"
          onPress={choosePhoto}
          style={styles.choose}
        >
          <Text style={styles.chooseMark}>+</Text>
          <Text style={styles.chooseText}>choose photo</Text>
        </Pressable>
      ) : null}
      {image.source != null && !active && hole ? (
        <View
          pointerEvents="none"
          style={[
            styles.hole,
            {
              left: hole.x,
              top: hole.y,
              width: hole.width,
              height: hole.height,
            },
          ]}
        />
      ) : null}
      {image.source != null && !active ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit crop"
          onPress={onActivate}
          style={[StyleSheet.absoluteFill, styles.edit]}
        />
      ) : null}
      {active && image.source != null ? (
        <CropOverlay
          image={image}
          width={size.width}
          height={size.height}
          onChange={onCropChange}
        />
      ) : null}
    </View>
  );
}

function imageDimensions(uri: string, width?: number, height?: number) {
  if (
    width != null &&
    height != null &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  ) {
    return Promise.resolve({ width, height });
  }
  return new Promise<{ width: number; height: number }>((resolve) => {
    Image.getSize(
      uri,
      (resolvedWidth, resolvedHeight) =>
        resolve({
          width: Math.max(1, resolvedWidth),
          height: Math.max(1, resolvedHeight),
        }),
      () => resolve({ width: 1, height: 1 }),
    );
  });
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 0.01,
    backgroundColor: colors.cells[0],
  },
  fallback: {
    ...StyleSheet.absoluteFill,
  },
  choose: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8D4CE',
  },
  chooseMark: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 34,
  },
  chooseText: {
    color: colors.ink,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  hole: {
    position: 'absolute',
    zIndex: 2,
    backgroundColor: colors.hole,
  },
  edit: {
    zIndex: 3,
  },
});
