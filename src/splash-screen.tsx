import {useEffect, useRef, useState} from 'react';
import {BrandMark} from './brand';
import guguSplash from './assets/gugu-splash.jpg';
import './splash-screen.css';

type SplashScreenProps = {
  ready: boolean;
  onDone: () => void;
};

export function SplashScreen({ready, onDone}: SplashScreenProps) {
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);
  const readyRef = useRef(ready);
  const minElapsedRef = useRef(false);
  const onDoneRef = useRef(onDone);
  readyRef.current = ready;
  onDoneRef.current = onDone;

  useEffect(() => {
    const minTimer = window.setTimeout(() => {
      minElapsedRef.current = true;
      tryFinish();
    }, 1800);
    return () => window.clearTimeout(minTimer);
  }, []);

  useEffect(() => {
    tryFinish();
  }, [ready]);

  function tryFinish() {
    if (doneRef.current || !readyRef.current || !minElapsedRef.current) return;
    doneRef.current = true;
    setLeaving(true);
    window.setTimeout(() => onDoneRef.current(), 300);
  }

  return (
    <section
      className={`app-splash${leaving ? ' is-leaving' : ''}`}
      aria-label="수어역 앱 시작 화면"
      aria-busy={!ready || !minElapsedRef.current}
    >
      <div className="app-splash-brand">
        <span className="app-splash-symbol" aria-hidden="true"><BrandMark size={26}/></span>
        <h1>수어역</h1>
        <p className="app-splash-wordmark">SUEO STATION</p>
      </div>

      <div className="app-splash-main">
        <img
          className="app-splash-gugu"
          src={guguSplash}
          width={512}
          height={512}
          alt="역무원 모자를 쓴 구구가 손을 흔들며 환영하는 모습"
          decoding="async"
        />
        <div className="app-splash-welcome">
          <strong>이번 역은, 수어역입니다!</strong>
          <span>수어로 더 가까워지는 세상</span>
        </div>
      </div>

      <div className="app-splash-bottom" aria-hidden="true">
        <span className="app-splash-loading"><i/><i/><i/></span>
      </div>
    </section>
  );
}
