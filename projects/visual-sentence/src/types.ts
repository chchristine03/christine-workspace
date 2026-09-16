import type { ImageSourcePropType } from 'react-native';

export type NormalizedCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SourceImage = {
  id: string;
  source?: ImageSourcePropType;
  naturalWidth: number;
  naturalHeight: number;
  crop?: NormalizedCrop;
};

export type TextNode = {
  id: string;
  type: 'text';
  value: string;
};

export type ImageNode = {
  id: string;
  type: 'image';
  sourceImageId: string;
};

export type JournalNode = TextNode | ImageNode;

export type SourceCount = 1 | 2 | 3 | 4;
