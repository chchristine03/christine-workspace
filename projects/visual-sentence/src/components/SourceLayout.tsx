import { StyleSheet, View } from 'react-native';

import type { NormalizedCrop, SourceImage } from '../types';
import { SourceCell } from './SourceCell';

type Props = {
  images: SourceImage[];
  activeImageId: string | null;
  onActivate: (id: string) => void;
  onImageChange: (id: string, patch: Partial<SourceImage>) => void;
  onCropChange: (id: string, crop: NormalizedCrop) => void;
};

export function SourceLayout({
  images,
  activeImageId,
  onActivate,
  onImageChange,
  onCropChange,
}: Props) {
  const count = Math.min(4, Math.max(1, images.length || 1));
  const cell = (index: number) => {
    const image = images[index];
    return image ? (
      <SourceCell
        key={image.id}
        image={image}
        active={activeImageId === image.id}
        onActivate={() => onActivate(image.id)}
        onImageChange={(patch) => onImageChange(image.id, patch)}
        onCropChange={(crop) => onCropChange(image.id, crop)}
      />
    ) : null;
  };

  const activeIndex = images.findIndex((image) => image.id === activeImageId);
  if (activeIndex >= 0) {
    return <View style={styles.fill}>{cell(activeIndex)}</View>;
  }

  if (count === 1) {
    return images[0] ? cell(0) : <View style={styles.flex} />;
  }

  if (count === 2) {
    return (
      <View style={styles.fill}>
        {cell(0)}
        {cell(1)}
      </View>
    );
  }

  if (count === 3) {
    return (
      <View style={styles.fill}>
        {cell(0)}
        <View style={styles.row}>
          {cell(1)}
          {cell(2)}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <View style={styles.row}>
        {cell(0)}
        {cell(1)}
      </View>
      <View style={styles.row}>
        {cell(2)}
        {cell(3)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
});
