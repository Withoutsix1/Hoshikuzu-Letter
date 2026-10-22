import { useState } from 'react';
import type { ArchiveEntry } from './archiveTypes.js';

export default function MemoryThumbnail({ snapshot, alt = '存档时的画面' }: {
  snapshot: ArchiveEntry;
  alt?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const source = snapshot.thumbnail;
  return <span className="memory-photo">
    {source && source !== failed
      ? <img src={source} alt={alt} data-frame="gameplay" draggable={false} onError={() => setFailed(source)} />
      : <span className="hoshikuzu-thumbnail-empty" aria-hidden="true">✦</span>}
  </span>;
}
