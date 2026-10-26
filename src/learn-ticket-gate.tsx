import {useEffect, useRef, useState} from 'react';
import {Ticket, X} from 'lucide-react';
import type {Kit} from './contracts';
import './learn-ticket-gate.css';

type Phase = 'ask' | 'tear' | 'empty';

export function LearnTicketGate({
  kit,
  stationTitle,
  stationHint,
  available,
  onCancel,
  onConfirm,
}:{
  kit: Kit;
  stationTitle: string;
  stationHint: string;
  available: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const {Button} = kit;
  const [phase, setPhase] = useState<Phase>(available ? 'ask' : 'empty');
  const finish = useRef(onConfirm);
  finish.current = onConfirm;

  useEffect(() => {
    if (phase !== 'tear') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = window.setTimeout(() => finish.current(), reduced ? 0 : 980);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && phase !== 'tear') onCancel();
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [onCancel, phase]);

  return <div className="learn-ticket-gate" role="dialog" aria-modal="true" aria-labelledby="learn-ticket-title">
    <button type="button" className="learn-ticket-dismiss" aria-label="닫기" disabled={phase === 'tear'} onClick={onCancel}><X size={20}/></button>
    <div className="learn-ticket-card">
      {phase === 'empty' ? <>
        <span className="learn-ticket-kicker"><Ticket size={16} aria-hidden="true"/>오늘의 티켓</span>
        <h2 id="learn-ticket-title">오늘의 티켓을 이미 썼어요</h2>
        <p>하루에 하나씩 생겨요. 내일 다시 타고 갈 수 있어요.</p>
        <div className="learn-ticket-actions">
          <Button kind="secondary" onClick={onCancel}>돌아가기</Button>
        </div>
      </> : <>
        <span className="learn-ticket-kicker"><Ticket size={16} aria-hidden="true"/>일상선 탑승권</span>
        <h2 id="learn-ticket-title">{phase === 'tear' ? '티켓을 끊었어요' : '하루에 하나씩 생기는 티켓을 사용할까요?'}</h2>
        <p>{phase === 'tear' ? `${stationTitle}으로 들어갑니다.` : `다음 역 · ${stationTitle} (${stationHint})`}</p>

        <div className={`learn-ticket-pass${phase === 'tear' ? ' is-tearing' : ''}`} aria-hidden="true">
          <div className="learn-ticket-half learn-ticket-stub">
            <span className="learn-ticket-line">1</span>
            <b>일상선</b>
            <small>DAILY PASS</small>
          </div>
          <div className="learn-ticket-perforation"/>
          <div className="learn-ticket-half learn-ticket-body">
            <small>다음 역</small>
            <strong>{stationTitle}</strong>
            <em>{stationHint}</em>
          </div>
        </div>

        {phase === 'ask' && <div className="learn-ticket-actions">
          <Button onClick={() => setPhase('tear')}>티켓 사용하기</Button>
          <Button kind="secondary" onClick={onCancel}>나중에</Button>
        </div>}
        {phase === 'tear' && <p className="learn-ticket-status" role="status">학습으로 들어가는 중</p>}
      </>}
    </div>
  </div>;
}
