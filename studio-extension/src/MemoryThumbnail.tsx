import type { Snapshot } from './model';
import type { BackgroundVariant } from './visualAssets';
import type { ReadingMode } from './readingModes';
export default function MemoryThumbnail({snapshot}:{snapshot:Snapshot;background:BackgroundVariant;mode:ReadingMode}){
  return <span className="memory-photo">{snapshot.thumbnail ? <img src={snapshot.thumbnail} alt="存档时的游戏画面" data-frame="gameplay" draggable={false}/> : <span className="hoshikuzu-thumbnail-empty">✦</span>}</span>;
}
