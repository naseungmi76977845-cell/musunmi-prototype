import type {ReactNode} from 'react';
import {Bookmark} from 'lucide-react';
import type {Kit} from './contracts';
import type {Expression} from './expressions';
import './expression-detail.css';

export function ExpressionDetail({kit,word,related,saved,onSave,onSelect,children}: {kit: Kit;word: Expression;related: Expression[];saved: boolean;onSave:()=>void;onSelect:(id:string)=>void;children:ReactNode}) {
  const {Chip}=kit;
  return <>
    <div className="term-heading"><div><span className="label">{word.category}</span><h1>{word.title}</h1></div><button aria-label={saved?'표현 저장 취소':'표현 저장'} aria-pressed={saved} className={`icon-button ${saved?'active':''}`} onClick={onSave}><Bookmark size={23} fill={saved?'currentColor':'none'}/></button></div>
    <section className="expression-meaning"><h2>뜻과 쓰임</h2><p>{word.hint}</p><blockquote><span>사용 예문</span><p>{word.example}</p></blockquote></section>
    <section className="expression-media"><h2>수어 영상</h2>{children}</section>
    {related.length>0&&<section className="expression-related"><h2>함께 볼 표현</h2><div className="app-chips">{related.map(item=><Chip key={item.id} onClick={()=>onSelect(item.id)}>{item.title}</Chip>)}</div></section>}
  </>;
}
