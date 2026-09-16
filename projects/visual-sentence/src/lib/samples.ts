import type { NormalizedCrop } from '../types';

const walk = require('../../assets/samples/walk.jpg') as number;
const park = require('../../assets/samples/park.jpg') as number;

export const SAMPLE_PHOTOS = [
  {
    source: walk,
    naturalWidth: 1600,
    naturalHeight: 1000,
    crop: { x: 0.31, y: 0.22, width: 0.18, height: 0.27 } satisfies NormalizedCrop,
  },
  {
    source: park,
    naturalWidth: 1600,
    naturalHeight: 1000,
    crop: { x: 0.58, y: 0.48, width: 0.14, height: 0.12 } satisfies NormalizedCrop,
  },
] as const;
