import {ArrowUpRight, Check, Coins, Minus, Plus, Sprout, Star, TrainFront} from 'lucide-react';
import {useEffect, useState} from 'react';
import type {Kit} from './contracts';
import {ProfileAvatar} from './profile-avatar';
import {
  decorations,
  getBalance,
  getDecoration,
  rewardRules,
  type DecorationKind,
  type Equipped,
  type PointsState,
  type RewardKey,
} from './points';
import './points-panel.css';

const rewardCopy: Record<RewardKey, {action: string}> = {
  profile: {action: '프로필 채우기'},
  bookmark: {action: '표현 살펴보기'},
  recording: {action: '수어 기록하기'},
  story: {action: '이야기 쓰기'},
};

const kindLabels: Record<DecorationKind, string> = {
  tone: '색상',
  frame: '테두리',
  badge: '배지',
};

const kindOrder: DecorationKind[] = ['tone', 'frame', 'badge'];

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {month: 'numeric', day: 'numeric'}).format(date);
}

export function PointsPanel({kit, state, onTask}: {kit: Kit; state: PointsState; onTask: (key: RewardKey) => void}) {
  const balance = getBalance(state);

  return <div className="points-panel">
    <section className="points-balance" aria-label="보유 포인트">
      <span className="points-balance-label"><Coins size={17} aria-hidden="true" /> 사용 가능</span>
      <p className="points-balance-value"><strong>{balance}</strong><span>P</span></p>
    </section>

    <section className="points-section" aria-labelledby="points-earn-heading">
      <div className="points-section-heading">
        <h2 id="points-earn-heading">활동으로 모으기</h2>
        <span>한 번씩 받을 수 있어요</span>
      </div>
      <ul className="points-task-list">
        {rewardRules.map(rule => {
          const completed = state.claimed.includes(rule.key);
          const copy = rewardCopy[rule.key];
          return <li className={`points-task${completed ? ' is-complete' : ''}`} key={rule.key}>
            <span className="points-task-mark" aria-hidden="true">
              {completed ? <Check size={17} strokeWidth={2.3} /> : <ArrowUpRight size={17} strokeWidth={1.9} />}
            </span>
            <div className="points-task-copy">
              <strong>{rule.title}</strong>
            </div>
            <div className="points-task-side">
              <b>+{rule.amount} P</b>
              {completed
                ? <span className="points-task-complete">받았어요</span>
                : <button className="points-task-action" type="button" onClick={() => onTask(rule.key)}>{copy.action}</button>}
            </div>
          </li>;
        })}
      </ul>
    </section>

    <section className="points-section points-history" aria-labelledby="points-history-heading">
      <div className="points-section-heading">
        <h2 id="points-history-heading">최근 내역</h2>
        {state.transactions.length > 0 && <span>{state.transactions.length}건</span>}
      </div>
      {state.transactions.length > 0
        ? <ul className="points-history-list">
            {state.transactions.map(transaction => {
              const earned = transaction.amount >= 0;
              const AmountIcon = earned ? Plus : Minus;
              return <li className="points-history-row" key={transaction.id}>
                <span className={`points-history-mark${earned ? ' is-earned' : ' is-spent'}`} aria-hidden="true"><AmountIcon size={16} /></span>
                <span className="points-history-copy"><strong>{transaction.title}</strong><small>{formatDate(transaction.at)}</small></span>
                <b className={earned ? 'points-history-amount is-earned' : 'points-history-amount is-spent'}>
                  {earned ? '+' : '−'}{Math.abs(transaction.amount)} P
                </b>
              </li>;
            })}
          </ul>
        : <p className="points-history-empty">아직 포인트 내역이 없어요.</p>}
    </section>
  </div>;
}

