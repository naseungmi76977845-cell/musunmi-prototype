export type UserVideo = {id:string;wordId:string|null;title:string;body:string;url:string;direction:boolean;dialect:string;createdAt:string};
export type NoticeTarget = {type:'post';id:string}|{type:'video';id:string}|{type:'points'};
export type AppNotification = {id:string;kind:'community'|'video'|'points';title:string;body:string;createdAt:string;read:boolean;target:NoticeTarget};
export type NoticeAction = {type:'add';item:AppNotification}|{type:'read';id:string}|{type:'readAll'}|{type:'removeTarget';target:NoticeTarget}|{type:'reset'};

export function notificationReducer(state:AppNotification[],action:NoticeAction):AppNotification[] {
  switch(action.type){
    case 'add':return state.some(item=>item.id===action.item.id)?state:[action.item,...state];
    case 'read':return state.map(item=>item.id===action.id?{...item,read:true}:item);
    case 'readAll':return state.map(item=>item.read?item:{...item,read:true});
    case 'removeTarget':return state.filter(item=>!sameTarget(item.target,action.target));
    case 'reset':return [];
  }
}
export function sameTarget(left:NoticeTarget,right:NoticeTarget){
  return left.type===right.type&&(left.type==='points'||(right.type!=='points'&&left.id===right.id));
}

// Keep every upload; deleting one video must not remove another expression's clip.
export function addUserVideo(videos:UserVideo[],video:UserVideo):UserVideo[]{
  return videos.some(item=>item.id===video.id)?videos:[video,...videos];
}
export function removeUserVideo(videos:UserVideo[],id:string):UserVideo[]{return videos.filter(item=>item.id!==id)}
