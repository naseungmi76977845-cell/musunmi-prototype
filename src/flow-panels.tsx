import {ChevronRight,FileText,LogOut,ShieldCheck} from 'lucide-react';
import type {Kit} from './contracts';
import {AuthProgress} from './auth-panel';
import {SignupPurposeArt,SignupLevelArt} from './signup-purpose-art';
import './flow-panels.css';

export const userTypes=[
 {id:'deaf',name:'농인'},
 {id:'hearing',name:'청인'},
 {id:'interpreter',name:'수어통역사'},
 {id:'other',name:'기타'},
] as const;
export type UserType=typeof userTypes[number]['id'];
export const knowledgeLevels=[
 {id:'new',title:'처음이에요',description:'기초부터 차근차근',art:1},
 {id:'basic',title:'조금 알아요',description:'간단한 인사와 표현을 알아요',art:2},
 {id:'conversational',title:'어느 정도 할 수 있어요',description:'일상 속 대화를 할 수 있어요',art:3},
 {id:'comfortable',title:'익숙하게 사용해요',description:'수어로 자연스럽게 소통해요',art:4},
] as const;
export type KnowledgeLevel=typeof knowledgeLevels[number]['id'];

export function ProfileSetupPanel({kit,nickname,userType,editing,error,typeError,onNickname,onUserType,onEditKnowledge,onEditPurpose,onContinue}:{kit:Kit;nickname:string;userType:UserType|'';editing:boolean;error?:string;typeError?:string;onNickname:(v:string)=>void;onUserType:(v:UserType)=>void;onEditKnowledge:()=>void;onEditPurpose:()=>void;onContinue:()=>void}) {
 const{Field,Button}=kit;
 return <>{!editing&&<AuthProgress step={2}/>}
  <div className="page-heading"><h1>{editing?'프로필 수정':'어떤 이름으로 만날까요?'}</h1></div>
  <Field label="닉네임" value={nickname} onChange={onNickname} maxLength={20} placeholder="1~20자" error={error}/>
  <fieldset className="fp-user-types" aria-describedby={typeError?'profile-type-error':undefined} aria-invalid={Boolean(typeError)}><legend>어떤 분이신가요?</legend><div>{userTypes.map(item=><label className="fp-user-type" data-selected={userType===item.id} key={item.id}><b>{item.name}</b><input type="radio" name="user-type" value={item.id} checked={userType===item.id} required onChange={()=>onUserType(item.id)}/></label>)}</div>{typeError&&<p className="error" id="profile-type-error" role="alert">{typeError}</p>}</fieldset>
  {editing&&<div><button className="app-row" onClick={onEditKnowledge}><span>수어 경험 수정</span><ChevronRight size={18}/></button><button className="app-row" onClick={onEditPurpose}><span>가입 목적 수정</span><ChevronRight size={18}/></button></div>}
  <div className="bottom-action"><Button onClick={onContinue}>{editing?'저장':'계속'}</Button></div>
 </>;
}

export function KnowledgePanel({kit,level,editing,onLevel,onContinue}:{kit:Kit;level:KnowledgeLevel|'';editing:boolean;onLevel:(v:KnowledgeLevel)=>void;onContinue:()=>void}){
 const{Button}=kit;
 return <>{!editing&&<AuthProgress step={3}/>}<div className="page-heading"><h1>수어를 얼마나<br/>잘 알고 있나요?</h1></div><fieldset className="fp-knowledge" aria-label="수어 경험"><div className="fp-purpose-list">{knowledgeLevels.map(item=><label className="fp-purpose-option fp-knowledge-option" data-selected={level===item.id} key={item.id}><span className="fp-purpose-art"><SignupLevelArt level={item.art}/></span><span className="fp-knowledge-copy"><b>{item.title}</b><small>{item.description}</small></span><input type="radio" name="knowledge-level" value={item.id} checked={level===item.id} required onChange={()=>onLevel(item.id)}/></label>)}</div></fieldset><div className="bottom-action"><Button disabled={!level} onClick={onContinue}>{editing?'적용':'계속'}</Button></div></>;
}

export function PurposePanel({kit,goals,selectedGoals,editing,onGoal,onContinue}:{kit:Kit;goals:readonly string[];selectedGoals:string[];editing:boolean;onGoal:(v:string,selected:boolean)=>void;onContinue:()=>void}){
 const{Button}=kit;
 const kinds=['learn','find','share','connect'] as const;
 return <>{!editing&&<AuthProgress step={4}/>}<div className="page-heading fp-purpose-heading"><h1>수어역에 오신 이유는<br/>무엇인가요?</h1><p>여러 개 선택할 수 있어요.</p></div><div className="fp-purpose-list" role="group" aria-label="가입 목적">{goals.map((goal,i)=><label className="fp-purpose-option" data-selected={selectedGoals.includes(goal)} key={goal}><span className="fp-purpose-art"><SignupPurposeArt kind={kinds[i]}/></span><b>{goal}</b><input type="checkbox" checked={selectedGoals.includes(goal)} onChange={e=>onGoal(goal,e.target.checked)}/></label>)}</div><div className="bottom-action"><Button disabled={selectedGoals.length===0} onClick={onContinue}>{editing?'적용':'계속'}</Button></div></>;
}

