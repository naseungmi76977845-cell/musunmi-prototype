export type RewardKey = 'profile' | 'bookmark' | 'recording' | 'story';
export const rewardRules: {key:RewardKey; title:string; amount:number}[] = [
  {key:'profile',title:'프로필 완성하기',amount:30},
  {key:'bookmark',title:'첫 표현 저장하기',amount:20},
  {key:'recording',title:'첫 수어 기록하기',amount:50},
  {key:'story',title:'첫 이야기 남기기',amount:30},
];
export type DecorationKind = 'tone' | 'frame' | 'badge';
export type Decoration = {id:string;kind:DecorationKind;name:string;cost:number;background?:string;foreground?:string;style?:'plain'|'ring'|'dashed';icon?:'none'|'sprout'|'star'|'station'};
export const decorations: Decoration[] = [
  {id:'tone-default',kind:'tone',name:'기본 색상',cost:0},
  {id:'tone-sky',kind:'tone',name:'하늘빛',cost:20,background:'#E5F2FF',foreground:'#245E9A'},
  {id:'tone-lilac',kind:'tone',name:'라일락',cost:20,background:'#EEE7FC',foreground:'#65519B'},
  {id:'tone-peach',kind:'tone',name:'복숭아',cost:20,background:'#FFE8DC',foreground:'#9B4E33'},
  {id:'frame-default',kind:'frame',name:'기본 테두리',cost:0,style:'plain'},
  {id:'frame-ring',kind:'frame',name:'동그란 노선',cost:40,style:'ring'},
  {id:'frame-dashed',kind:'frame',name:'이어지는 길',cost:60,style:'dashed'},
  {id:'badge-default',kind:'badge',name:'배지 없음',cost:0,icon:'none'},
  {id:'badge-sprout',kind:'badge',name:'작은 새싹',cost:30,icon:'sprout'},
  {id:'badge-star',kind:'badge',name:'반짝이는 별',cost:50,icon:'star'},
  {id:'badge-station',kind:'badge',name:'나만의 역',cost:50,icon:'station'},
];
export type Equipped = {tone:string;frame:string;badge:string};
export type PointTransaction = {id:string;title:string;amount:number;at:string};
export type PointsState = {claimed:RewardKey[];owned:string[];equipped:Equipped;transactions:PointTransaction[]};
export type PointsAction = {type:'earn';reward:RewardKey;at:string} | {type:'redeem';itemId:string;at:string} | {type:'reset'};
export const getDecoration = (id:string) => decorations.find(item=>item.id===id);
export const getBalance = (state:PointsState) => state.transactions.reduce((balance,item)=>balance+item.amount,0);
export function initialPoints():PointsState {
  return {claimed:[],owned:['tone-default','frame-default','badge-default'],equipped:{tone:'tone-default',frame:'frame-default',badge:'badge-default'},transactions:[]};
}

// One reducer keeps the ledger, ownership and equipped item in a single update.
export function pointsReducer(state:PointsState,action:PointsAction):PointsState {
  if(action.type==='reset') return initialPoints();
  if(action.type==='earn') {
    const reward=rewardRules.find(item=>item.key===action.reward);
    if(!reward||state.claimed.includes(action.reward))return state;
    return {...state,claimed:[...state.claimed,action.reward],transactions:[{id:`earn:${reward.key}`,title:reward.title,amount:reward.amount,at:action.at},...state.transactions]};
  }
  const item=getDecoration(action.itemId);
  if(!item)return state;
  const owned=state.owned.includes(item.id);
  if(!owned&&getBalance(state)<item.cost)return state;
  if(owned&&state.equipped[item.kind]===item.id)return state;
  return {
    ...state,
    equipped:{...state.equipped,[item.kind]:item.id},
    owned:owned?state.owned:[...state.owned,item.id],
    transactions:owned||item.cost===0?state.transactions:[{id:`buy:${item.id}`,title:`${item.name} 구매`,amount:-item.cost,at:action.at},...state.transactions],
  };
}
