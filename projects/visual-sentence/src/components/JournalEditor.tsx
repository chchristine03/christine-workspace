import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  type GestureResponderEvent,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

import {
  activeText,
  applyTextChange,
  caretAfterImage,
  deleteDocumentRange,
  deleteBackward,
  documentOffsetForCaret,
  endCaret,
  valueFromNativeChange,
  type Caret,
} from '../lib/document';
import { colors, layout } from '../theme';
import type { JournalNode, SourceImage } from '../types';
import { Caret as CaretMark } from './Caret';
import { ImageSlot } from './ImageSlot';

type Props = {
  nodes: JournalNode[];
  images: SourceImage[];
  fontSize: number;
  lineHeight: number;
  overflowing: boolean;
  onContentHeight: (height: number) => void;
  onChange: (next: {
    nodes: JournalNode[];
    images: SourceImage[];
    caret: Caret;
  }) => void;
};

export function JournalEditor({
  nodes,
  images,
  fontSize,
  lineHeight,
  overflowing,
  onContentHeight,
  onChange,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const rootRef = useRef<View>(null);
  const lineRef = useRef<View>(null);
  const webCaretRef = useRef<View>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);
  const [caret, setCaret] = useState<Caret>(() => endCaret(nodes));
  const caretRef = useRef(caret);
  caretRef.current = caret;
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const [focused, setFocused] = useState(false);
  const partWidths = useRef<Record<string, number>>({});

  const active = activeText(nodes, caret);
  const value = active?.value ?? '';

  const syncWebCaret = (next: Caret, nextNodes = nodesRef.current) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    requestAnimationFrame(() => {
      const marker = webCaretRef.current as unknown as HTMLElement | null;
      const line = lineRef.current as unknown as HTMLElement | null;
      if (!marker || !line) {
        return;
      }
      const target = documentOffsetForCaret(nextNodes, next);
      const tokens = [...line.querySelectorAll<HTMLElement>('[data-document-start]')];
      const token =
        tokens.find((element) => Number(element.dataset.documentStart) === target) ??
        tokens.find((element) => {
          const start = Number(element.dataset.documentStart);
          return target > start && target <= start + (element.textContent?.length ?? 0);
        });
      const textNode = token?.firstChild;
      if (!token || !textNode) {
        marker.style.opacity = '0';
        return;
      }

      const start = Number(token.dataset.documentStart);
      const local = Math.max(
        0,
        Math.min(textNode.textContent?.length ?? 0, target - start),
      );
      const range = document.createRange();
      range.setStart(textNode, local);
      range.collapse(true);
      const tokenRect = token.getBoundingClientRect();
      const rangeRect = range.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();
      marker.style.left = `${(rangeRect.left || tokenRect.left) - lineRect.left}px`;
      marker.style.top = `${tokenRect.top - lineRect.top + (lineHeight - fontSize) / 2}px`;
      marker.style.opacity = '1';
    });
  };

  const placeCaret = (next: Caret) => {
    caretRef.current = next;
    setCaret(next);
    inputRef.current?.focus();
    requestAnimationFrame(() => {
      inputRef.current?.setNativeProps?.({
        selection: { start: next.offset, end: next.offset },
      });
      if (typeof document !== 'undefined') {
        const ta = document.querySelector(
          'textarea[aria-label="Journal sentence"]',
        ) as HTMLTextAreaElement | null;
        ta?.setSelectionRange(next.offset, next.offset);
      }
      syncWebCaret(next);
    });
  };

  const commit = (result: { nodes: JournalNode[]; images: SourceImage[]; caret: Caret }) => {
    caretRef.current = result.caret;
    setCaret(result.caret);
    onChange(result);
    requestAnimationFrame(() => {
      if (typeof document !== 'undefined') {
        const ta = document.querySelector(
          'textarea[aria-label="Journal sentence"]',
        ) as HTMLTextAreaElement | null;
        ta?.setSelectionRange(result.caret.offset, result.caret.offset);
      }
      syncWebCaret(result.caret, result.nodes);
    });
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    const root = rootRef.current as unknown as HTMLElement | null;
    if (!root) {
      return;
    }

    const readSelection = () => {
      const selection = window.getSelection();
      if (
        !selection ||
        selection.isCollapsed ||
        !selection.anchorNode ||
        !selection.focusNode ||
        !root.contains(selection.anchorNode) ||
        !root.contains(selection.focusNode)
      ) {
        selectionRef.current = null;
        return;
      }
      const anchor = documentOffsetFromDom(selection.anchorNode, selection.anchorOffset);
      const focus = documentOffsetFromDom(selection.focusNode, selection.focusOffset);
      if (anchor != null && focus != null) {
        selectionRef.current = {
          start: Math.min(anchor, focus),
          end: Math.max(anchor, focus),
        };
      }
    };

    const deleteSelection = (event: KeyboardEvent) => {
      const selection = selectionRef.current;
      if (!selection || (event.key !== 'Backspace' && event.key !== 'Delete')) {
        return;
      }
      event.preventDefault();
      const result = deleteDocumentRange(
        nodesRef.current,
        imagesRef.current,
        selection,
      );
      selectionRef.current = null;
      window.getSelection()?.removeAllRanges();
      commit(result);
      requestAnimationFrame(() => inputRef.current?.focus());
    };

    document.addEventListener('pointerup', readSelection);
    document.addEventListener('keyup', readSelection);
    document.addEventListener('keydown', deleteSelection);
    return () => {
      document.removeEventListener('pointerup', readSelection);
      document.removeEventListener('keyup', readSelection);
      document.removeEventListener('keydown', deleteSelection);
    };
  });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    const marker = webCaretRef.current as unknown as HTMLElement | null;
    if (!marker) {
      return;
    }
    marker.style.opacity = '0';
    if (!focused) {
      return;
    }
    syncWebCaret(caret, nodes);
  }, [caret, focused, fontSize, lineHeight, nodes]);

  const overflowingRef = useRef(overflowing);
  overflowingRef.current = overflowing;

  const onChangeText = (nativeNext: string) => {
    const current = activeText(nodesRef.current, caretRef.current);
    if (!current) {
      return;
    }
    const nextValue = valueFromNativeChange(
      current.value,
      nativeNext,
      caretRef.current.offset,
    );
    const grew = nextValue.length > current.value.length || nextValue.includes('()');
    if (overflowingRef.current && grew) {
      return;
    }
    commit(applyTextChange(nodesRef.current, imagesRef.current, caretRef.current, nextValue));
  };

  const onKeyPress = (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (event.nativeEvent.key !== 'Backspace' || caretRef.current.offset !== 0) {
      return;
    }
    commit(deleteBackward(nodesRef.current, imagesRef.current, caretRef.current));
  };

  let nextDocumentOffset = 0;

  return (
    <View ref={rootRef} style={styles.hit}>
      <View
        ref={lineRef}
        style={styles.line}
        onLayout={(event) => onContentHeight(event.nativeEvent.layout.height)}
      >
        {nodes.map((node, nodeIndex) => {
          const documentStart = nextDocumentOffset;
          nextDocumentOffset += node.type === 'text' ? node.value.length : 1;
          if (node.type === 'image') {
            const index = images.findIndex((image) => image.id === node.sourceImageId);
            const image = images[index];
            if (!image) {
              return null;
            }
            return (
              <ImageSlot
                key={node.id}
                image={image}
                color={colors.cells[index] ?? colors.cells[0]}
                fontSize={fontSize}
                lineHeight={lineHeight}
                onPress={() => placeCaret(caretAfterImage(nodes, nodeIndex))}
              />
            );
          }
          return renderTextNode(
            node.value,
            node.id,
            nodeIndex,
            caret,
            focused,
            placeCaret,
            partWidths,
            fontSize,
            lineHeight,
            documentStart,
          );
        })}
        {Platform.OS === 'web' ? (
          <View
            ref={webCaretRef}
            pointerEvents="none"
            style={[
              styles.webCaret,
              { height: fontSize, left: 0, opacity: 0, top: 0 },
            ]}
          >
            <CaretMark height={fontSize} lineHeight={lineHeight} />
          </View>
        ) : null}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onKeyPress={onKeyPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        caretHidden
        multiline
        blurOnSubmit={false}
        underlineColorAndroid="transparent"
        selection={{ start: caret.offset, end: caret.offset }}
        style={styles.hidden}
        accessibilityLabel="Journal sentence"
      />
    </View>
  );
}