export function WardrobePanel({kit, state, nickname, onRedeem}: {
  kit: Kit;
  state: PointsState;
  nickname: string;
  onRedeem: (id: string) => void;
}) {
  const [kind, setKind] = useState<DecorationKind>('tone');
  const [selection, setSelection] = useState<Equipped>(() => ({...state.equipped}));
  const balance = getBalance(state);
  const {Button, Chip} = kit;

  useEffect(() => setSelection(previous => ({...previous, tone: state.equipped.tone})), [state.equipped.tone]);
  useEffect(() => setSelection(previous => ({...previous, frame: state.equipped.frame})), [state.equipped.frame]);
  useEffect(() => setSelection(previous => ({...previous, badge: state.equipped.badge})), [state.equipped.badge]);

  const items = decorations.filter(item => item.kind === kind);
  const selectedId = selection[kind];
  const selectedItem = getDecoration(selectedId);
  const canAfford = selectedItem ? balance >= selectedItem.cost : false;
  const isOwned = selectedItem ? state.owned.includes(selectedItem.id) : false;
  const isEquipped = selectedItem ? state.equipped[kind] === selectedItem.id : false;
  const previewEquipped = {...state.equipped, [kind]: selectedId};
  const missingPoints = selectedItem ? Math.max(0, selectedItem.cost - balance) : 0;
  const buttonLabel = isEquipped
    ? '적용 중'
    : isOwned
      ? '적용하기'
      : `${selectedItem?.cost ?? 0} P로 구매하고 적용`;

  return <div className="points-panel points-wardrobe">
    <section className="wardrobe-preview" aria-label="프로필 꾸미기 미리보기">
      <span className="wardrobe-preview-label">미리 보기</span>
      <div className="wardrobe-preview-identity">
        <ProfileAvatar nickname={nickname} equipped={previewEquipped} />
        <div><strong>{nickname.trim() || '내 프로필'}</strong></div>
      </div>
    </section>

    <div className="wardrobe-balance"><span>사용 가능</span><strong>{balance} P</strong></div>

    <section className="points-section" aria-labelledby="wardrobe-items-heading">
      <div className="points-section-heading">
        <h2 id="wardrobe-items-heading">프로필 꾸미기</h2>
      </div>
      <div className="wardrobe-tabs" aria-label="꾸미기 종류">
        {kindOrder.map(itemKind => <Chip key={itemKind} selected={kind === itemKind} onClick={() => setKind(itemKind)}>{kindLabels[itemKind]}</Chip>)}
      </div>
      <div className="wardrobe-grid" role="group" aria-label={`${kindLabels[kind]} 선택`}>
        {items.map(item => {
          const owned = state.owned.includes(item.id);
          const equipped = state.equipped[kind] === item.id;
          const selected = selectedId === item.id;
          const BadgeIcon = item.icon === 'sprout' ? Sprout : item.icon === 'star' ? Star : item.icon === 'station' ? TrainFront : null;
          return <button
            className={`wardrobe-item${selected ? ' is-selected' : ''}`}
            type="button"
            key={item.id}
            aria-pressed={selected}
            onClick={() => setSelection(previous => ({...previous, [kind]: item.id}))}
          >
            <span className={`wardrobe-item-art wardrobe-art-${item.kind}`}>
              {item.kind === 'tone'
                ? <span className="wardrobe-tone-swatch" style={{backgroundColor: item.background ?? 'var(--soft)', color: item.foreground ?? 'var(--brand)'}}>{Array.from(nickname.trim())[0] || '나'}</span>
                : item.kind === 'frame'
                  ? <span className={`wardrobe-frame-swatch${item.style === 'ring' ? ' profile-avatar-ring' : item.style === 'dashed' ? ' profile-avatar-dashed' : ''}`}><span>{Array.from(nickname.trim())[0] || '나'}</span></span>
                  : <span className="wardrobe-badge-swatch">{BadgeIcon ? <BadgeIcon size={18} strokeWidth={2} /> : '·'}</span>}
            </span>
            <strong>{item.name}</strong>
            <span className={`wardrobe-item-status${equipped ? ' is-applied' : ''}`}>
              {equipped ? '적용 중' : owned ? '보유 중' : item.cost === 0 ? '무료' : `${item.cost} P`}
            </span>
          </button>;
        })}
      </div>
    </section>

    <div className="bottom-action wardrobe-action">
      <Button disabled={isEquipped || (!isOwned && !canAfford)} onClick={() => selectedItem && onRedeem(selectedItem.id)}>{buttonLabel}</Button>
      {!isEquipped && !isOwned && missingPoints > 0 && <p className="wardrobe-shortfall">{missingPoints} P가 더 필요해요</p>}
    </div>
  </div>;
}
