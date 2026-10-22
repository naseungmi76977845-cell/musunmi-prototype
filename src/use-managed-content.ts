import {useEffect,useState,useSyncExternalStore} from 'react';
import {contentIsVisible,getManagedSnapshot,getVideoBlob,subscribeManagedContent} from './managed-content';
import type {UserVideo} from './activity';
export function useManagedContent(){return useSyncExternalStore(subscribeManagedContent,getManagedSnapshot,getManagedSnapshot)}
export function useVideoSource(id:string|null){const [source,setSource]=useState<{id:string|null;url:string|null;loading:boolean;error:string}>({id:null,url:null,loading:false,error:''});
 useEffect(()=>{let active=true,url:string|null=null;if(!id){setSource({id,url:null,loading:false,error:''});return}setSource({id,url:null,loading:true,error:''});getVideoBlob(id).then(blob=>{if(!active)return;if(blob){url=URL.createObjectURL(blob);setSource({id,url,loading:false,error:''})}else setSource({id,url:null,loading:false,error:'영상 파일을 찾을 수 없습니다.'})}).catch(()=>{if(active)setSource({id,url:null,loading:false,error:'영상을 불러오지 못했습니다.'})});return()=>{active=false;if(url)URL.revokeObjectURL(url)}},[id]);
 return source.id===id?source:{url:null,loading:!!id,error:''};
}
export function useLocalVideos(ownerId:string){const state=useManagedContent();const [sources,setSources]=useState<Record<string,string>>({});
 useEffect(()=>{let active=true;const urls:string[]=[];const items=state.videos.filter(v=>v.ownerId===ownerId&&contentIsVisible(state,v));Promise.all(items.map(async v=>{try{const blob=await getVideoBlob(v.id);if(!active||!blob)return [v.id,''];const url=URL.createObjectURL(blob);urls.push(url);return [v.id,url]}catch{return [v.id,'']}})).then(pairs=>{if(active)setSources(Object.fromEntries(pairs))});return()=>{active=false;urls.forEach(url=>URL.revokeObjectURL(url))}},[state,ownerId]);
 return state.videos.filter(v=>v.ownerId===ownerId&&contentIsVisible(state,v)).map(v=>({...v,url:sources[v.id]||''} satisfies UserVideo));
}
