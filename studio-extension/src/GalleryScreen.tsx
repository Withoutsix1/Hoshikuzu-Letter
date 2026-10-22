import { useExtensionContext } from '@avg-studio/sdk';
import Frame, { useVisualPreferences } from './Frame';
import Gallery, { type Artwork as VisualArtwork } from './Gallery';
import { artworkList, key } from './state';
export default function GalleryScreen({close}:{close:()=>void}){
  return <Frame scene="gallery"><GalleryContent close={close}/></Frame>;
}
function GalleryContent({close}:{close:()=>void}){
  const ctx=useExtensionContext();
  const {reduced}=useVisualPreferences();
  const [raw]=ctx.variables.useValue(key('unlockedArtwork'));
  const artworks:VisualArtwork[]=artworkList(raw).map(item=>({
    id:item.id,title:item.title,en:'HOSHIKUZU / COLLECTION',category:item.category,
    description:item.description||'',alt:item.title,
    src:item.source.startsWith('assets/')?ctx.extensionResource.url(item.source):ctx.asset.resolve(item.source).url,
  }));
  return <Gallery background="milky-way" reduced={reduced} hover={()=>{}} open={()=>{}} returnToTitle={close} artworks={artworks}/>;
}
