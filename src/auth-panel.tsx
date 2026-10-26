import {useState} from 'react';
import {ArrowRight, Eye, EyeOff, Mail} from 'lucide-react';
import {BrandMark} from './brand';
import {KakaoLoginButton} from './kakao-login-button';
import {GoogleLoginButton} from './google-login-button';
import type {Kit} from './contracts';
import guguLogin from './assets/gugu-splash.jpg';
import './auth-panel.css';

export type AuthPanelProps = {
  mode: 'login' | 'signup';
  kit: Kit;
  email: string;
  password: string;
  errors: Record<string, string>;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onSwitch: () => void;
  onKakao: () => void;
  onGoogle: () => void;
  onRecover: () => void;
  onPendingLogin?: () => void;
};

const progressLabels = {1: '계정 정보', 2: '프로필', 3: '수어 경험', 4: '가입 목적', 5: '약관'} as const;

export function AuthProgress({step}: {step: 1 | 2 | 3 | 4 | 5}) {
  return <div className="auth-panel__progress-wrap">
    <div className="auth-panel__progress-label"><span>{progressLabels[step]}</span><span>{step} / 5</span></div>
    <div className="auth-panel__progress" role="progressbar" aria-label="가입 진행" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step}>
      <span style={{width: `${step / 5 * 100}%`}} />
    </div>
  </div>;
}

function GoogleMark() {
  return <img className="auth-login-btn__google" src="/brand/google/g-logo.png" width={20} height={20} alt="" aria-hidden="true" />;
}

function KakaoMark() {
  return <svg className="auth-login-btn__kakao-mark" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.88 5.33 4.7 6.74-.15.55-.96 3.48-.99 3.7 0 0-.2.54.28.3.48-.24 4.2-2.78 4.86-3.2.7.1 1.42.16 2.15.16 5.52 0 10-3.58 10-8S17.52 3 12 3z"/>
  </svg>;
}

export function AuthPanel({
  mode,
  kit,
  email,
  password,
  errors,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onSwitch,
  onKakao,
  onGoogle,
  onRecover,
  onPendingLogin,
}: AuthPanelProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isLogin = mode === 'login';
  const {Button, Field} = kit;
  const formError = Object.entries(errors).find(([key]) => key !== 'email' && key !== 'password')?.[1];
  const showPending = onPendingLogin ?? (() => undefined);

  if (isLogin) {
    return <div className="auth-login">
      <header className="auth-login__brand">
        <span className="auth-login__symbol" aria-hidden="true"><BrandMark size={26}/></span>
        <h1>수어역</h1>
        <p>SUEO STATION</p>
      </header>

      <div className="auth-login__hero">
        <img
          className="auth-login__gugu"
          src={guguLogin}
          width={512}
          height={512}
          alt="역무원 구구가 수어역 승차권을 건네며 환영하는 모습"
          decoding="async"
        />
        <div className="auth-login__welcome">
          <strong>수어역에 오신 걸 환영해요!</strong>
          <span>수어로 더 가까워지는 세상</span>
        </div>
      </div>

      <div className="auth-login__actions" role="group" aria-label="로그인 방법">
        <button type="button" className="auth-login-btn" onClick={showPending} aria-label="이메일로 로그인, 준비 중">
          <Mail size={18} strokeWidth={1.9} aria-hidden="true" />
          <span className="auth-login-btn__copy">
            <b>이메일로 로그인</b>
            <small>준비 중</small>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button type="button" className="auth-login-btn auth-login-btn--kakao" onClick={onKakao} aria-label="카카오로 로그인, 준비 중">
          <KakaoMark />
          <span className="auth-login-btn__copy">
            <b>카카오로 로그인</b>
            <small>준비 중</small>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button type="button" className="auth-login-btn" onClick={onGoogle} aria-label="구글로 로그인, 준비 중">
          <GoogleMark />
          <span className="auth-login-btn__copy">
            <b>구글로 로그인</b>
            <small>준비 중</small>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>

      <p className="auth-login__signup">
        <span>처음 오셨나요?</span>
        <button type="button" onClick={onSwitch}>회원가입</button>
      </p>
    </div>;
  }

  return <form
    className={`auth-panel auth-panel--${mode}`}
    onSubmit={event => {
      event.preventDefault();
      onSubmit();
    }}
  >
    <AuthProgress step={1} />

    <h1 className="auth-panel__title">회원가입</h1>

    <div className="auth-panel__social">
      <div className="auth-panel__providers">
        <KakaoLoginButton onClick={onKakao} />
        <GoogleLoginButton onClick={onGoogle} />
      </div>
      <div className="auth-panel__divider"><span>또는 이메일로 가입</span></div>
    </div>

    <div className="auth-panel__fields">
      <Field
        label="이메일"
        type="email"
        value={email}
        onChange={onEmailChange}
        placeholder="이메일 주소"
        autoComplete="email"
        error={errors.email}
      />
      <div className="auth-panel__password">
        <Field
          label="비밀번호"
          type={passwordVisible ? 'text' : 'password'}
          value={password}
          onChange={onPasswordChange}
          placeholder="8자 이상"
          autoComplete="new-password"
          error={errors.password}
        />
        <button
          className="auth-panel__password-toggle"
          type="button"
          aria-label={passwordVisible ? '비밀번호 숨기기' : '비밀번호 표시'}
          aria-pressed={passwordVisible}
          onClick={() => setPasswordVisible(visible => !visible)}
        >
          {passwordVisible ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>
      </div>
    </div>

    {formError && <p className="auth-panel__error" role="alert">{formError}</p>}

    <Button type="submit" disabled={!email.trim() || !password}>
      계속
    </Button>

    <p className="auth-panel__switch">
      <span>이미 계정이 있으신가요?</span>
      <button type="button" onClick={onSwitch}>로그인</button>
    </p>
  </form>;
}
