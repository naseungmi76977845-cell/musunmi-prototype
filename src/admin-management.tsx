import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {ChevronRight, EyeOff, RotateCcw, Search, Users, X, MessageSquare, Video} from 'lucide-react';
import {moderateContent, moderateMember, type ManagedState} from './managed-content';
import {useVideoSource} from './use-managed-content';

export type ManagementView = 'members' | 'posts' | 'videos';
const labels = {members:'회원',posts:'커뮤니티 글',videos:'수어영상'};
const userTypes:Record<string,string>={deaf:'농인',hearing:'청인',interpreter:'수어 통역사',other:'기타'};
const knowledgeLevels:Record<string,string>={new:'처음 배워요',basic:'기초 표현을 알아요',conversational:'일상 대화가 가능해요',comfortable:'능숙하게 사용해요'};
const statuses:Record<string,string> = {active:'활동 중',suspended:'이용 정지',withdrawn:'탈퇴',published:'공개',hidden:'숨김'};
function date(value:string) {return new Date(value).toLocaleDateString('ko-KR');}
function VideoPreview({id}:{id:string}) {
  const source = useVideoSource(id);
  return <section className="admin-detail-section"><h3>영상 미리보기</h3>{source.loading ? <p className="admin-muted" role="status">영상을 불러오는 중입니다.</p> : source.url ? <video className="admin-video-preview" src={source.url} controls preload="metadata" aria-label="등록한 수어영상 미리보기"/> : <p className="admin-muted">{source.error || '이 브라우저에서 영상 파일을 찾을 수 없습니다.'}</p>}</section>;
}