function renderTextNode(
  value: string,
  id: string,
  nodeIndex: number,
  caret: Caret,
  focused: boolean,
  placeCaret: (caret: Caret) => void,
  partWidths: MutableRefObject<Record<string, number>>,
  fontSize: number,
  lineHeight: number,
  documentStart: number,
) {
  const showCaret = focused && caret.nodeIndex === nodeIndex;
  const parts = value.length === 0 ? [''] : value.split(/(\s+)/);

  let pos = 0;
  return parts.map((part, partIndex) => {
    const start = pos;
    pos += part.length;
    const key = `${id}-${partIndex}-${start}`;
    const caretInPart =
      showCaret &&
      (partIndex === 0 ? caret.offset >= start : caret.offset > start) &&
      caret.offset <= start + part.length;

    const placeFromTap = (event: GestureResponderEvent) => {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const native = event.nativeEvent as GestureResponderEvent['nativeEvent'] & {
          clientX?: number;
          clientY?: number;
        };
        const exact = caretOffsetFromPoint(
          event.currentTarget as unknown as HTMLElement,
          native.clientX,
          native.clientY,
        );
        if (exact != null) {
          placeCaret({ nodeIndex, offset: start + exact });
          return;
        }
      }
      const native = event.nativeEvent as GestureResponderEvent['nativeEvent'] & {
        offsetX?: number;
      };
      const locationX = native.locationX ?? native.offsetX;
      const width = partWidths.current[key];
      if (!Number.isFinite(locationX) || !width || part.length === 0) {
        placeCaret({ nodeIndex, offset: start + part.length });
        return;
      }
      const ratio = Math.max(0, Math.min(1, Number(locationX) / width));
      const local = Math.round(ratio * part.length);
      placeCaret({ nodeIndex, offset: start + local });
    };

    const partProps = {
      accessibilityLabel: part || 'text',
      onLayout: (event: { nativeEvent: { layout: { width: number } } }) => {
        partWidths.current[key] = event.nativeEvent.layout.width;
      },
      onPress: placeFromTap,
      selectable: true,
      dataSet: { documentStart: String(documentStart + start) },
    };

    const wordStyle = [styles.word, { fontSize, lineHeight, height: lineHeight }];

    if (showCaret && value.length === 0 && partIndex === 0) {
      return (
        <Text key={key} {...partProps} style={wordStyle}>
          {Platform.OS === 'web' ? '\u200B' : (
            <CaretMark height={fontSize} lineHeight={lineHeight} />
          )}
        </Text>
      );
    }

    if (caretInPart && Platform.OS !== 'web') {
      const local = caret.offset - start;
      return (
        <Text key={key} {...partProps} style={wordStyle}>
          {part.slice(0, local)}
          <CaretMark height={fontSize} lineHeight={lineHeight} />
          {part.slice(local)}
        </Text>
      );
    }

    if (part.length === 0) {
      return null;
    }

    return (
      <Text key={key} {...partProps} style={wordStyle}>
        {part}
      </Text>
    );
  });
}

