import type { ImageNode, JournalNode, SourceImage, TextNode } from '../types';
import { createId } from './ids';
import { SAMPLE_PHOTOS } from './samples';

export type Caret = {
  nodeIndex: number;
  offset: number;
};

export type DocumentSelection = {
  start: number;
  end: number;
};

const PLACEHOLDER_CROPS = [
  { x: 0.31, y: 0.22, width: 0.18, height: 0.27 },
  { x: 0.58, y: 0.48, width: 0.14, height: 0.12 },
  { x: 0.42, y: 0.62, width: 0.16, height: 0.14 },
  { x: 0.52, y: 0.18, width: 0.14, height: 0.2 },
] as const;

export function createPlaceholderSource(index: number): SourceImage {
  const sample = SAMPLE_PHOTOS[index % SAMPLE_PHOTOS.length];
  return {
    id: createId('img'),
    source: sample.source,
    naturalWidth: sample.naturalWidth,
    naturalHeight: sample.naturalHeight,
    crop: PLACEHOLDER_CROPS[index] ?? PLACEHOLDER_CROPS[0],
  };
}

export function createEmptySource(): SourceImage {
  return {
    id: createId('img'),
    naturalWidth: 1,
    naturalHeight: 1,
    crop: { x: 0.2, y: 0.3, width: 0.6, height: 0.4 },
  };
}

export function textNode(value: string): TextNode {
  return { id: createId('t'), type: 'text', value };
}

export function imageNode(sourceImageId: string): ImageNode {
  return { id: createId('i'), type: 'image', sourceImageId };
}

export function placeholderSources(): SourceImage[] {
  return [createPlaceholderSource(0), createPlaceholderSource(1)].map((image, index) => ({
    ...image,
    id: `img${index + 1}`,
  }));
}

export function initialJournal(images: SourceImage[]): JournalNode[] {
  const first = images[0];
  const second = images[1];
  if (!first || !second) {
    return [textNode('')];
  }
  return [
    textNode('i went on a walk'),
    imageNode(first.id),
    textNode(' to the park'),
    imageNode(second.id),
    textNode(''),
  ];
}

export function activeText(nodes: JournalNode[], caret: Caret): TextNode | null {
  const node = nodes[caret.nodeIndex];
  return node?.type === 'text' ? node : null;
}

export function ensureTextEdges(nodes: JournalNode[]): JournalNode[] {
  if (nodes.length === 0) {
    return [textNode('')];
  }
  let next = nodes;
  if (next[0].type !== 'text') {
    next = [textNode(''), ...next];
  }
  if (next[next.length - 1].type !== 'text') {
    next = [...next, textNode('')];
  }
  return next;
}

export function isLegalText(oldValue: string, nextValue: string): boolean {
  const withoutSlots = nextValue.replaceAll('()', '');
  if (/\([^)]+\)/.test(withoutSlots)) {
    return false;
  }
  if ((withoutSlots.match(/\(/g) ?? []).length > 1) {
    return false;
  }

  const prefix = commonPrefixLength(oldValue, nextValue);
  const suffix = commonSuffixLength(oldValue, nextValue, prefix);
  const inserted = nextValue.slice(prefix, nextValue.length - suffix);
  if (
    prefix > 0 &&
    oldValue[prefix - 1] === '(' &&
    inserted.length > 0 &&
    inserted !== ')' &&
    inserted !== '()'
  ) {
    return false;
  }
  return true;
}

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let index = 0;
  while (index < max && a[index] === b[index]) {
    index += 1;
  }
  return index;
}

function commonSuffixLength(a: string, b: string, prefix: number): number {
  let index = 0;
  while (
    index < a.length - prefix &&
    index < b.length - prefix &&
    a[a.length - 1 - index] === b[b.length - 1 - index]
  ) {
    index += 1;
  }
  return index;
}

export function caretAfterChange(oldValue: string, nextValue: string): number {
  const prefix = commonPrefixLength(oldValue, nextValue);
  if (nextValue.length >= oldValue.length) {
    return Math.min(nextValue.length, prefix + (nextValue.length - oldValue.length));
  }
  return prefix;
}

