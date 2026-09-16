import type { NormalizedCrop } from '../types';

export type PixelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ImagePlacement = {
  scale: number;
  renderedWidth: number;
  renderedHeight: number;
  offsetX: number;
  offsetY: number;
};

export function cropAspect(
  naturalWidth: number,
  naturalHeight: number,
  crop: NormalizedCrop,
): number {
  const width = crop.width * naturalWidth;
  const height = crop.height * naturalHeight;
  if (height === 0) {
    return 1;
  }
  return width / height;
}

/** Inline fragment is slightly larger than the type, while staying inside its line box. */
export function inlineGlyphWindow(
  fontSize: number,
  naturalWidth: number,
  naturalHeight: number,
  crop: NormalizedCrop,
): { box: { width: number; height: number }; image: PixelRect } {
  const height = fontSize * 1.15;
  const width = height * cropAspect(naturalWidth, naturalHeight, crop);
  const imageWidth = crop.width === 0 ? width : width / crop.width;
  const imageHeight = crop.height === 0 ? height : height / crop.height;
  return {
    box: { width, height },
    image: {
      x: -crop.x * imageWidth,
      y: -crop.y * imageHeight,
      width: imageWidth,
      height: imageHeight,
    },
  };
}

export function coverPlacement(
  cellWidth: number,
  cellHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): ImagePlacement {
  const scale = Math.max(cellWidth / naturalWidth, cellHeight / naturalHeight);
  return placementForScale(cellWidth, cellHeight, naturalWidth, naturalHeight, scale);
}

/** Full bitmap placement used while editing so every crop handle remains reachable. */
export function containPlacement(
  cellWidth: number,
  cellHeight: number,
  naturalWidth: number,
  naturalHeight: number,
): ImagePlacement {
  const scale = Math.min(cellWidth / naturalWidth, cellHeight / naturalHeight);
  return placementForScale(cellWidth, cellHeight, naturalWidth, naturalHeight, scale);
}

function placementForScale(
  cellWidth: number,
  cellHeight: number,
  naturalWidth: number,
  naturalHeight: number,
  scale: number,
): ImagePlacement {
  const renderedWidth = naturalWidth * scale;
  const renderedHeight = naturalHeight * scale;
  return {
    scale,
    renderedWidth,
    renderedHeight,
    offsetX: (cellWidth - renderedWidth) / 2,
    offsetY: (cellHeight - renderedHeight) / 2,
  };
}

export function cropInPlacement(
  placement: ImagePlacement,
  crop: NormalizedCrop,
): PixelRect {
  return {
    x: placement.offsetX + crop.x * placement.renderedWidth,
    y: placement.offsetY + crop.y * placement.renderedHeight,
    width: crop.width * placement.renderedWidth,
    height: crop.height * placement.renderedHeight,
  };
}

/** Crop rectangle in the same cover-fitted coordinate space as the source photo. */
export function cropInCoverCell(
  cellWidth: number,
  cellHeight: number,
  naturalWidth: number,
  naturalHeight: number,
  crop: NormalizedCrop,
): PixelRect {
  const cover = coverPlacement(cellWidth, cellHeight, naturalWidth, naturalHeight);
  return cropInPlacement(cover, crop);
}

function clipRect(rect: PixelRect, cell: PixelRect): PixelRect | null {
  const x = Math.max(rect.x, cell.x);
  const y = Math.max(rect.y, cell.y);
  const right = Math.min(rect.x + rect.width, cell.x + cell.width);
  const bottom = Math.min(rect.y + rect.height, cell.y + cell.height);
  if (right <= x || bottom <= y) {
    return null;
  }
  return { x, y, width: right - x, height: bottom - y };
}

/** White missing region in a cover-fitted cell, in cell pixels. */
export function holeInCoverCell(
  cellWidth: number,
  cellHeight: number,
  naturalWidth: number,
  naturalHeight: number,
  crop: NormalizedCrop,
): PixelRect | null {
  const hole = cropInCoverCell(
    cellWidth,
    cellHeight,
    naturalWidth,
    naturalHeight,
    crop,
  );
  return clipRect(hole, { x: 0, y: 0, width: cellWidth, height: cellHeight });
}
