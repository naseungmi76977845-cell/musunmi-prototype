import React,{Suspense,lazy,useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowLeft,ArrowRight,Check,ExternalLink,Grid2X2,LayoutPanelLeft,RotateCcw,Route,Smartphone} from 'lucide-react';
import {palettes,type ColorName,type SystemName} from './contracts';
import {screens,isScreen,type ScreenId} from './screens';
import './gallery.css';
import './line-mode.css';
import './pdf-export.css';
import {BrandLogo} from './brand';
const MobileApp=lazy(()=>import('./mobile-app'));
const params=new URLSearchParams(location.search);
const selectedColor=params.get('color');
const lineMode=params.get('line')==='1';
document.documentElement.dataset.lineMode=lineMode?'true':'false';
document.documentElement.dataset.pdfExport=params.get('pdf')==='1'&&params.get('view')==='app'?'true':'false';
function Frame({system,color,screen,onNavigate,outline=lineMode}:{system:SystemName;color:ColorName;screen:ScreenId;onNavigate?:(s:ScreenId)=>void;outline?:boolean}){
 const ref=useRef<HTMLIFrameElement>(null);
 const label=outline?'그림 라인':system==='astryx'?'Astryx':'SEED';
 const src=`/?view=app&system=${system}&color=${color}&line=${outline?1:0}`;
 useEffect(()=>{ref.current?.contentWindow?.postMessage({type:'sua-go',screen},location.origin)},[screen]);
 useEffect(()=>{const listener=(e:MessageEvent)=>{if(e.origin!==location.origin||e.source!==ref.current?.contentWindow)return;if(e.data?.type==='sua-question-context')document.querySelectorAll('iframe').forEach(frame=>{if(frame.contentWindow!==e.source)frame.contentWindow?.postMessage(e.data,location.origin)});if(e.data?.type==='sua-ready')ref.current?.contentWindow?.postMessage({type:'sua-go',screen},location.origin);if(e.data?.type==='sua-nav'&&isScreen(e.data.screen))onNavigate?.(e.data.screen)};addEventListener('message',listener);return()=>removeEventListener('message',listener)},[onNavigate,screen]);
 const open=`/?view=app&system=${system}&color=${color}&screen=${screen}&line=${outline?1:0}`;
 return <article className="preview"><div className="preview-label"><div><b>{label}</b><span>{palettes[color].name}</span></div><a href={open} target="_blank" rel="noreferrer" aria-label={`${label} ${palettes[color].name} 화면 크게 보기`}><ExternalLink size={15}/></a></div><div className="phone"><iframe ref={ref} allow="camera" src={src} title={`${label} ${palettes[color].name} 모바일 시안`} onLoad={()=>ref.current?.contentWindow?.postMessage({type:'sua-go',screen},location.origin)}/></div></article>
}
function Gallery(){
 const [color,setColor]=useState<ColorName>(selectedColor&&selectedColor in palettes?selectedColor as ColorName:'sage');const[screen,setScreen]=useState<ScreenId>(isScreen(params.get('screen'))?params.get('screen') as ScreenId:'signup');
 const[mode,setMode]=useState<'compare'|'colors'|'flow'>(params.get('mode')==='colors'?'colors':params.get('mode')==='flow'?'flow':'compare');const[system,setSystem]=useState<SystemName>(params.get('system')==='seed'?'seed':'astryx');
 const[mobileSystem,setMobileSystem]=useState<SystemName>('astryx');
 const index=screens.findIndex(([id])=>id===screen);
 const reset=()=>{setScreen('signup');document.querySelectorAll('iframe').forEach(f=>f.contentWindow?.postMessage({type:'sua-reset'},location.origin))};
 return <div className="lab"><header className="lab-header"><a className="lab-brand" href="/?view=gallery"><BrandLogo/><span>그림 라인 · Astryx</span></a><div className="source-links"><a href="/planning/index.html">기획서</a><a href="https://seed-design.io/" target="_blank" rel="noreferrer">SEED <ExternalLink size={12}/></a><a href="https://astryx.atmeta.com/" target="_blank" rel="noreferrer">Astryx <ExternalLink size={12}/></a></div></header>
 <div className="lab-toolbar"><div className="modes" aria-label="비교 방식">{([['compare','두 버전 비교',LayoutPanelLeft],['colors','색상 한눈에',Grid2X2],['flow','전체 화면',Route]] as const).map(([v,t,I])=><button key={v} aria-pressed={mode===v} onClick={()=>setMode(v)}><I size={16}/>{t}</button>)}</div><div className="swatches" aria-label="브랜드 색상">{(Object.keys(palettes)as ColorName[]).map(c=><button key={c} aria-pressed={color===c} onClick={()=>setColor(c)} title={palettes[c].name}><span style={{background:palettes[c].brand}}>{color===c&&<Check size={12}/>}<i style={{background:palettes[c].accent}}/></span><span>{palettes[c].name}</span></button>)}</div></div>
 <div className="lab-subbar"><div className="step-control"><button aria-label="이전 화면" disabled={index<=0} onClick={()=>setScreen(screens[index-1][0])}><ArrowLeft size={17}/></button><select aria-label="화면 선택" value={screen} onChange={e=>setScreen(e.target.value as ScreenId)}>{screens.map(([v,t],i)=><option key={v} value={v}>{String(i+1).padStart(2,'0')} · {t}</option>)}</select><button aria-label="다음 화면" disabled={index>=screens.length-1} onClick={()=>setScreen(screens[index+1][0])}><ArrowRight size={17}/></button></div><button className="reset" onClick={reset}><RotateCcw size={14}/>처음부터</button></div>
 <div className="small-system"><button aria-pressed={mobileSystem==='seed'} onClick={()=>setMobileSystem('seed')}>그림 라인</button><button aria-pressed={mobileSystem==='astryx'} onClick={()=>setMobileSystem('astryx')}>Astryx</button></div>
 {mode==='compare'&&<main className={`comparison show-${mobileSystem}`}><div className="seed-column"><Frame system="seed" outline color={color} screen={screen} onNavigate={setScreen}/></div><div className="astryx-column"><Frame system="astryx" outline={false} color={color} screen={screen} onNavigate={setScreen}/></div></main>}
 {mode==='colors'&&<main className="color-matrix">{(Object.keys(palettes)as ColorName[]).flatMap(c=>(['seed','astryx']as const).map(s=><Frame key={s+c} system={s} outline={s==='seed'} color={c} screen={screen} onNavigate={setScreen}/>))}</main>}
 {mode==='flow'&&<><div className="flow-system"><button aria-pressed={system==='seed'} onClick={()=>setSystem('seed')}>그림 라인</button><button aria-pressed={system==='astryx'} onClick={()=>setSystem('astryx')}>Astryx</button><span>{screens.length}개 화면</span></div><main className="flow-grid">{screens.map(([s,t],i)=><section key={system+s+color}><h2><span>{String(i+1).padStart(2,'0')}</span>{t}</h2><Frame system={system} outline={system==='seed'} color={color} screen={s}/></section>)}</main></>}
 <footer className="lab-footer"><span><Smartphone size={14}/>390 × 844 · 그림 라인 · Astryx</span><span>가입 → 위키 → 커뮤니티 → 마이 → 탈퇴</span></footer></div>
}
const view=params.get('view');
// Explicit preview URLs keep their signup fallback; the public app opens at login.
const initialScreen=isScreen(params.get('screen'))?params.get('screen')as ScreenId:view==='app'?'signup':'login';
createRoot(document.getElementById('root')!).render(<React.StrictMode>{view==='gallery'?<Gallery/>:<Suspense fallback={<div className="preview-loading" aria-label="화면 불러오기"/>}><MobileApp system={params.get('system')==='seed'?'seed':'astryx'} color={selectedColor&&selectedColor in palettes?selectedColor as ColorName:'sage'} initialScreen={initialScreen}/></Suspense>}</React.StrictMode>);
