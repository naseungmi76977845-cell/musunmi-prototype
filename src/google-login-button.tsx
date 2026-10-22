import './google-login-button.css';

export function GoogleLoginButton({onClick}: {onClick: () => void}) {
  return <button type="button" className="google-login-button" onClick={onClick}>
    <img src="/brand/google/g-logo.png" width="20" height="20" alt="" aria-hidden="true" />
    <span>Google로 로그인</span>
  </button>;
}