export function AdminManagement({view,state,onModalChange,onNotice}:{view:ManagementView;state:ManagedState;onModalChange:(open:boolean)=>void;onNotice:(message:string)=>void}) {
  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState('all');
  const [selectedId,setSelectedId] = useState<string|null>(null);
  const [confirm,setConfirm] = useState<string|null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const collection = state[view];
  const selected = collection.find(row => row.id === selectedId);
  const member = view === 'members' ? state.members.find(row => row.id === selectedId) : undefined;
  const post = view === 'posts' ? state.posts.find(row => row.id === selectedId) : undefined;
  const video = view === 'videos' ? state.videos.find(row => row.id === selectedId) : undefined;
  const term = search.trim().toLocaleLowerCase();
  const rows = collection.filter(row => (filter === 'all' || row.status === filter) && (!term || ('nickname' in row ? [row.nickname,row.email] : [row.title,row.body,row.author]).some(value => value.toLocaleLowerCase().includes(term)))).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const Icon = view === 'members' ? Users : view === 'posts' ? MessageSquare : Video;
  const restore = selected?.status === 'suspended' || selected?.status === 'hidden';
  const actionLabel = member ? (restore ? '이용 정지 해제' : '이용 정지') : (restore ? '콘텐츠 복원' : '콘텐츠 숨기기');
  function close(){setSelectedId(null);setConfirm(null);}
  useEffect(()=>{setSearch('');setFilter('all');setSelectedId(null);setConfirm(null);},[view]);
  useEffect(()=>{onModalChange(Boolean(selected));return ()=>onModalChange(false);},[Boolean(selected),onModalChange]);
  useEffect(()=>{if(selectedId && !selected)close();},[selectedId,selected]);
  useEffect(()=>{
    if(!selectedId)return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow='hidden';
    panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    function key(event:KeyboardEvent){
      if(event.key==='Escape'){event.preventDefault();close();return;}
      if(event.key!=='Tab')return;
      const controls=Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, textarea, video[controls], [tabindex="0"]')??[]);
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
    }
    document.addEventListener('keydown',key);
    return ()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);requestAnimationFrame(()=>{if(previous?.isConnected)previous.focus();});};
  },[selectedId]);
  function execute(){
    if(!selected)return;
    if(confirm!==selected.status){onNotice('대상의 상태가 변경되었습니다. 내용을 다시 확인해 주세요.');setConfirm(null);return;}
    const ok=member ? moderateMember(selected.id,restore?'restore':'suspend') : moderateContent(view==='posts'?'post':'video',selected.id,restore?'restore':'hide');
    onNotice(ok ? `${actionLabel} 처리했습니다.${restore?'':' 상세 화면에서 되돌릴 수 있습니다.'}` : '대상이 변경되었거나 처리할 수 없는 상태입니다. 목록을 확인해 주세요.');
    setConfirm(null);
  }
  return <>
    <section className="admin-list-section" aria-labelledby="management-title">
      <div className="admin-list-heading"><div><h2 id="management-title">{labels[view]} 목록</h2><span>총 {rows.length}개</span></div><p>항목을 선택해 상세 내용을 확인하세요.</p></div>
      <div className="admin-filters"><label className="admin-search"><Search size={18}/><input value={search} onChange={e=>setSearch(e.target.value)} aria-label={`${labels[view]} 검색`} placeholder={view==='members'?'닉네임, 이메일 검색':'제목, 내용, 작성자 검색'}/>{search&&<button aria-label="검색 지우기" onClick={()=>setSearch('')}><X size={15}/></button>}</label><select aria-label={`${labels[view]} 상태 필터`} value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">모든 상태</option>{(view==='members'?['active','suspended','withdrawn']:['published','hidden']).map(status=><option key={status} value={status}>{statuses[status]}</option>)}</select></div>
      {rows.length?<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>{labels[view]}</th><th>{view==='members'?'이메일':'작성자'}</th><th>상태</th><th>등록일</th><th><span className="admin-sr-only">상세</span></th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><button className="admin-question-link" onClick={()=>{setSelectedId(row.id);setConfirm(null);}}><strong>{'nickname' in row?row.nickname:row.title}</strong>{'body' in row&&<span className="admin-row-excerpt">{row.body || '내용 없음'}</span>}</button></td><td data-label={view==='members'?'이메일':'작성자'}>{'email' in row?(row.email||'미입력'):row.author}</td><td data-label="상태"><span className={`admin-status ${row.status}`}>{statuses[row.status]}</span></td><td className="admin-date" data-label="등록일">{date(row.createdAt)}</td><td className="admin-detail-cell"><button className="admin-icon-button" aria-label={`${'nickname' in row?row.nickname:row.title} 상세 보기`} onClick={()=>{setSelectedId(row.id);setConfirm(null);}}><ChevronRight size={18}/></button></td></tr>)}</tbody></table></div>:<div className="admin-empty"><Icon size={32}/><h3>{search||filter!=='all'?`조건에 맞는 ${labels[view]}이 없습니다`:`아직 등록된 ${labels[view]}이 없습니다`}</h3><p>{search||filter!=='all'?'검색어나 상태 필터를 변경해 보세요.':view==='members'?'앱에서 가입한 회원이 이곳에 표시됩니다.':view==='posts'?'앱에서 커뮤니티 글을 작성하면 이곳에 표시됩니다.':'앱에서 수어영상을 등록하면 이곳에 표시됩니다.'}</p>{(search||filter!=='all')&&<button onClick={()=>{setSearch('');setFilter('all');}}>필터 초기화</button>}</div>}
    </section>
    {selected&&createPortal(<div className="admin-overlay" onClick={e=>{if(e.target===e.currentTarget)close();}}><section ref={panelRef} className="admin-detail" role="dialog" aria-modal="true" aria-labelledby="management-detail-title"><header><div><p>{labels[view]} 상세</p><h2 id="management-detail-title">{member?.nickname || post?.title || video?.title}</h2></div><button className="admin-icon-button" aria-label="상세 닫기" onClick={close}><X size={22}/></button></header><div className="admin-detail-body"><div className="admin-detail-meta"><span className={`admin-status ${selected.status}`}>{statuses[selected.status]}</span><span>등록일 {date(selected.createdAt)}</span></div>
      {member?<dl className="admin-info"><dt>이메일</dt><dd>{member.email||'미입력'}</dd><dt>사용자 유형</dt><dd>{userTypes[member.userType] || member.userType || '미설정'}</dd><dt>수어 지식</dt><dd>{knowledgeLevels[member.knowledge] || member.knowledge || '미설정'}</dd><dt>학습 목표</dt><dd>{member.goals.length?member.goals.join(', '):'미입력'}</dd><dt>수정일</dt><dd>{date(member.updatedAt)}</dd></dl>:<><p className="admin-content-author">작성자 {post?.author || video?.author}</p><p className="admin-question-body">{post?.body || video?.body || '내용이 없습니다.'}</p>{post&&<dl className="admin-info"><dt>카테고리</dt><dd>{post.category || '미지정'}</dd><dt>수정일</dt><dd>{date(post.updatedAt)}</dd></dl>}{video&&<><dl className="admin-info"><dt>연결 단어</dt><dd>{video.wordId || '자유 수어영상'}</dd><dt>수어 방향</dt><dd>{video.direction?'방향 있음':'방향 없음'}</dd><dt>지역 수어</dt><dd>{video.dialect || '미입력'}</dd></dl><VideoPreview id={video.id}/></>}</>}
      <div className="admin-detail-actions"><button className="admin-secondary" disabled={member?.status==='withdrawn'} onClick={()=>setConfirm(selected.status)}>{restore?<RotateCcw size={17}/>:<EyeOff size={17}/>} {actionLabel}</button></div>{member?.status==='withdrawn'&&<p className="admin-muted">탈퇴한 회원은 이용 상태를 변경할 수 없습니다.</p>}
      {confirm&&<div className="admin-confirm" role="alert"><strong>{actionLabel} 처리할까요?</strong><p>{member?(restore?'이 회원은 다시 앱에서 글과 영상을 등록할 수 있습니다.':'이 회원의 글과 영상 등록이 제한됩니다. 이후 이용 정지를 해제할 수 있습니다.'):(restore?'앱 목록에 다시 표시됩니다.':'앱 목록에서 숨겨집니다. 상세 화면에서 복원할 수 있습니다.')}</p><div><button className="admin-secondary" onClick={()=>setConfirm(null)}>취소</button><button className="admin-primary" onClick={execute}>확인</button></div></div>}
    </div></section></div>,document.body)}
  </>;
}


