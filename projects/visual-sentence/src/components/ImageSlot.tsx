import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme';
import type { SourceImage } from '../types';
import { InlineFragment } from './InlineFragment';

type Props = {
  image: SourceImage;
  color: string;
  fontSize: number;
  lineHeight: number;
  onPress: () => void;
};

export function ImageSlot({ image, color, fontSize, lineHeight, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.slot, { height: lineHeight }]}>
      <Text style={[styles.paren, { fontSize, lineHeight }]}>(</Text>
      <InlineFragment image={image} color={color} fontSize={fontSize} />
      <Text style={[styles.paren, { fontSize, lineHeight }]}>)</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  paren: {
    color: colors.ink,
    fontWeight: '400',
  },
});
