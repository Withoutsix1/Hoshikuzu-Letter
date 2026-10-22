import type { ExtensionContext } from '@avg-studio/sdk';
import { legacyArchivePositions } from './projectData';

type ScriptState = {frames?: {kind: string; id: string; cursorIndex: number}[]; archivedStackChain?: {id: string; cursorIndex: number}[]};
type StoredArchive = {cursorIndex: number; internalSystemDatas?: {scriptingSystem?: ScriptState}};
interface ArchiveApplication {
  getSubSystem(id: 19): {getArchive(id: number): Promise<StoredArchive | null>};
  getSubSystem(id: 9): {getNodes(): {getData(): {localization?: {blockId?: string}}}[]};
  reloadFromArchive(archive: StoredArchive): Promise<void>;
}

async function restoreArchive(ctx: ExtensionContext, id: number) {
  const app=(ctx.getHost() as {application?: ArchiveApplication}).application;
  const archive=await app?.getSubSystem(19).getArchive(id);
  const state=archive?.internalSystemDatas?.scriptingSystem;
  const frame=state?.frames?.[0] ?? state?.archivedStackChain?.[0];
  const positions=legacyArchivePositions;
  const blockId=frame && positions[frame.id]?.[String(frame.cursorIndex)];
  if(app&&archive&&state&&blockId){
    const cursor=app.getSubSystem(9).getNodes().findIndex(node=>node.getData().localization?.blockId===blockId);
    if(cursor<0)throw new Error('未找到旧存档对应的对白，请确认已打开当前工程。');
    // Older project saves used a scene-call cursor plus an inner dialogue cursor.
    // Translate that pair to the same dialogue in the current linear script.
    return app.reloadFromArchive({...archive,cursorIndex:cursor,internalSystemDatas:{
      ...archive.internalSystemDatas,scriptingSystem:{...state,frames:[],archivedStackChain:[]},
    }});
  }
  return ctx.archive.load(id);
}

/** This Player's archive.load promise includes the resumed script's lifetime. */
export async function loadStoryArchive(ctx: ExtensionContext, id: number, close: () => void) {
  const oldSignal = ctx.flow.signal;
  const oldReading = document.querySelector('.hoshikuzu-reading .reading-copy-revealed');
  let failure: unknown;
  let settled = false;
  let ready = false;
  void restoreArchive(ctx,id).then(() => { settled = true; }, error => {
    failure = error;
    settled = true;
    if (ready) console.error('星屑信恢复剧情失败', error);
  });
  close();
  const deadline = performance.now() + 30000;
  await new Promise<void>((resolve, reject) => {
    const inspect = () => {
      if (failure) { reject(failure); return; }
      const reading = document.querySelector('.hoshikuzu-reading .reading-copy-revealed');
      // A newly mounted reading view belongs to the restored run, not the old line.
      if (oldSignal.aborted && reading && reading !== oldReading && ctx.dialogue.line()) {
        ready = true; resolve(); return;
      }
      if (settled || performance.now() > deadline) {
        reject(new Error('存档尚未恢复到阅读位置，请重新读取。')); return;
      }
      requestAnimationFrame(inspect);
    };
    inspect();
  });
}
