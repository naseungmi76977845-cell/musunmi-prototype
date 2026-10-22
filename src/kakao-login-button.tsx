// Official completed Korean button asset; preserve its symbol and label artwork.
// https://developers.kakao.com/tool/resource/login
export function KakaoLoginButton({onClick}:{onClick:()=>void}) {
  return <button type="button" className="kakao-login-button" aria-label="카카오 로그인" onClick={onClick}>
    <img src="/brand/kakao/login-complete-ko.svg" width="224" height="46" alt="" aria-hidden="true"/>
  </button>;
}
