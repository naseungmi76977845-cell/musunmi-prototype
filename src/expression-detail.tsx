import type {ReactNode} from 'react';
import {Bookmark,ChevronRight,TrainFront} from 'lucide-react';
import type {Kit} from './contracts';
import type {Expression} from './expressions';
import './expression-detail.css';

export function ExpressionDetail({kit,word,related,saved,onSave,onSelect,onNextStation,children}: {
  kit: Kit;
  word: Expression;
  related: Expression[];
  saved: boolean;
  onSave:()=>void;
  onSelect:(id:string)=>void;
  onNextStation?:()=>void;
  children:ReactNode;
}) {
  const {Button,Chip}=kit;
  return <>
    <div className="term-heading"><div><span className="label">{word.category}</span><h1>{word.title}</h1></div><button aria-label={saved?'표현 저장 취소':'표현 저장'} aria-pressed={saved} className={`icon-button ${saved?'active':''}`} onClick={onSave}><Bookmark size={23} fill={saved?'currentColor':'none'}/></button></div>
    <section className="expression-meaning"><h2>뜻과 쓰임</h2><p>{word.hint}</p><blockquote><span>사용 예문</span><p>{word.example}</p></blockquote></section>
    <section className="expression-media"><h2>수어 영상</h2>{children}</section>
    {related.length>0&&<section className="expression-related"><h2>함께 볼 표현</h2><div className="app-chips">{related.map(item=><Chip key={item.id} onClick={()=>onSelect(item.id)}>{item.title}</Chip>)}</div></section>}
    {onNextStation&&<div className="expression-next bottom-action">
      <button type="button" className="expression-next-card" onClick={onNextStation}>
        <span className="expression-next-mark" aria-hidden="true"><TrainFront size={20}/></span>
        <span className="expression-next-copy"><small>다음 역</small><b>고마움 · 감사합니다</b></span>
        <ChevronRight size={18} aria-hidden="true"/>
      </button>
      <Button onClick={onNextStation}>티켓으로 다음 역 가기</Button>
    </div>}
  </>;
}