export function valueFromNativeChange(oldValue: string, nativeNext: string, offset: number): string {
  if (nativeNext === oldValue) {
    return oldValue;
  }
  if (nativeNext.length < oldValue.length) {
    const count = oldValue.length - nativeNext.length;
    const from = Math.max(0, offset - count);
    return oldValue.slice(0, from) + oldValue.slice(offset);
  }
  if (nativeNext.length > oldValue.length) {
    const count = nativeNext.length - oldValue.length;
    const prefix = commonPrefixLength(oldValue, nativeNext);
    const inserted = nativeNext.slice(prefix, prefix + count);
    return oldValue.slice(0, offset) + inserted + oldValue.slice(offset);
  }
  return nativeNext;
}

export function applyTextChange(
  nodes: JournalNode[],
  images: SourceImage[],
  caret: Caret,
  nextValue: string,
): { nodes: JournalNode[]; images: SourceImage[]; caret: Caret } {
  const node = nodes[caret.nodeIndex];
  if (!node || node.type !== 'text') {
    return { nodes, images, caret };
  }
  if (nextValue === node.value) {
    return { nodes, images, caret };
  }
  if (!isLegalText(node.value, nextValue)) {
    return { nodes, images, caret };
  }

  const pieces = nextValue.split('()');
  const slots = pieces.length - 1;
  if (images.length + slots > 4) {
    return { nodes, images, caret };
  }

  if (slots === 0) {
    const next = nodes.slice();
    next[caret.nodeIndex] = { ...node, value: nextValue };
    return {
      nodes: next,
      images,
      caret: { nodeIndex: caret.nodeIndex, offset: caretAfterChange(node.value, nextValue) },
    };
  }

  const built: JournalNode[] = [];
  const nextImages = images.slice();
  pieces.forEach((piece, index) => {
    built.push(index === 0 ? { ...node, value: piece } : textNode(piece));
    if (index < pieces.length - 1) {
      const image = createEmptySource();
      nextImages.push(image);
      built.push(imageNode(image.id));
    }
  });

  const nextNodes = ensureTextEdges([
    ...nodes.slice(0, caret.nodeIndex),
    ...built,
    ...nodes.slice(caret.nodeIndex + 1),
  ]);

  const lastPieceIndex = built.length - 1;
  const caretNodeIndex = caret.nodeIndex + lastPieceIndex;
  return {
    nodes: nextNodes,
    images: nextImages,
    caret: { nodeIndex: caretNodeIndex, offset: 0 },
  };
}

export function deleteBackward(
  nodes: JournalNode[],
  images: SourceImage[],
  caret: Caret,
): { nodes: JournalNode[]; images: SourceImage[]; caret: Caret } {
  const node = nodes[caret.nodeIndex];
  if (!node || node.type !== 'text') {
    return { nodes, images, caret };
  }

  if (caret.offset > 0) {
    const value = node.value.slice(0, caret.offset - 1) + node.value.slice(caret.offset);
    if (!isLegalText(node.value, value)) {
      return { nodes, images, caret };
    }
    const next = nodes.slice();
    next[caret.nodeIndex] = { ...node, value };
    return {
      nodes: next,
      images,
      caret: { nodeIndex: caret.nodeIndex, offset: caret.offset - 1 },
    };
  }

  if (caret.nodeIndex === 0) {
    return { nodes, images, caret };
  }

  const prev = nodes[caret.nodeIndex - 1];
  if (prev.type === 'image') {
    return removeImageAt(nodes, images, caret.nodeIndex - 1);
  }

  const merged = prev.value + node.value;
  const next = nodes.slice();
  next.splice(caret.nodeIndex - 1, 2, { ...prev, value: merged });
  return {
    nodes: next,
    images,
    caret: { nodeIndex: caret.nodeIndex - 1, offset: prev.value.length },
  };
}

