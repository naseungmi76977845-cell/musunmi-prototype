import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {isScreen, screens, type ScreenId} from './screens';
import './design-lab.css';

type Group = {title: string; ids: ScreenId[]};

const groups: Group[] = [
  {title: '시작·가입', ids: ['login', 'signup', 'profileSetup', 'knowledge', 'purpose', 'terms', 'welcome']},
  {title: '홈·사전역', ids: ['home', 'wiki', 'signSearch', 'questions', 'questionCompose', 'question', 'term', 'record', 'videoDetail']},
  {title: '배움역', ids: ['learn']},
  {title: '소통역', ids: ['community', 'post', 'compose']},
  {title: '내 활동·설정', ids: ['profile', 'notifications', 'points', 'wardrobe', 'collection', 'settings', 'account', 'withdraw', 'withdrawConfirm', 'withdrawDone']},
];

const names = {...Object.fromEntries(screens), policy: '약관·개인정보'} as Record<ScreenId, string>;

const scopes: Partial<Record<ScreenId, string>> = {
  login: '구구가 맞이하는 로그인 화면입니다. 소셜 로그인은 준비 중이며, 회원가입으로 시작할 수 있어요.',
  recover: '비밀번호 재설정 안내를 준비 중인 화면입니다.',
  signup: '이메일과 비밀번호로 회원가입을 시작합니다.',
  profileSetup: '닉네임과 사용자 유형을 입력합니다.',
  knowledge: '수어 경험 수준을 선택합니다.',
  purpose: '배우기·찾기·나누기·소통하기를 복수 선택합니다.',
  terms: '필수 약관에 동의하고 가입을 마칩니다.',
  welcome: '가입 완료 후 수어역으로 들어갑니다.',
  home: '환영 배너와 검색·오늘의 표현으로 수어역에 입장합니다.',
  wiki: '사전역 배너와 카테고리로 수어 표현을 찾습니다.',
  signSearch: '카메라로 수어를 찾아보는 체험 화면입니다.',
  questions: '수어 질문을 둘러보고 새 질문을 작성합니다.',
  questionCompose: '궁금한 표현을 글로 질문합니다.',
  question: '질문 상세와 답변을 확인합니다.',
  term: '대표 영상, 느리게 보기, 표현 저장, 영상 기여를 제공합니다.',
  record: '나의 수어 영상을 등록합니다.',
  videoDetail: '등록한 수어 영상 상세와 삭제를 제공합니다.',
  learn: '일상선 역명판과 노선도로 표현을 배웁니다.',
  community: '코르크 게시판과 이야기 목록으로 소통역을 둘러봅니다.',
  post: '글 상세, 공감·스크랩, 댓글을 제공합니다.',
  compose: '커뮤니티 글을 작성하거나 수정합니다.',
  profile: '마이페이지에서 포인트·모아둔 것·내 활동을 봅니다.',
  notifications: '최근 받은 알림을 확인합니다.',
  points: '포인트 적립과 사용 내역을 봅니다.',
  wardrobe: '포인트로 프로필을 꾸밉니다.',
  collection: '저장한 표현·스크랩·내 글·영상을 모읍니다.',
  settings: '프로필·계정·약관·로그아웃을 모았습니다.',
  account: '이메일 확인과 로그아웃·탈퇴로 이어집니다.',
  withdraw: '탈퇴 전 안내와 동의를 확인합니다.',
  withdrawConfirm: '비밀번호 확인 후 탈퇴를 진행합니다.',
  withdrawDone: '탈퇴가 완료된 안내 화면입니다.',
  policy: '이용약관·개인정보 안내 본문입니다.',
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function DesignLab() {
  const params = new URLSearchParams(location.search);
  const start = isScreen(params.get('screen')) ? (params.get('screen') as ScreenId) : 'login';
  const [screen, setScreen] = useState<ScreenId>(start);
  const frame = useRef<HTMLIFrameElement>(null);
  const flat = useMemo(() => groups.flatMap(g => g.ids), []);
  const total = flat.length;
  const index = Math.max(0, flat.indexOf(screen === 'policy' ? 'settings' : screen));

  const go = useCallback((next: ScreenId) => {
    setScreen(next);
    const url = new URL(location.href);
    url.searchParams.set('view', 'design');
    url.searchParams.set('screen', next);
    history.replaceState(null, '', url);
  }, []);

  useEffect(() => {
    frame.current?.contentWindow?.postMessage({type: 'sua-go', screen}, location.origin);
  }, [screen]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === 'sua-ready') {
        frame.current?.contentWindow?.postMessage({type: 'sua-go', screen}, location.origin);
      }
      if (e.data?.type === 'sua-nav' && isScreen(e.data.screen)) go(e.data.screen);
    };
    addEventListener('message', onMessage);
    return () => removeEventListener('message', onMessage);
  }, [go, screen]);

  const appSrc = `/?view=app&system=astryx&color=forest&screen=${encodeURIComponent(screen)}`;
  const title = names[screen] || screen;
  const scope = scopes[screen] || '실제 앱 화면을 프로토타입 프레임에서 살펴봅니다.';

  return (
    <div className="design-lab">
      <header className="dl-top">
        <div>
          <strong>디자인 프로토타입</strong>
          <small>수어역 · 실제 앱</small>
        </div>
        <span className="dl-pill">클릭해서 둘러보세요</span>
        <label className="dl-jump">
          <span className="dl-sr">화면 바로가기</span>
          <select
            aria-label="화면 바로가기"
            value={screen === 'policy' ? 'settings' : screen}
            onChange={e => go(e.target.value as ScreenId)}
          >
            {flat.map((id, i) => (
              <option key={id} value={id}>{pad(i + 1)} · {names[id]}</option>
            ))}
          </select>
        </label>
      </header>

      <div className="dl-workspace">
        <aside className="dl-rail dl-left" aria-label="화면 목록">
          <div className="dl-eyebrow">DESIGN PREVIEW</div>
          <h1>수어역<span>APP</span></h1>
          <p>실제 앱 화면을 선택해 둘러보세요.</p>
          <div className="dl-groups">
            {groups.map(group => (
              <div className="dl-group" key={group.title}>
                <strong>{group.title}</strong>
                {group.ids.map(id => {
                  const n = flat.indexOf(id) + 1;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={screen === id ? 'active' : undefined}
                      aria-current={screen === id ? 'page' : undefined}
                      onClick={() => go(id)}
                    >
                      {names[id]}
                      <span>{pad(n)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        <div className="dl-phone" aria-label="모바일 시안">
          <div className="dl-status" aria-hidden="true">
            <time dateTime="09:41">9:41</time>
            <span className="dl-island"><i/></span>
            <span className="dl-status-icons">····</span>
          </div>
          <iframe
            ref={frame}
            title={`${title} 모바일 시안`}
            allow="camera"
            src={appSrc}
            onLoad={() => frame.current?.contentWindow?.postMessage({type: 'sua-go', screen}, location.origin)}
          />
        </div>

        <aside className="dl-rail dl-right" aria-label="프로토타입 안내">
          <div className="dl-note">
            <div className="dl-eyebrow">PROTOTYPE SCOPE</div>
            <div className="dl-number">{total} <span>screens</span></div>
            <p>실제 앱 · {pad(index + 1)} / {pad(total)}</p>
            <div className="dl-line"/>
            <h3>{title}</h3>
            <p>{scope}</p>
            <div className="dl-route"><i/><span>sueoyeok.vercel.app 앱 화면</span></div>
          </div>
          <div className="dl-note">
            <h3>프리뷰 이용 안내</h3>
            <p>이 화면은 배포된 실제 앱을 폰 프레임에 담아 보여 줍니다.</p>
            <p>작성한 내용과 저장한 표현은 이 브라우저에만 남습니다.</p>
            <p>카메라·로그인 등 일부 기능은 시연용으로 제한될 수 있어요.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
