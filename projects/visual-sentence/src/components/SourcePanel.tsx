import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import type { NormalizedCrop, SourceImage } from '../types';
import { SourceLayout } from './SourceLayout';

type Props = {
  images: SourceImage[];
  activeImageId: string | null;
  onActivate: (id: string) => void;
  onDeactivate: () => void;
  onImageChange: (id: string, patch: Partial<SourceImage>) => void;
  onCropChange: (id: string, crop: NormalizedCrop) => void;
};

export function SourcePanel(props: Props) {
  return (
    <View style={styles.panel}>
      <SourceLayout {...props} />
      {props.activeImageId ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Done cropping"
          onPress={props.onDeactivate}
          style={styles.done}
        >
          <Text style={styles.check}>✓</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    overflow: 'hidden',
  },
  done: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  check: {
    color: colors.ink,
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '500',
  },
});
