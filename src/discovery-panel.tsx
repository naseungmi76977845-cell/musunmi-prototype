import type {ReactNode} from 'react';
import {BookOpen,Bookmark,ChevronRight,GraduationCap,Heart,MapPin,MessageCircle,Search,Sunrise,Users,Video,X} from 'lucide-react';
import type {Kit} from './contracts';
import {BrandMark} from './brand';
import {Gugu} from './gugu';
import {GreetingArt} from './greeting-art';
import {matchesExpression,type Expression} from './expressions';
import './discovery-panel.css';
import './home-station.css';

export type {Expression} from './expressions';
const categoryIcons={일상:Sunrise,마음:Heart,사람:Users,장소:MapPin};

export function ExpressionRows({words,onSelect}:{words:Expression[];onSelect:(id:string)=>void}) {
 return <div className="dp-expression-list">{words.map(w=>{
  const Icon=categoryIcons[w.category as keyof typeof categoryIcons]||BookOpen;
  return <button className="dp-expression" key={w.id} onClick={()=>onSelect(w.id)}>
   <span className="dp-expression-icon"><Icon size={22} strokeWidth={1.7}/></span>
   <span className="dp-expression-copy"><b>{w.title}</b><small>{w.hint}</small></span>
   <ChevronRight size={17} aria-hidden="true"/>
  </button>;
 })}</div>;
}

const destinations=[
 {id:'wiki',name:'사전역',hint:'수어 검색 및 영상 사전',Icon:BookOpen,on:'wiki'} as const,
 {id:'learn',name:'배움역',hint:'단계별 수어 학습',Icon:GraduationCap,on:'learn'} as const,
 {id:'community',name:'소통역',hint:'커뮤니티 및 교류',Icon:MessageCircle,on:'community'} as const,
];

export function HomePanel({onWiki,onHello,onLearn,onCommunity}:{onWiki:()=>void;onHello:()=>void;onLearn:()=>void;onRecord:()=>void;onCommunity:()=>void;latestStory?:ReactNode}) {
 const go={wiki:onWiki,learn:onLearn,community:onCommunity} as const;
 return <div className="home-station">
  <section className="home-welcome" aria-label="수어역 환영">
   <div className="home-welcome-plate">
    <span className="home-welcome-plate-mark"><BrandMark size={18}/></span>
    <span><b>수어역</b><small>SUEO STATION</small></span>
   </div>
   <div className="home-welcome-body">
    <p className="home-welcome-bubble">수어역에 오신 걸 환영해요!</p>
    <Gugu size={78} attendant/>
   </div>
  </section>

  <button type="button" className="home-search" onClick={onWiki}>
   <Search size={18} aria-hidden="true"/>
   <span>궁금한 수어를 검색해 보세요</span>
  </button>

  <section className="home-features" aria-label="주요 기능">
   {destinations.map(item=>{
    const Icon=item.Icon;
    return <button key={item.id} type="button" className="home-feature" onClick={go[item.on]} aria-label={`${item.name}. ${item.hint}`}>
     <span className="home-feature-icon" aria-hidden="true"><Icon size={20} strokeWidth={1.9}/></span>
     <b>{item.name}</b>
     <p>{item.hint}</p>
    </button>;
   })}
  </section>

  <section className="home-today-section" aria-labelledby="home-today-title">
   <h2 id="home-today-title">오늘의 표현</h2>
   <button type="button" className="home-today" onClick={onHello} aria-label="오늘의 표현 안녕하세요, 마음을 여는 첫인사">
    <span className="home-today-art word-art greeting-art"><GreetingArt/></span>
    <span className="home-today-copy">
     <small>일상 · 인사</small>
     <strong>안녕하세요</strong>
     <p>마음을 여는 첫인사</p>
    </span>
    <ChevronRight size={18} aria-hidden="true"/>
   </button>
  </section>
 </div>;
}

export function WikiPanel({kit,query,category,words,bookmarks,recent,savedOnly,alphabetical,questionSlot,onQuery,onCategory,onSelect,onRecord,onSignSearch,onSavedOnly,onSort,onClearRecent}:{kit:Kit;query:string;category:string;words:Expression[];bookmarks:string[];recent:string[];savedOnly:boolean;alphabetical:boolean;questionSlot?:ReactNode;onQuery:(value:string)=>void;onCategory:(value:string)=>void;onSelect:(id:string)=>void;onRecord:()=>void;onSignSearch:()=>void;onSavedOnly:()=>void;onSort:(value:boolean)=>void;onClearRecent:()=>void}) {
 const{Field,Chip,Button}=kit;
 const list=words.filter(w=>(category==='전체'||w.category===category)&&(!savedOnly||bookmarks.includes(w.id))&&matchesExpression(w,query));
 if(alphabetical)list.sort((a,b)=>a.title.localeCompare(b.title,'ko'));
 const recentWords=recent.map(id=>words.find(w=>w.id===id)).filter((w):w is Expression=>Boolean(w));
 return <>
  <div className="dp-search"><Field label="수어 검색" value={query} onChange={onQuery} placeholder="표현, 뜻, 초성으로 검색"/>{query&&<button className="icon-button" aria-label="검색어 지우기" onClick={()=>onQuery('')}><X size={17}/></button>}</div>
  <button className="dp-sign-search" onClick={onSignSearch}><Video size={19} aria-hidden="true"/><b>수어로 찾기</b><ChevronRight size={16} aria-hidden="true"/></button>
  {questionSlot}
  {!query.trim()&&category==='전체'&&!savedOnly&&recentWords.length>0&&<section className="dp-recent"><div><h2>최근 본 표현</h2><button onClick={onClearRecent}>지우기</button></div><div className="app-chips">{recentWords.map(w=><Chip key={w.id} onClick={()=>onSelect(w.id)}>{w.title}</Chip>)}</div></section>}
  <div className="app-chips dp-category" aria-label="표현 카테고리">{['전체','일상','마음','사람','장소'].map(c=><Chip key={c} selected={category===c} onClick={()=>onCategory(c)}>{c}</Chip>)}</div>
  <div className="dp-library-tools"><button className="dp-saved-filter" aria-pressed={savedOnly} onClick={onSavedOnly}><Bookmark size={16} fill={savedOnly?'currentColor':'none'}/>저장한 표현<span>{bookmarks.length}</span></button><select aria-label="표현 정렬" value={alphabetical?'alphabetical':'default'} onChange={e=>onSort(e.target.value==='alphabetical')}><option value="default">기본순</option><option value="alphabetical">가나다순</option></select></div>
  <div className="dp-results" role="status" aria-live="polite"><h2>{query.trim()?'검색 결과':savedOnly?'저장한 표현':category==='전체'?'표현 모아보기':category}</h2><span>{list.length}개</span></div>
  {list.length?<ExpressionRows words={list} onSelect={onSelect}/>:<div className="dp-empty">{savedOnly?<Bookmark size={31}/>:<Search size={31}/>}<h3>{savedOnly&&!bookmarks.length?'저장한 표현이 없어요':'찾는 표현이 없어요'}</h3><Button kind="secondary" onClick={()=>{onQuery('');onCategory('전체');if(savedOnly)onSavedOnly()}}>전체 표현 보기</Button></div>}
  <Button kind="secondary" onClick={onRecord}>수어 기록하기</Button>
 </>;
}