function documentOffsetFromDom(node: Node, offset: number): number | null {
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement;
  const token = element?.closest('[data-document-start]') as HTMLElement | null;
  if (!token) {
    return null;
  }
  const base = Number(token.dataset.documentStart);
  if (!Number.isFinite(base)) {
    return null;
  }
  const range = document.createRange();
  range.selectNodeContents(token);
  try {
    range.setEnd(node, offset);
  } catch {
    return base;
  }
  return base + range.toString().length;
}

function caretOffsetFromPoint(
  element: HTMLElement,
  clientX?: number,
  clientY?: number,
): number | null {
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) {
    return null;
  }
  const doc = document as Document & {
    caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
    caretRangeFromPoint?: (x: number, y: number) => Range | null;
  };
  const position = doc.caretPositionFromPoint?.(clientX!, clientY!);
  const node = position?.offsetNode ?? doc.caretRangeFromPoint?.(clientX!, clientY!)?.startContainer;
  const offset = position?.offset ?? doc.caretRangeFromPoint?.(clientX!, clientY!)?.startOffset;
  if (!node || offset == null || !element.contains(node)) {
    return null;
  }
  const range = document.createRange();
  range.selectNodeContents(element);
  range.setEnd(node, offset);
  return range.toString().length;
}

const styles = StyleSheet.create({
  hit: {
    width: '100%',
    maxWidth: layout.journalMaxWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignContent: 'center',
    width: '100%',
  },
  word: {
    color: colors.ink,
    fontWeight: '400',
    flexShrink: 0,
  },
  webCaret: {
    position: 'absolute',
    width: 1.5,
    zIndex: 5,
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
    bottom: 0,
    left: 0,
  },
});
