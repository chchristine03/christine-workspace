import { StyleSheet, View } from 'react-native';

import { inlineGlyphWindow } from '../lib/cropMath';
import type { SourceImage } from '../types';
import { Bitmap } from './Bitmap';

type Props = {
  image: SourceImage;
  color: string;
  fontSize: number;
};

export function InlineFragment({ image, color, fontSize }: Props) {
  const crop = image.crop;
  if (!crop) {
    return (
      <View
        style={[
          styles.fragment,
          { width: fontSize * 0.92, height: fontSize * 0.92, backgroundColor: color },
        ]}
      />
    );
  }

  const window = inlineGlyphWindow(
    fontSize,
    image.naturalWidth,
    image.naturalHeight,
    crop,
  );

  if (image.source == null) {
    return (
      <View
        style={[
          styles.fragment,
          styles.empty,
          { width: window.box.width, height: window.box.height },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fragment,
        { width: window.box.width, height: window.box.height },
      ]}
    >
      <Bitmap
        source={image.source}
        style={{
          position: 'absolute',
          width: window.image.width,
          height: window.image.height,
          left: window.image.x,
          top: window.image.y,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fragment: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 0.01,
    marginHorizontal: 1,
  },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#777777',
    backgroundColor: 'transparent',
  },
});
