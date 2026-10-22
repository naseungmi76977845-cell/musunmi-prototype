import {useEffect,useState} from 'react';
import {ArrowRight,ChevronRight,Flag,MessageCircle,Plus} from 'lucide-react';
import type {Kit} from './contracts';
import './question-panels.css';

export type Question={id:string;term:string;body:string;author:string;ownerId:string;createdAt:string;status:'open'|'answered'|'hidden';answers:{id:string;body:string;author:string;ownerId:string;createdAt:string}[];reports:{by:string;reason:string;createdAt:string}[]};

function questionTitle(term:string){const code=term.charCodeAt(term.length-1)-0xAC00;return code>=0&&code<=11171?`${term}${code%28?'은':'는'} 수어로 뭐라고 하나요?`:`${term}, 수어로 뭐라고 하나요?`}
function questionDate(value:string){const date=new Date(value);return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('ko-KR',{month:'long',day:'numeric'}).format(date)}
function QuestionRow({question,onOpen}:{question:Question;onOpen:(id:string)=>void}){
 return <button className="qp-row" onClick={()=>onOpen(question.id)}><span className="qp-row-copy"><span className="qp-status" data-answered={question.answers.length>0}>{question.answers.length?'답변 있어요':'답변 기다려요'}</span><b>{questionTitle(question.term)}</b><span className="qp-meta">{question.author} · {questionDate(question.createdAt)}<span><MessageCircle size={14} aria-hidden="true"/>답변 {question.answers.length}</span></span></span><ChevronRight size={18} aria-hidden="true"/></button>;
}

export function QuestionTeaser({questions,onAsk,onOpen,onAll}:{questions:Question[];onAsk:(term?:string)=>void;onOpen:(id:string)=>void;onAll:()=>void}){
 const visible=questions.filter(q=>q.status!=='hidden').slice(0,2);
 return <section className="qp-teaser" aria-label="수어 질문"><div className="qp-teaser-heading"><span className="qp-symbol"><MessageCircle size={22} aria-hidden="true"/></span><h2>이 수어, 어떻게 하나요?</h2></div><p>찾지 못한 표현을 함께 알아봐요.</p>{visible.length?<div className="qp-teaser-list">{visible.map(q=><QuestionRow key={q.id} question={q} onOpen={onOpen}/>)}</div>:<button className="qp-example" onClick={()=>onAsk('차돌짬뽕')}><span>이런 표현도 물어보세요</span><b>차돌짬뽕은 수어로 뭐라고 하나요?</b><ArrowRight size={18} aria-hidden="true"/></button>}<div className="qp-teaser-actions"><button className="qp-ask" onClick={()=>onAsk()}><Plus size={17} aria-hidden="true"/>질문 올리기</button><button className="qp-all" onClick={onAll}>질문 모두 보기<ArrowRight size={15} aria-hidden="true"/></button></div></section>;
}

export function QuestionBoard({questions,actorId,onAsk,onOpen}:{questions:Question[];actorId:string;onAsk:(term?:string)=>void;onOpen:(id:string)=>void}){
 const[tab,setTab]=useState('전체');
 const visible=questions.filter(q=>q.status!=='hidden'&&(tab!=='답변 기다려요'||q.answers.length===0)&&(tab!=='내 질문'||q.ownerId===actorId));
 return <div className="qp-board"><div className="qp-board-intro"><div><h2>궁금한 표현을 나눠요</h2><p>일상에서 만난 표현, 함께 알아봐요.</p></div><button className="qp-ask" onClick={()=>onAsk()} aria-label="질문 올리기"><Plus size={19} aria-hidden="true"/>질문하기</button></div><div className="qp-tabs" role="group" aria-label="질문 필터">{['전체','답변 기다려요','내 질문'].map(item=><button key={item} aria-pressed={tab===item} onClick={()=>setTab(item)}>{item}</button>)}</div><p className="qp-count" role="status">질문 {visible.length}개</p>{visible.length?<div className="qp-board-list">{visible.map(q=><QuestionRow key={q.id} question={q} onOpen={onOpen}/>)}</div>:<div className="qp-empty"><MessageCircle size={32} aria-hidden="true"/><h3>{tab==='내 질문'?'아직 올린 질문이 없어요':tab==='답변 기다려요'?'답변을 기다리는 질문이 없어요':'아직 질문이 없어요'}</h3><p>궁금했던 표현을 먼저 물어보세요.</p><button className="qp-ask" onClick={()=>onAsk()}>질문 올리기</button></div>}</div>;
}

