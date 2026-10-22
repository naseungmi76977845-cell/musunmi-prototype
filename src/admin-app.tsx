import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowUpRight, Check, ChevronRight, Flag, HelpCircle, LayoutDashboard, MessageSquare, Search, ShieldCheck, X, EyeOff, RotateCcw, Users, Video, FileText} from 'lucide-react';
import {useQuestions} from './use-questions';
import {moderateQuestion} from './questions';
import {useManagedContent} from './use-managed-content';
import {AdminManagement, type ManagementView} from './admin-management';
import './admin.css';
import './line-mode.css';

type View = 'dashboard' | 'questions' | 'reports' | ManagementView;
function hashView():View {const hash=window.location.hash.slice(1);return ['dashboard','questions','reports','members','posts','videos'].includes(hash)?hash as View:'dashboard';}
type Action = 'hide' | 'restore' | 'dismissReports';
const statusLabel = {open:'답변 대기', answered:'답변 완료', hidden:'숨김'};
function date(value:string) { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? '날짜 없음' : parsed.toLocaleDateString('ko-KR', {year:'numeric', month:'2-digit', day:'2-digit'}); }

function AdminApp() {
  const questions = useQuestions();
  const managed = useManagedContent();
  const [view, setView] = useState<View>(hashView);
  const [managedModal, setManagedModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{id:string;action:Action} | null>(null);
  const [notice, setNotice] = useState('');
  const detailRef = useRef<HTMLElement>(null);
  const selected = questions.find(q => q.id === selectedId);
  const reportQuestions = questions.filter(q => q.reports.length > 0);
  const reportCount = questions.reduce((count,q) => count + q.reports.length,0);
  const answerCount = questions.reduce((count,q) => count + q.answers.length,0);
  const hiddenCount = questions.filter(q => q.status === 'hidden').length;
  const term = search.trim().toLocaleLowerCase();
  const rows = questions.filter(q => (view !== 'reports' || q.reports.length > 0) && (filter === 'all' || q.status === filter) && (!term || [q.term,q.body,q.author].some(value => value.toLocaleLowerCase().includes(term)))).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  useEffect(() => { if (selectedId && !questions.some(q => q.id === selectedId)) {setSelectedId(null); setConfirmation(null);} }, [questions, selectedId]);
  useEffect(() => { if (confirmation && !questions.some(q => q.id === confirmation.id)) setConfirmation(null); }, [questions, confirmation]);
  useEffect(() => {
    if (!selectedId) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    detailRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    function handleKey(event:KeyboardEvent) {
      if (event.key === 'Escape') {setSelectedId(null);setConfirmation(null);return;}
      if (event.key !== 'Tab') return;
      const controls = Array.from(detailRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]') ?? []);
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {event.preventDefault();last?.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first?.focus();}
    }
    document.addEventListener('keydown', handleKey);
    return () => {document.body.style.overflow = previousOverflow;document.removeEventListener('keydown', handleKey);previousFocus?.focus();};
  }, [selectedId]);
  useEffect(()=>{function change(){setView(hashView());setFilter('all');setSearch('');setNotice('');setSelectedId(null);setConfirmation(null);}window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  function navigate(next:View) {window.location.hash=next;setView(next);setFilter('all');setSearch('');setNotice('');}
  function execute() {
    if (!confirmation) return;
    const ok = moderateQuestion(confirmation.id, confirmation.action);
    setNotice(ok ? (confirmation.action === 'hide' ? '질문을 숨겼습니다. 상세 화면에서 다시 복원할 수 있습니다.' : confirmation.action === 'restore' ? '질문을 복원했습니다.' : '이 질문의 신고를 검토 완료했습니다.') : '질문이 변경되었거나 더 이상 존재하지 않습니다. 목록을 확인해 주세요.');
    setConfirmation(null);
  }
  const nav = [{id:'dashboard' as const,label:'대시보드',icon:LayoutDashboard}, {id:'members' as const,label:'회원 관리',icon:Users}, {id:'posts' as const,label:'커뮤니티 글',icon:FileText}, {id:'videos' as const,label:'수어영상',icon:Video}, {id:'questions' as const,label:'질문 관리',icon:MessageSquare}, {id:'reports' as const,label:'신고 관리',icon:Flag}];
  const managementView = view === 'members' || view === 'posts' || view === 'videos' ? view : null;
  const modalOpen = Boolean(selected) || managedModal;
  return <div className="admin-shell">
    <aside className="admin-sidebar" inert={modalOpen}>
      <a className="admin-brand" href="/admin"><span className="admin-brand-mark"><ShieldCheck size={23}/></span><span>수어역 <small>관리</small></span></a>
      <div className="admin-nav-label">운영</div>
      <nav aria-label="관리 메뉴">{nav.map(({id,label,icon:Icon}) => <button key={id} className={view === id ? 'active' : ''} aria-current={view === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={19}/><span>{label}</span>{id === 'reports' && reportCount > 0 && <b>{reportCount}</b>}</button>)}</nav>
      <div className="admin-sidebar-bottom"><p><HelpCircle size={16}/> 콘텐츠 관리</p><span>이 브라우저에 저장된 데이터입니다.</span><a href="/">앱 보기 <ArrowUpRight size={16}/></a></div>
    </aside>
    <main className="admin-main" inert={modalOpen}>
      <header className="admin-topbar"><span>수어역 관리 <ChevronRight size={14}/> {nav.find(n => n.id === view)?.label}</span></header>
      <div className="admin-content">
        <div className="admin-page-heading"><div><h1>{nav.find(n => n.id === view)?.label}</h1><p>{view === 'dashboard' ? '회원과 콘텐츠 현황을 살펴보고, 검토가 필요한 신고를 확인하세요.' : view === 'reports' ? '신고 사유와 질문 내용을 함께 확인하고 조치하세요.' : view === 'members' ? '회원 정보를 확인하고 이용 상태를 관리하세요.' : view === 'posts' ? '커뮤니티 글을 확인하고 공개 상태를 관리하세요.' : view === 'videos' ? '등록한 영상을 확인하고 공개 상태를 관리하세요.' : '질문과 답변을 확인하고 커뮤니티 콘텐츠를 관리하세요.'}</p></div></div>
        {notice && <div className="admin-notice" role="status"><Check size={17}/>{notice}<button aria-label="알림 닫기" onClick={() => setNotice('')}><X size={16}/></button></div>}
        <section className="admin-stats" aria-label="커뮤니티 현황">
          {[{label:'전체 회원',value:managed.members.length,icon:Users,note:`활동 중 ${managed.members.filter(m=>m.status==='active').length}명`}, {label:'커뮤니티 글',value:managed.posts.length,icon:FileText,note:`공개 ${managed.posts.filter(p=>p.status==='published').length}건`}, {label:'수어영상',value:managed.videos.length,icon:Video,note:`공개 ${managed.videos.filter(v=>v.status==='published').length}건`}, {label:'전체 질문',value:questions.length,icon:MessageSquare,note:`답변 ${answerCount}건 · 숨긴 질문 ${hiddenCount}건`}, {label:'검토할 신고',value:reportCount,icon:Flag,note:`${reportQuestions.length}개 질문의 신고`}].map(({label,value,icon:Icon,note}) => <article className="admin-stat" key={label}><div><span>{label}</span><Icon size={19}/></div><strong>{value.toLocaleString()}<small>{label==='전체 회원'?'명':'건'}</small></strong><p>{note}</p></article>)}
        </section>
        {view === 'dashboard' && <section className="admin-review-banner"><div className="admin-review-icon"><Flag size={22}/></div><div><h2>{reportCount ? `${reportQuestions.length}개 질문에 검토할 신고가 있어요` : '현재 검토할 신고가 없습니다'}</h2><p>{reportCount ? '신고 내용과 답변을 확인한 후 필요한 조치를 진행하세요.' : '새 신고가 등록되면 이곳에서 확인할 수 있습니다.'}</p></div><button onClick={() => navigate('reports')}>신고 관리 <ChevronRight size={16}/></button></section>}
        {managementView ? <AdminManagement key={managementView} view={managementView} state={managed} onModalChange={setManagedModal} onNotice={setNotice}/> : <section className="admin-list-section" aria-labelledby="question-list-title">
          <div className="admin-list-heading"><div><h2 id="question-list-title">{view === 'reports' ? '신고된 질문' : view === 'dashboard' ? '최근 질문' : '질문 목록'}</h2><span>총 {rows.length}개</span></div><p>질문을 선택해 상세 내용을 확인하세요.</p></div>
          <div className="admin-filters"><label className="admin-search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="표현, 질문 내용, 작성자 검색" aria-label="질문 검색"/>{search && <button aria-label="검색 지우기" onClick={() => setSearch('')}><X size={15}/></button>}</label><select aria-label="질문 상태 필터" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">모든 상태</option><option value="open">답변 대기</option><option value="answered">답변 완료</option><option value="hidden">숨김</option></select></div>
          {rows.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>질문</th><th>작성자</th><th>상태</th><th>답변</th><th>신고</th><th>등록일</th><th><span className="admin-sr-only">상세</span></th></tr></thead><tbody>{rows.map(q => <tr key={q.id}><td><button className="admin-question-link" onClick={() => {setSelectedId(q.id);setConfirmation(null);}}><span className="admin-term">{q.term}</span><strong>{q.body}</strong></button></td><td data-label="작성자">{q.author}</td><td data-label="상태"><span className={`admin-status ${q.status}`}>{statusLabel[q.status]}</span></td><td data-label="답변">{q.answers.length}</td><td data-label="신고"><span className={q.reports.length ? 'admin-report-count' : ''}>{q.reports.length}</span></td><td data-label="등록일" className="admin-date">{date(q.createdAt)}</td><td className="admin-detail-cell"><button aria-label={`${q.term} 질문 상세 보기`} className="admin-icon-button" onClick={() => {setSelectedId(q.id);setConfirmation(null);}}><ChevronRight size={18}/></button></td></tr>)}</tbody></table></div> : <div className="admin-empty"><MessageSquare size={32}/><h3>{search || filter !== 'all' ? '조건에 맞는 질문이 없습니다' : view === 'reports' ? '검토할 신고가 없습니다' : '아직 등록된 질문이 없습니다'}</h3><p>{search || filter !== 'all' ? '검색어나 상태 필터를 변경해 보세요.' : view === 'reports' ? '질문에 신고가 등록되면 이곳에 표시됩니다.' : '앱에서 질문을 작성하면 이곳에서 확인할 수 있습니다.'}</p>{(search || filter !== 'all') && <button onClick={() => {setSearch('');setFilter('all');}}>필터 초기화</button>}</div>}
        </section>}
        <footer className="admin-footer">수어역 관리</footer>
      </div>
    </main>
    {selected && <div className="admin-overlay" onClick={e => {if(e.target === e.currentTarget) {setSelectedId(null);setConfirmation(null);}}}><section ref={detailRef} className="admin-detail" role="dialog" aria-modal="true" aria-labelledby="admin-detail-title">
      <header><div><p>질문 상세</p><h2 id="admin-detail-title">{selected.term}</h2></div><button className="admin-icon-button" autoFocus aria-label="상세 닫기" onClick={() => {setSelectedId(null);setConfirmation(null);}}><X size={22}/></button></header>
      <div className="admin-detail-body"><div className="admin-detail-meta"><span className={`admin-status ${selected.status}`}>{statusLabel[selected.status]}</span><span>{selected.author} · {date(selected.createdAt)}</span></div><p className="admin-question-body">{selected.body}</p>
        <section className="admin-detail-section"><h3>답변 <span>{selected.answers.length}</span></h3>{selected.answers.length ? selected.answers.map(a => <article className="admin-answer" key={a.id}><div><strong>{a.author}</strong><time>{date(a.createdAt)}</time></div><p>{a.body}</p></article>) : <p className="admin-muted">아직 답변이 없습니다.</p>}</section>
        <section className="admin-detail-section"><h3>신고 내역 <span>{selected.reports.length}</span></h3>{selected.reports.length ? selected.reports.map((r,i) => <article className="admin-report" key={`${r.by}-${r.createdAt}-${i}`}><div><Flag size={15}/><strong>{r.reason}</strong></div><p>{r.by} · {date(r.createdAt)}</p></article>) : <p className="admin-muted">검토할 신고가 없습니다.</p>}</section>
        <div className="admin-detail-actions"><button className="admin-secondary" onClick={() => setConfirmation({id:selected.id,action:selected.status === 'hidden' ? 'restore' : 'hide'})}>{selected.status === 'hidden' ? <RotateCcw size={17}/> : <EyeOff size={17}/>} {selected.status === 'hidden' ? '질문 복원' : '질문 숨기기'}</button><button className="admin-primary" disabled={!selected.reports.length} onClick={() => setConfirmation({id:selected.id,action:'dismissReports'})}><Check size={17}/> 신고 검토 완료</button></div>
        {confirmation?.id === selected.id && <div className="admin-confirm" role="alert"><strong>{confirmation.action === 'hide' ? '이 질문을 숨길까요?' : confirmation.action === 'restore' ? '이 질문을 복원할까요?' : '이 질문의 신고를 검토 완료할까요?'}</strong><p>{confirmation.action === 'hide' ? '앱 질문 목록에서 숨겨집니다. 언제든 복원할 수 있습니다.' : confirmation.action === 'restore' ? '질문과 답변이 앱 질문 목록에 다시 표시됩니다.' : '현재 질문의 신고 내역이 지워집니다. 내용을 충분히 확인해 주세요.'}</p><div><button className="admin-secondary" onClick={() => setConfirmation(null)}>취소</button><button className="admin-primary" onClick={execute}>확인</button></div></div>}
      </div>
    </section></div>}
  </div>;
}

document.documentElement.dataset.lineMode = new URLSearchParams(location.search).get('line')==='1'?'true':'false';
createRoot(document.getElementById('root')!).render(<AdminApp/>);
