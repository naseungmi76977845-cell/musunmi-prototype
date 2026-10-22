import {
  Bell, Bookmark, BookOpen, ChevronRight, FileText, LogOut, Mail,
  MessageSquare, Pencil, Settings, Shield, Trash2, UserRound, Video,
  type LucideIcon,
} from 'lucide-react';
import './profile-panel.css';
import {ProfileAvatar} from './profile-avatar';
import type {Equipped} from './points';

export type ProfilePanelProps = {
  nickname: string;
  points: number;
  equipped: Equipped;
  onPoints: () => void;
  onDecorate: () => void;
  unreadNotifications: number;
  onNotifications: () => void;
  goals: string[];
  counts: {recordings: number; posts: number; bookmarks: number; scraps: number};
  onEdit: () => void;
  onRecordings: () => void;
  onPosts: () => void;
  onBookmarks: () => void;
  onScraps: () => void;
  onSettings: () => void;
};

export type SettingsPanelProps = {
  onEdit: () => void;
  onAccount: () => void;
  onPolicy: (name: string) => void;
  onLogout: () => void;
};

export type AccountPanelProps = {
  email: string;
  onLogout: () => void;
  onWithdraw: () => void;
};

function PanelRow({icon: Icon, label, onClick, count, danger = false}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  count?: number;
  danger?: boolean;
}) {
  return <button type="button" className={`pp-row${danger ? ' pp-row-danger' : ''}`} onClick={onClick}>
    <span className="pp-row-icon"><Icon size={21} strokeWidth={1.7} aria-hidden="true" /></span>
    <span className="pp-row-label">{label}</span>
    {count !== undefined && <span className="pp-row-count">{count}<span className="pp-count-unit">개</span></span>}
    <ChevronRight className="pp-chevron" size={17} aria-hidden="true" />
  </button>;
}

export function ProfilePanel({nickname, points, equipped, onPoints, onDecorate, unreadNotifications, onNotifications, goals, counts, onEdit, onRecordings, onPosts, onBookmarks, onScraps, onSettings}: ProfilePanelProps) {
  return <div className="pp-panel pp-profile">
    <section className="pp-identity" aria-label="내 프로필">
      <ProfileAvatar nickname={nickname} equipped={equipped}/>
      <div className="pp-identity-copy">
        <h1>{nickname.trim() || '내 프로필'}</h1>
        <button type="button" className="pp-edit" onClick={onEdit}>
          프로필 수정<Pencil size={13} aria-hidden="true" />
        </button>
      </div>
    </section>

    <div className="pp-rewards">
      <button type="button" className="pp-points" onClick={onPoints}><span>내 포인트</span><b>{points.toLocaleString('ko-KR')} <small>P</small></b><ChevronRight size={16} aria-hidden="true"/></button>
      <button type="button" className="pp-decorate" onClick={onDecorate}><Pencil size={17} aria-hidden="true"/><span>프로필 꾸미기</span><ChevronRight size={16} aria-hidden="true"/></button>
    </div>

    {goals.length > 0 && <ul className="pp-goals" aria-label="관심 활동">
      {goals.map((goal, index) => <li key={`${goal}-${index}`}>{goal}</li>)}
    </ul>}

    <section className="pp-section" aria-labelledby="pp-saved-heading">
      <h2 id="pp-saved-heading">모아둔 것</h2>
      <div className="pp-saved-grid">
        <button type="button" className="pp-saved-card" onClick={onBookmarks}>
          <span className="pp-saved-icon"><BookOpen size={23} strokeWidth={1.7} aria-hidden="true" /></span>
          <span className="pp-saved-label">저장한 표현</span>
          <span className="pp-saved-value">{counts.bookmarks}<span>개</span></span>
          <ChevronRight className="pp-card-chevron" size={17} aria-hidden="true" />
        </button>
        <button type="button" className="pp-saved-card" onClick={onScraps}>
          <span className="pp-saved-icon"><Bookmark size={23} strokeWidth={1.7} aria-hidden="true" /></span>
          <span className="pp-saved-label">스크랩</span>
          <span className="pp-saved-value">{counts.scraps}<span>개</span></span>
          <ChevronRight className="pp-card-chevron" size={17} aria-hidden="true" />
        </button>
      </div>
    </section>

    <section className="pp-section" aria-labelledby="pp-activity-heading">
      <h2 id="pp-activity-heading">내 활동</h2>
      <div className="pp-rows">
        <PanelRow icon={MessageSquare} label="내 커뮤니티 글" count={counts.posts} onClick={onPosts} />
        <PanelRow icon={Video} label="올린 수어 영상" count={counts.recordings} onClick={onRecordings} />
      </div>
    </section>

    <div className="pp-footer-rows">
      <button type="button" className="pp-row" onClick={onNotifications}><span className="pp-row-icon"><Bell size={21} aria-hidden="true"/></span><span className="pp-row-label">알림</span>{unreadNotifications>0&&<span className="pp-unread">{unreadNotifications}</span>}<ChevronRight size={17} aria-hidden="true"/></button>
      <PanelRow icon={Settings} label="계정 및 설정" onClick={onSettings} />
    </div>
  </div>;
}

export function SettingsPanel({onEdit, onAccount, onPolicy, onLogout}: SettingsPanelProps) {
  return <div className="pp-panel pp-settings">
    <section className="pp-section" aria-labelledby="pp-personal-heading">
      <h2 id="pp-personal-heading">내 정보</h2>
      <div className="pp-rows">
        <PanelRow icon={UserRound} label="프로필 수정" onClick={onEdit} />
        <PanelRow icon={Settings} label="계정 관리" onClick={onAccount} />
      </div>
    </section>
    <section className="pp-section" aria-labelledby="pp-policy-heading">
      <h2 id="pp-policy-heading">약관 및 개인정보</h2>
      <div className="pp-rows">
        <PanelRow icon={FileText} label="이용약관" onClick={() => onPolicy('이용약관')} />
        <PanelRow icon={Shield} label="개인정보 처리방침" onClick={() => onPolicy('개인정보 처리방침')} />
      </div>
    </section>
    <div className="pp-footer-rows">
      <PanelRow icon={LogOut} label="로그아웃" onClick={onLogout} />
    </div>
  </div>;
}

export function AccountPanel({email, onLogout, onWithdraw}: AccountPanelProps) {
  return <div className="pp-panel pp-account">
    <section className="pp-email-card" aria-labelledby="pp-email-heading">
      <span className="pp-email-icon"><Mail size={23} strokeWidth={1.7} aria-hidden="true" /></span>
      <div>
        <h2 id="pp-email-heading">이메일</h2>
        <p>{email.trim() || '이메일 미등록'}</p>
      </div>
    </section>
    <div className="pp-rows">
      <PanelRow icon={LogOut} label="로그아웃" onClick={onLogout} />
    </div>
    <div className="pp-footer-rows pp-account-exit">
      <PanelRow icon={Trash2} label="회원탈퇴" onClick={onWithdraw} danger />
    </div>
  </div>;
}
