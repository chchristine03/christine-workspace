import { createElement } from 'react';
import { Asset } from 'expo-asset';
import {
  Image,
  Platform,
  StyleSheet,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
} from 'react-native';

type Props = {
  source: ImageSourcePropType;
  style: StyleProp<ImageStyle>;
};

function sourceUri(source: ImageSourcePropType): string {
  if (typeof source === 'number') {
    return Asset.fromModule(source).uri;
  }
  if (Array.isArray(source)) {
    return source[0] ? sourceUri(source[0]) : '';
  }
  return source.uri ?? '';
}

/** RN Web's Image uses a negative-z-index background that disappears in clipped crop windows. */
export function Bitmap({ source, style }: Props) {
  if (Platform.OS !== 'web') {
    return <Image source={source} resizeMode="stretch" style={style} />;
  }

  return createElement('div', {
    'aria-hidden': true,
    style: {
      ...StyleSheet.flatten(style),
      display: 'block',
      backgroundImage: `url("${sourceUri(source)}")`,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '100% 100%',
      pointerEvents: 'none',
      userSelect: 'none',
    },
  });
}
