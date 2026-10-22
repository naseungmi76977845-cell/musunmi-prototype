import {Bell, ChevronRight, Coins, FileText, Video} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import type {Kit} from './contracts';
import type {AppNotification, UserVideo} from './activity';
import './activity-panels.css';

type NoticeFilter = 'all' | 'unread';

function formatActivityDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {year: 'numeric', month: 'short', day: 'numeric'}).format(date);
}

function NotificationIcon({kind}: {kind: AppNotification['kind']}) {
  if (kind === 'video') return <Video size={19} strokeWidth={1.9} />;
  if (kind === 'points') return <Coins size={19} strokeWidth={1.9} />;
  return <FileText size={19} strokeWidth={1.9} />;
}

export function NotificationPanel({kit, items, onOpen, onReadAll}: {
  kit: Kit;
  items: AppNotification[];
  onOpen: (id: string) => void;
  onReadAll: () => void;
}) {
  const {Button, Chip} = kit;
  const [filter, setFilter] = useState<NoticeFilter>('all');
  const unreadCount = items.filter(item => !item.read).length;
  const visibleItems = filter === 'unread' ? items.filter(item => !item.read) : items;

  return <div className="activity-panel notification-panel">
    <section className="activity-section" aria-labelledby="activity-notice-heading">
      <div className="activity-section-heading">
        <div>
          <h2 id="activity-notice-heading">최근 받은 소식</h2>
          <span>{unreadCount > 0 ? `읽지 않은 소식 ${unreadCount}개` : '모두 확인했어요'}</span>
        </div>
        <Button className="activity-inline-button" kind="ghost" disabled={unreadCount === 0} onClick={onReadAll}>모두 읽음</Button>
      </div>

      <div className="activity-filter" aria-label="알림 보기">
        <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>전체</Chip>
        <Chip selected={filter === 'unread'} onClick={() => setFilter('unread')}>안 읽음</Chip>
      </div>

      {visibleItems.length > 0
        ? <ul className="activity-list notification-list">
            {visibleItems.map(item => <li key={item.id}>
              <button className={`notification-row${item.read ? '' : ' is-unread'}`} type="button" onClick={() => onOpen(item.id)}>
                <span className="activity-mark" aria-hidden="true"><NotificationIcon kind={item.kind} /></span>
                <span className="notification-copy">
                  <strong>{item.title}</strong>
                  <span>{item.body}</span>
                  <small>{formatActivityDate(item.createdAt)}</small>
                </span>
                {!item.read && <span className="notification-unread"><i aria-hidden="true" /><span className="activity-sr-only">읽지 않음</span></span>}
                <ChevronRight className="activity-chevron" size={17} aria-hidden="true" />
              </button>
            </li>)}
          </ul>
        : <div className="activity-empty">
            <Bell size={25} strokeWidth={1.8} aria-hidden="true" />
            <p>{items.length === 0 ? '아직 받은 소식이 없어요.' : '읽지 않은 소식이 없어요.'}</p>
          </div>}
    </section>
  </div>;
}

export function UserVideosPanel({kit, videos, onOpen, onCreate, compact=false}: {
  kit: Kit;
  videos: UserVideo[];
  onOpen: (id: string) => void;
  onCreate: () => void;
  compact?: boolean;
}) {
  const {Button} = kit;

  return <div className="activity-panel">
    <section className="activity-section" aria-label={compact?'내가 올린 영상':undefined} aria-labelledby={compact?undefined:'activity-videos-heading'}>
      {(!compact||videos.length>0)&&<div className="activity-section-heading">
        <div>
          {!compact&&<h2 id="activity-videos-heading">올린 수어 영상</h2>}
          <span>{videos.length}개</span>
        </div>
        {videos.length > 0 && <Button className="activity-inline-button" kind="secondary" onClick={onCreate}>영상 올리기</Button>}
      </div>}

      {videos.length > 0
        ? <ul className="activity-list user-video-list">
            {videos.map(video => <li key={video.id}>
              <button className="user-video-row" type="button" onClick={() => onOpen(video.id)}>
                <span className="activity-mark" aria-hidden="true"><Video size={20} strokeWidth={1.9} /></span>
                <span className="user-video-copy">
                  <strong>{video.title}</strong>
                  {video.body && <span>{video.body}</span>}
                  <small>올린 날 · {formatActivityDate(video.createdAt)}</small>
                </span>
                <ChevronRight className="activity-chevron" size={17} aria-hidden="true" />
              </button>
            </li>)}
          </ul>
        : <div className="activity-empty">
            <Video size={27} strokeWidth={1.8} aria-hidden="true" />
            <p>아직 올린 수어 영상이 없어요.</p>
            <Button className="activity-inline-button" onClick={onCreate}>수어 영상 올리기</Button>
          </div>}
    </section>
  </div>;
}

