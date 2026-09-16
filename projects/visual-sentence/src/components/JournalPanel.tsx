import { type ComponentProps, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { lineHeightFor, useFitFontSize } from '../lib/useFitFontSize';
import { colors, layout } from '../theme';
import type { JournalNode, SourceImage } from '../types';
import { JournalEditor } from './JournalEditor';

type Props = {
  nodes: JournalNode[];
  images: SourceImage[];
  onChange: ComponentProps<typeof JournalEditor>['onChange'];
};

export function JournalPanel({ nodes, images, onChange }: Props) {
  const [area, setArea] = useState({ width: 0, height: 0 });
  const [contentHeight, setContentHeight] = useState(0);
  const { fontSize, overflowing } = useFitFontSize(area.height, contentHeight);
  const lineHeight = lineHeightFor(fontSize);

  const onAreaLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setArea({ width, height });
  };

  return (
    <View style={styles.panel}>
      <View onLayout={onAreaLayout} style={styles.measure}>
        <JournalEditor
          nodes={nodes}
          images={images}
          fontSize={fontSize}
          lineHeight={lineHeight}
          overflowing={overflowing}
          onContentHeight={setContentHeight}
          onChange={onChange}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: colors.journalBg,
    overflow: 'hidden',
    paddingHorizontal: layout.journalSideInset,
    paddingVertical: 16,
  },
  measure: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