export function TermsPanel({kit,terms,privacy,marketing,onTerms,onPrivacy,onMarketing,onAll,onPolicy,onContinue}:{kit:Kit;terms:boolean;privacy:boolean;marketing:boolean;onTerms:(v:boolean)=>void;onPrivacy:(v:boolean)=>void;onMarketing:(v:boolean)=>void;onAll:(v:boolean)=>void;onPolicy:(name:string)=>void;onContinue:()=>void}) {
 const{Check,Button}=kit;
 return <><AuthProgress step={5}/><div className="page-heading"><h1>시작하기 전에</h1><p>필수 약관을 확인해 주세요.</p></div>
  <div className="fp-terms-all"><Check label="전체 동의" checked={terms&&privacy&&marketing} onChange={onAll}/></div>
  <div className="fp-term-rows">
   <div><Check label="이용약관 동의 (필수)" checked={terms} onChange={onTerms}/><button className="icon-button" aria-label="이용약관 보기" onClick={()=>onPolicy('이용약관')}><ChevronRight size={18}/></button></div>
   <div><Check label="개인정보 수집·이용 동의 (필수)" checked={privacy} onChange={onPrivacy}/><button className="icon-button" aria-label="개인정보 안내 보기" onClick={()=>onPolicy('개인정보 처리방침')}><ChevronRight size={18}/></button></div>
   <Check label="소식 받기 (선택)" checked={marketing} onChange={onMarketing}/>
  </div>
  <div className="bottom-action"><Button disabled={!terms||!privacy} onClick={onContinue}>가입하기</Button></div>
 </>;
}

export function RecoverPanel({kit,email,error,onEmail,onSubmit,onBack}:{kit:Kit;email:string;error?:string;onEmail:(v:string)=>void;onSubmit:()=>void;onBack:()=>void}) {
 const{Field,Button}=kit;
 return <><div className="fp-recover-icon"><ShieldCheck size={30}/></div><div className="page-heading"><h1>비밀번호 찾기</h1><p>가입한 이메일을 입력해 주세요.</p></div><form className="fp-recover-form" onSubmit={e=>{e.preventDefault();onSubmit()}}><Field label="이메일" type="email" autoComplete="email" placeholder="이메일 주소" value={email} onChange={onEmail} error={error}/><Button type="submit" disabled={!email.trim()}>재설정 링크 받기</Button><Button kind="ghost" onClick={onBack}>로그인으로 돌아가기</Button></form></>;
}

export function WithdrawPanel({kit,reason,agreed,onReason,onAgree,onContinue,onCancel}:{kit:Kit;reason:string;agreed:boolean;onReason:(v:string)=>void;onAgree:(v:boolean)=>void;onContinue:()=>void;onCancel:()=>void}) {
 const{Check,Chip,Button}=kit;
 return <><div className="withdraw-symbol"><LogOut size={31}/></div><div className="page-heading"><h1>수어역을 떠나시겠어요?</h1><p>삭제한 기록은 되돌릴 수 없어요.</p></div>
  <section className="fp-delete-scope"><h2>탈퇴하면 삭제돼요</h2><div><FileText size={19}/><span>프로필과 내 글·댓글</span></div><div><ShieldCheck size={19}/><span>촬영본과 저장한 표현·스크랩</span></div><div><ShieldCheck size={19}/><span>포인트와 꾸미기 아이템</span></div></section>
  <details className="fp-reasons"><summary>탈퇴 이유 남기기 <span>선택</span><ChevronRight size={17}/></summary><div>{['원하는 콘텐츠가 없어요','사용하기 어려워요','자주 이용하지 않아요','다른 이유가 있어요'].map(r=><Chip key={r} selected={reason===r} onClick={()=>onReason(reason===r?'':r)}>{r}</Chip>)}</div></details>
  <Check label="탈퇴 안내를 확인했어요" checked={agreed} onChange={onAgree}/>
  <div className="bottom-action"><Button kind="danger" disabled={!agreed} onClick={onContinue}>탈퇴하기</Button><Button kind="secondary" onClick={onCancel}>계속 이용하기</Button></div>
 </>;
}
