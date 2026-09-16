import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  height: number;
  lineHeight?: number;
};

export function Caret({ height }: Props) {
  const [on, setOn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setOn((value) => !value), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <View
      style={[
        styles.caret,
        {
          height,
          opacity: on ? 1 : 0,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  caret: {
    width: 1.5,
    backgroundColor: colors.ink,
    marginRight: -1.5,
  },
});
