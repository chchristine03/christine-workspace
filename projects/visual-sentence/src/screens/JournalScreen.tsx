import { useState } from 'react';

import { CompositionShell } from '../components/CompositionShell';
import { JournalPanel } from '../components/JournalPanel';
import { SourcePanel } from '../components/SourcePanel';
import { initialJournal, placeholderSources } from '../lib/document';
import type { JournalNode, NormalizedCrop, SourceImage } from '../types';

export function JournalScreen() {
  const [images, setImages] = useState<SourceImage[]>(() => placeholderSources());
  const [nodes, setNodes] = useState<JournalNode[]>(() => initialJournal(images));
  const [activeImageId, setActiveImageId] = useState<string | null>(null);

  const updateImage = (id: string, patch: Partial<SourceImage>) => {
    setImages((current) =>
      current.map((image) => (image.id === id ? { ...image, ...patch } : image)),
    );
  };

  return (
    <CompositionShell
      journal={
        <JournalPanel
          nodes={nodes}
          images={images}
          onChange={(next) => {
            const added = next.images.find(
              (image) => !images.some((current) => current.id === image.id),
            );
            setNodes(next.nodes);
            setImages(next.images);
            if (added) {
              setActiveImageId(added.id);
            }
          }}
        />
      }
      source={
        <SourcePanel
          images={images}
          activeImageId={activeImageId}
          onActivate={setActiveImageId}
          onDeactivate={() => setActiveImageId(null)}
          onImageChange={updateImage}
          onCropChange={(id: string, crop: NormalizedCrop) =>
            updateImage(id, { crop })
          }
        />
      }
    />
  );
}