export function QuestionCompose({kit,initialTerm,onSubmit}:{kit:Kit;initialTerm:string;onSubmit:(term:string,body:string)=>void}){
 const{Field,Button}=kit;
 const[term,setTerm]=useState(initialTerm.slice(0,40));
 const[body,setBody]=useState('');
 useEffect(()=>{setTerm(initialTerm.slice(0,40))},[initialTerm]);
 return <form className="qp-compose" onSubmit={e=>{e.preventDefault();if(term.trim())onSubmit(term.trim(),body.trim())}}><div className="qp-intro"><h2>궁금한 표현을 알려주세요</h2><p>어떤 말인지 구체적으로 적으면 답변에 도움이 돼요.</p></div><div><Field label="궁금한 표현" value={term} onChange={setTerm} maxLength={40} placeholder="예: 차돌짬뽕"/><p className="qp-field-count">{term.length}/40</p></div><div><Field label="어떤 상황인가요? (선택)" value={body} onChange={setBody} multiline maxLength={1000} placeholder="예: 식당에서 차돌짬뽕을 주문하고 싶어요."/><p className="qp-field-count">{body.length}/1,000</p></div><Button type="submit" disabled={!term.trim()}>질문 올리기</Button></form>;
}

export function QuestionDetail({kit,question,actorId,onAnswer,onReport}:{kit:Kit;question:Question|null;actorId:string;onAnswer:(body:string)=>boolean;onReport:(reason:string)=>void}){
 const{Field,Button}=kit;
 const[answer,setAnswer]=useState('');
 const[reportOpen,setReportOpen]=useState(false);
 const[reason,setReason]=useState('');
 useEffect(()=>{setAnswer('');setReportOpen(false);setReason('')},[question?.id]);
 if(!question||question.status==='hidden')return <div className="qp-empty" role="status"><MessageCircle size={32} aria-hidden="true"/><h2>이 질문을 볼 수 없어요</h2><p>질문 목록에서 다른 질문을 살펴보세요.</p></div>;
 const reported=question.reports.some(r=>r.by===actorId);
 return <article className="qp-detail"><div className="qp-detail-question"><span className="qp-status" data-answered={question.answers.length>0}>{question.answers.length?'답변 있어요':'답변 기다려요'}</span><h2>{questionTitle(question.term)}</h2><p className="qp-meta">{question.author} · {questionDate(question.createdAt)}</p>{question.body&&<p className="qp-body">{question.body}</p>}<button className="qp-report-toggle" disabled={reported} aria-expanded={reportOpen&&!reported} onClick={()=>setReportOpen(!reportOpen)}><Flag size={14} aria-hidden="true"/>{reported?'신고 접수됨':'신고하기'}</button>{reportOpen&&!reported&&<div className="qp-report"><fieldset><legend>신고 이유를 선택해 주세요</legend>{['스팸','부적절한 내용','잘못된 정보','기타'].map(item=><label key={item}><input type="radio" name={`question-report-${question.id}`} value={item} checked={reason===item} onChange={()=>setReason(item)}/>{item}</label>)}</fieldset><div className="qp-report-actions"><Button kind="secondary" onClick={()=>setReportOpen(false)}>취소</Button><Button disabled={!reason} onClick={()=>{if(reason){onReport(reason);setReportOpen(false);setReason('')}}}>신고 접수</Button></div></div>}</div><section className="qp-answers" aria-label="답변"><h3>답변 <span>{question.answers.length}</span></h3>{question.answers.length?question.answers.map(item=><div className="qp-answer" key={item.id}><p className="qp-answer-author"><b>{item.author}</b><time dateTime={item.createdAt}>{questionDate(item.createdAt)}</time></p><p className="qp-body">{item.body}</p></div>):<div className="qp-answer-empty"><MessageCircle size={25} aria-hidden="true"/><p>아직 답변이 없어요</p><span>알고 있는 표현이라면 함께 나눠주세요.</span></div>}</section><form className="qp-answer-form" onSubmit={e=>{e.preventDefault();if(answer.trim()){if(onAnswer(answer.trim()))setAnswer('')}}}><Field label="답변 남기기" value={answer} onChange={setAnswer} multiline maxLength={1000} placeholder="표현하는 방법이나 참고할 정보를 알려주세요."/><p className="qp-field-count">{answer.length}/1,000</p><Button type="submit" disabled={!answer.trim()}>답변 등록</Button></form></article>;
}