export function removeImageAt(
  nodes: JournalNode[],
  images: SourceImage[],
  imageIndex: number,
): { nodes: JournalNode[]; images: SourceImage[]; caret: Caret } {
  const target = nodes[imageIndex];
  if (!target || target.type !== 'image') {
    return { nodes, images, caret: { nodeIndex: 0, offset: 0 } };
  }

  const nextImages = images.filter((image) => image.id !== target.sourceImageId);
  const nextNodes = nodes.slice();
  nextNodes.splice(imageIndex, 1);

  const left = nextNodes[imageIndex - 1];
  const right = nextNodes[imageIndex];
  if (left?.type === 'text' && right?.type === 'text') {
    const offset = left.value.length;
    nextNodes.splice(imageIndex - 1, 2, { ...left, value: left.value + right.value });
    return {
      nodes: ensureTextEdges(nextNodes),
      images: nextImages,
      caret: { nodeIndex: imageIndex - 1, offset },
    };
  }

  const bounded = ensureTextEdges(nextNodes);
  const caretIndex = Math.max(0, imageIndex - 1);
  const caretNode = bounded[caretIndex];
  return {
    nodes: bounded,
    images: nextImages,
    caret: {
      nodeIndex: caretIndex,
      offset: caretNode?.type === 'text' ? caretNode.value.length : 0,
    },
  };
}

export function endCaret(nodes: JournalNode[]): Caret {
  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const node = nodes[index];
    if (node.type === 'text') {
      return { nodeIndex: index, offset: node.value.length };
    }
  }
  return { nodeIndex: 0, offset: 0 };
}

export function caretAfterImage(nodes: JournalNode[], imageIndex: number): Caret {
  const after = nodes[imageIndex + 1];
  if (after?.type === 'text') {
    return { nodeIndex: imageIndex + 1, offset: 0 };
  }
  return endCaret(nodes);
}

export function documentOffsetForCaret(nodes: JournalNode[], caret: Caret): number {
  let offset = 0;
  for (let index = 0; index < caret.nodeIndex; index += 1) {
    const node = nodes[index];
    offset += node.type === 'text' ? node.value.length : 1;
  }
  return offset + caret.offset;
}

export function caretForDocumentOffset(nodes: JournalNode[], target: number): Caret {
  let offset = 0;
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    const length = node.type === 'text' ? node.value.length : 1;
    if (node.type === 'text' && target <= offset + length) {
      return { nodeIndex: index, offset: clampOffset(target - offset, length) };
    }
    if (node.type === 'image' && target <= offset) {
      const before = nodes[index - 1];
      if (before?.type === 'text') {
        return { nodeIndex: index - 1, offset: before.value.length };
      }
    }
    offset += length;
  }
  return endCaret(nodes);
}

function clampOffset(offset: number, length: number) {
  return Math.max(0, Math.min(length, offset));
}

export function deleteDocumentRange(
  nodes: JournalNode[],
  images: SourceImage[],
  selection: DocumentSelection,
): { nodes: JournalNode[]; images: SourceImage[]; caret: Caret } {
  const start = Math.max(0, Math.min(selection.start, selection.end));
  const end = Math.max(start, Math.max(selection.start, selection.end));
  if (start === end) {
    return { nodes, images, caret: caretForDocumentOffset(nodes, start) };
  }

  let offset = 0;
  const removedImageIds = new Set<string>();
  const kept: JournalNode[] = [];

  nodes.forEach((node) => {
    const length = node.type === 'text' ? node.value.length : 1;
    const nodeStart = offset;
    const nodeEnd = offset + length;
    offset = nodeEnd;

    if (nodeEnd <= start || nodeStart >= end) {
      kept.push(node);
      return;
    }

    if (node.type === 'image') {
      removedImageIds.add(node.sourceImageId);
      return;
    }

    const localStart = clampOffset(start - nodeStart, length);
    const localEnd = clampOffset(end - nodeStart, length);
    const value = node.value.slice(0, localStart) + node.value.slice(localEnd);
    kept.push({ ...node, value });
  });

  const merged: JournalNode[] = [];
  ensureTextEdges(kept).forEach((node) => {
    const previous = merged[merged.length - 1];
    if (node.type === 'text' && previous?.type === 'text') {
      merged[merged.length - 1] = { ...previous, value: previous.value + node.value };
    } else {
      merged.push(node);
    }
  });
  const nextNodes = ensureTextEdges(merged);

  return {
    nodes: nextNodes,
    images: images.filter((image) => !removedImageIds.has(image.id)),
    caret: caretForDocumentOffset(nextNodes, start),
  };
}

export function sourceCount(length: number): 1 | 2 | 3 | 4 {
  if (length <= 1) {
    return 1;
  }
  if (length === 2) {
    return 2;
  }
  if (length === 3) {
    return 3;
  }
  return 4;
}
