import type {ReactNode} from 'react';
import {ArrowRight,BookOpen,Bookmark,ChevronRight,Heart,MapPin,Search,Sunrise,Users,Video,X} from 'lucide-react';
import type {Kit} from './contracts';
import {Gugu} from './gugu';
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

const lineStops=[
 {id:'wiki',code:'S01',name:'사전역',hint:'수어 검색 · 영상 사전',line:'wiki',x:'16%',y:'58%',on:'wiki'} as const,
 {id:'learn',code:'S02',name:'배움역',hint:'수어 학습 · 기록',line:'learn',x:'84%',y:'58%',on:'learn'} as const,
 {id:'community',code:'S03',name:'소통역',hint:'커뮤니티 · 교류',line:'community',x:'84%',y:'20%',on:'community'} as const,
];

export function HomePanel({onWiki,onHello,onLearn,onCommunity,latestStory}:{onWiki:()=>void;onHello:()=>void;onLearn:()=>void;onRecord:()=>void;onCommunity:()=>void;latestStory:ReactNode}) {
 const go={wiki:onWiki,learn:onLearn,community:onCommunity} as const;
 return <div className="home-station">
  <section className="home-gugu-welcome" aria-label="구구 역무원 안내">
   <div className="home-gugu-bubble">
    <span className="home-gugu-role">구구 역무원</span>
    <strong>수어역에 오신 걸 환영해요!</strong>
    <p>오늘은 어떤 수어를 배워볼까요? 원하는 역으로 이동해 보세요.</p>
   </div>
   <Gugu size={86} attendant/>
  </section>

  <section className="home-line-map" aria-labelledby="home-line-title">
   <div className="home-line-map-head">
    <h2 id="home-line-title">수어역 노선</h2>
    <span>환승 · S00</span>
   </div>
   <div className="home-line-canvas">
    <svg className="home-line-tracks" viewBox="0 0 320 236" preserveAspectRatio="none" aria-hidden="true">
     <path className="track-wiki" d="M160 137 H52" fill="none" strokeWidth="10" strokeLinecap="round"/>
     <path className="track-learn" d="M160 137 H268" fill="none" strokeWidth="10" strokeLinecap="round"/>
     <path className="track-community" d="M160 137 V47 H268" fill="none" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
     <circle className="track-hub" cx="160" cy="137" r="8" fill="var(--brand)" stroke="none"/>
     <path d="M250 137 h12 M250 47 h12 M70 137 h-12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".28"/>
     <path d="M256 133 l8 4 -8 4 M256 43 l8 4 -8 4 M66 133 l-8 4 8 4" fill="currentColor" opacity=".28"/>
    </svg>
    <div className="home-stop home-stop-hub" style={{left:'50%',top:'58%'}} aria-current="true">
     <span className="home-stop-mark" aria-hidden="true">S00</span>
     <span className="home-stop-copy"><b>수어역</b><small>지금 여기 · 환승</small></span>
    </div>
    {lineStops.map(stop=><button key={stop.id} className="home-stop" data-line={stop.line} style={{left:stop.x,top:stop.y}} onClick={go[stop.on]} aria-label={`${stop.code} ${stop.name}, ${stop.hint}`}>
     <span className="home-stop-mark" aria-hidden="true">{stop.code}</span>
     <span className="home-stop-copy"><b>{stop.name}</b><small>{stop.hint}</small></span>
    </button>)}
   </div>
   <div className="home-line-legend" aria-hidden="true">
    <span><i className="lg-wiki"/>사전역</span>
    <span><i className="lg-learn"/>배움역</span>
    <span><i className="lg-community"/>소통역</span>
   </div>
  </section>

  <button className="home-station-search" onClick={onWiki}><span aria-hidden="true"><Search size={16}/></span><span>수어 검색 · 사전역</span><ArrowRight size={16}/></button>

  <button className="home-board" onClick={onHello} aria-label="오늘의 수어 안내, 안녕하세요. 표현 배우러 가기">
   <div className="home-board-top"><span>오늘의 수어 안내</span><em>S02 배움역</em></div>
   <div className="home-board-body">
    <span className="home-board-stop"><span>S02</span><small>배움역</small></span>
    <span className="home-board-copy"><span>오늘의 표현</span><strong>안녕하세요</strong><p>마음을 여는 첫인사</p></span>
    <span className="home-board-go">배우러 가기 <ArrowRight size={15}/></span>
   </div>
  </button>

  <section className="home-notice" aria-labelledby="home-notice-title">
   <Gugu size={64} attendant/>
   <div className="home-notice-copy">
    <span id="home-notice-title">구구의 역 안내</span>
    <p>오늘은 인사 표현부터 시작해 볼까요?</p>
    <button type="button" className="home-notice-action" onClick={onLearn}>배움역으로 이동 <ArrowRight size={14}/></button>
   </div>
  </section>

  <section>
   <div className="section-head"><h2>함께 나누는 이야기</h2><button aria-label="소통역 보기" onClick={onCommunity}><ArrowRight size={17}/></button></div>
   {latestStory}
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
  <button className="dp-sign-search" onClick={onSignSearch}><Video size={19} aria-hidden="true"/><b>수어로 찾기</b><ArrowRight size={16} aria-hidden="true"/></button>
  {questionSlot}
  {!query.trim()&&category==='전체'&&!savedOnly&&recentWords.length>0&&<section className="dp-recent"><div><h2>최근 본 표현</h2><button onClick={onClearRecent}>지우기</button></div><div className="app-chips">{recentWords.map(w=><Chip key={w.id} onClick={()=>onSelect(w.id)}>{w.title}</Chip>)}</div></section>}
  <div className="app-chips dp-category" aria-label="표현 카테고리">{['전체','일상','마음','사람','장소'].map(c=><Chip key={c} selected={category===c} onClick={()=>onCategory(c)}>{c}</Chip>)}</div>
  <div className="dp-library-tools"><button className="dp-saved-filter" aria-pressed={savedOnly} onClick={onSavedOnly}><Bookmark size={16} fill={savedOnly?'currentColor':'none'}/>저장한 표현<span>{bookmarks.length}</span></button><select aria-label="표현 정렬" value={alphabetical?'alphabetical':'default'} onChange={e=>onSort(e.target.value==='alphabetical')}><option value="default">기본순</option><option value="alphabetical">가나다순</option></select></div>
  <div className="dp-results" role="status" aria-live="polite"><h2>{query.trim()?'검색 결과':savedOnly?'저장한 표현':category==='전체'?'표현 모아보기':category}</h2><span>{list.length}개</span></div>
  {list.length?<ExpressionRows words={list} onSelect={onSelect}/>:<div className="dp-empty">{savedOnly?<Bookmark size={31}/>:<Search size={31}/>}<h3>{savedOnly&&!bookmarks.length?'저장한 표현이 없어요':'찾는 표현이 없어요'}</h3><Button kind="secondary" onClick={()=>{onQuery('');onCategory('전체');if(savedOnly)onSavedOnly()}}>전체 표현 보기</Button></div>}
  <Button kind="secondary" onClick={onRecord}>수어 기록하기</Button>
 </>;
}