export function OwnPostsPanel({kit, posts, onOpen, onCreate}: {
  kit: Kit;
  posts: {id: string; title: string; body: string; category: string}[];
  onOpen: (id: string) => void;
  onCreate: () => void;
}) {
  const {Button} = kit;

  return <div className="activity-panel">
    <section className="activity-section" aria-labelledby="activity-posts-heading">
      <div className="activity-section-heading">
        <div>
          <h2 id="activity-posts-heading">내 커뮤니티 글</h2>
          <span>{posts.length}개</span>
        </div>
        {posts.length > 0 && <Button className="activity-inline-button" kind="secondary" onClick={onCreate}>글쓰기</Button>}
      </div>

      {posts.length > 0
        ? <ul className="activity-list own-post-list">
            {posts.map(post => <li key={post.id}>
              <button className="own-post-row" type="button" onClick={() => onOpen(post.id)}>
                <span className="own-post-category">{post.category}</span>
                <strong>{post.title}</strong>
                <span className="own-post-body">{post.body}</span>
                <ChevronRight className="activity-chevron" size={17} aria-hidden="true" />
              </button>
            </li>)}
          </ul>
        : <div className="activity-empty">
            <FileText size={26} strokeWidth={1.8} aria-hidden="true" />
            <p>아직 작성한 글이 없어요.</p>
            <Button className="activity-inline-button" onClick={onCreate}>글쓰기</Button>
          </div>}
    </section>
  </div>;
}

export function VideoDetailPanel({kit, video, onDelete, onExpression}: {
  kit: Kit;
  video: UserVideo | null;
  onDelete: () => void;
  onExpression?: () => void;
}) {
  const {Button} = kit;
  const player = useRef<HTMLVideoElement>(null);
  const [slow, setSlow] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setSlow(false);
    setConfirmDelete(false);
    if (player.current) {
      player.current.playbackRate = 1;
      player.current.currentTime = 0;
    }
  }, [video?.id]);

  if (!video) return <div className="activity-panel">
    <div className="activity-empty video-detail-empty" role="status">
      <Video size={28} strokeWidth={1.8} aria-hidden="true" />
      <p>영상을 찾을 수 없어요.</p>
    </div>
  </div>;

  const toggleSpeed = () => {
    const nextSlow = !slow;
    setSlow(nextSlow);
    if (player.current) player.current.playbackRate = nextSlow ? 0.7 : 1;
  };

  return <div className="activity-panel video-detail-panel">
    <section className="activity-section" aria-labelledby="activity-video-title">
      <video key={video.id} ref={player} className="activity-video-player" src={video.url} controls playsInline preload="metadata">
        영상을 재생할 수 없어요.
      </video>
      <h2 id="activity-video-title" className="activity-video-title">{video.title}</h2>
      {video.body && <p className="activity-video-body">{video.body}</p>}
      <dl className="activity-video-meta">
        <div><dt>손 방향</dt><dd>{video.direction ? '중요해요' : '별도 표시 없음'}</dd></div>
        <div><dt>사투리</dt><dd>{video.dialect}</dd></div>
        <div><dt>올린 날</dt><dd>{formatActivityDate(video.createdAt)}</dd></div>
      </dl>
      <div className="activity-video-actions">
        <Button className="activity-action-button" kind="secondary" onClick={toggleSpeed}>{slow ? '기본 속도' : '느리게 0.7배'}</Button>
        {video.wordId && onExpression && <Button className="activity-action-button" kind="secondary" onClick={onExpression}>위키 표현 보기</Button>}
      </div>
      {!confirmDelete
        ? <Button className="activity-inline-button activity-delete-trigger" kind="ghost" onClick={() => setConfirmDelete(true)}>내 영상 삭제</Button>
        : <div className="activity-delete-confirm" role="group" aria-label="영상 삭제 확인">
            <p>이 영상을 내 목록에서 삭제할까요?</p>
            <div>
              <Button kind="danger" onClick={onDelete}>삭제</Button>
              <Button kind="secondary" onClick={() => setConfirmDelete(false)}>취소</Button>
            </div>
          </div>}
    </section>
  </div>;
}
