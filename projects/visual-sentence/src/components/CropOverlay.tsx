import { useMemo, useRef } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { containPlacement, cropInPlacement } from '../lib/cropMath';
import type { NormalizedCrop, SourceImage } from '../types';

type Handle = 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

type Props = {
  image: SourceImage;
  width: number;
  height: number;
  onChange: (crop: NormalizedCrop) => void;
};

const MIN_SIZE = 0.06;
const MIN_DISPLAY_SIZE = 36;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function resizedCrop(
  start: NormalizedCrop,
  handle: Handle,
  dx: number,
  dy: number,
  minWidth: number,
  minHeight: number,
): NormalizedCrop {
  if (handle === 'move') {
    return {
      ...start,
      x: clamp(start.x + dx, 0, 1 - start.width),
      y: clamp(start.y + dy, 0, 1 - start.height),
    };
  }

  let left = start.x;
  let top = start.y;
  let right = start.x + start.width;
  let bottom = start.y + start.height;

  if (handle.includes('w')) left = clamp(left + dx, 0, Math.max(0, right - minWidth));
  if (handle.includes('e')) right = clamp(right + dx, left + minWidth, 1);
  if (handle.includes('n')) top = clamp(top + dy, 0, Math.max(0, bottom - minHeight));
  if (handle.includes('s')) bottom = clamp(bottom + dy, top + minHeight, 1);

  return { x: left, y: top, width: right - left, height: bottom - top };
}

function DragTarget({
  handle,
  crop,
  imageWidth,
  imageHeight,
  style,
  showKnob = false,
  onChange,
}: {
  handle: Handle;
  crop: NormalizedCrop;
  imageWidth: number;
  imageHeight: number;
  style: StyleProp<ViewStyle>;
  showKnob?: boolean;
  onChange: (crop: NormalizedCrop) => void;
}) {
  const start = useRef(crop);
  const cropRef = useRef(crop);
  const onChangeRef = useRef(onChange);
  const metricsRef = useRef({ imageWidth, imageHeight });
  cropRef.current = crop;
  onChangeRef.current = onChange;
  metricsRef.current = { imageWidth, imageHeight };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          start.current = cropRef.current;
        },
        onPanResponderMove: (_event, gesture) => {
          onChangeRef.current(
            resizedCrop(
              start.current,
              handle,
              gesture.dx / metricsRef.current.imageWidth,
              gesture.dy / metricsRef.current.imageHeight,
              Math.min(
                1,
                Math.max(MIN_SIZE, MIN_DISPLAY_SIZE / metricsRef.current.imageWidth),
              ),
              Math.min(
                1,
                Math.max(MIN_SIZE, MIN_DISPLAY_SIZE / metricsRef.current.imageHeight),
              ),
            ),
          );
        },
      }),
    [handle],
  );

  return (
    <View
      {...responder.panHandlers}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={handle === 'move' ? 'Move crop' : `Crop ${handle} handle`}
      style={style}
    >
      {showKnob ? <View pointerEvents="none" style={[styles.knob, knobStyle(handle)]} /> : null}
    </View>
  );
}

export function CropOverlay({ image, width, height, onChange }: Props) {
  if (!image.crop || image.source == null || width <= 0 || height <= 0) {
    return null;
  }
  const crop = image.crop;

  const placement = containPlacement(
    width,
    height,
    image.naturalWidth,
    image.naturalHeight,
  );
  const rect = cropInPlacement(placement, crop);
  const cropStyle = {
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
  };

  return (
    <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, styles.overlay]}>
      <View pointerEvents="none" style={[styles.shade, { left: 0, top: 0, right: 0, height: rect.y }]} />
      <View pointerEvents="none" style={[styles.shade, { left: 0, top: rect.y, width: rect.x, height: rect.height }]} />
      <View pointerEvents="none" style={[styles.shade, { left: rect.x + rect.width, right: 0, top: rect.y, height: rect.height }]} />
      <View pointerEvents="none" style={[styles.shade, { left: 0, right: 0, top: rect.y + rect.height, bottom: 0 }]} />

      <DragTarget
        handle="move"
        crop={crop}
        imageWidth={placement.renderedWidth}
        imageHeight={placement.renderedHeight}
        onChange={onChange}
        style={[styles.selection, cropStyle]}
      />

      {([
        'nw',
        'n',
        'ne',
        'e',
        'se',
        's',
        'sw',
        'w',
      ] as const).map((handle) => (
        <DragTarget
          key={handle}
          handle={handle}
          crop={crop}
          imageWidth={placement.renderedWidth}
          imageHeight={placement.renderedHeight}
          onChange={onChange}
          showKnob
          style={[styles.handleTouch, handlePosition(handle, rect)]}
        />
      ))}
    </View>
  );
}

function handlePosition(handle: Exclude<Handle, 'move'>, rect: { x: number; y: number; width: number; height: number }) {
  const x = handle.includes('w')
    ? rect.x
    : handle.includes('e')
      ? rect.x + rect.width
      : rect.x + rect.width / 2;
  const y = handle.includes('n')
    ? rect.y
    : handle.includes('s')
      ? rect.y + rect.height
      : rect.y + rect.height / 2;
  return { left: x - 22, top: y - 22 };
}

function knobStyle(handle: Handle): ViewStyle {
  if (handle === 'n' || handle === 's') {
    return { width: 28, height: 8 };
  }
  if (handle === 'e' || handle === 'w') {
    return { width: 8, height: 28 };
  }
  return { width: 12, height: 12 };
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 4,
  },
  shade: {
    position: 'absolute',
    backgroundColor: 'rgba(242, 238, 233, 0.58)',
  },
  selection: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#111111',
    backgroundColor: 'transparent',
  },
  handleTouch: {
    position: 'absolute',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  knob: {
    backgroundColor: '#111111',
    borderWidth: 2,
    borderColor: '#F6F2EC',
  },
});
