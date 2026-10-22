import {useState} from 'react';
import {Eye, EyeOff} from 'lucide-react';
import {KakaoLoginButton} from './kakao-login-button';
import {GoogleLoginButton} from './google-login-button';
import type {Kit} from './contracts';
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
}: AuthPanelProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isLogin = mode === 'login';
  const {Button, Field} = kit;
  const formError = Object.entries(errors).find(([key]) => key !== 'email' && key !== 'password')?.[1];

  return <form
    className={`auth-panel auth-panel--${mode}`}
    onSubmit={event => {
      event.preventDefault();
      onSubmit();
    }}
  >
    {!isLogin && <AuthProgress step={1} />}

    <h1 className="auth-panel__title">{isLogin ? '로그인' : '회원가입'}</h1>

    <div className="auth-panel__social">
      <div className="auth-panel__providers">
        <KakaoLoginButton onClick={onKakao} />
        <GoogleLoginButton onClick={onGoogle} />
      </div>
      <div className="auth-panel__divider"><span>또는 이메일로 {isLogin ? '로그인' : '가입'}</span></div>
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
          placeholder={isLogin ? '비밀번호 입력' : '8자 이상'}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
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

    {isLogin && <button className="auth-panel__recover" type="button" onClick={onRecover}>비밀번호를 잊으셨나요?</button>}

    <Button type="submit" disabled={!email.trim() || !password}>
      {isLogin ? '로그인' : '계속'}
    </Button>

    <p className="auth-panel__switch">
      <span>{isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}</span>
      <button type="button" onClick={onSwitch}>{isLogin ? '회원가입' : '로그인'}</button>
    </p>
  </form>;
}
