import './brand.css';
import appIcon from './assets/app-icon.png';

/** 수어역 앱 아이콘(역명판·구구). */
export function BrandMark({size = 28}: {size?: number}) {
  return (
    <img
      className="sua-brand-mark"
      src={appIcon}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      decoding="async"
      draggable={false}
      style={{width: size, height: size}}
    />
  );
}

export function BrandLogo({compact = false}: {compact?: boolean}) {
  return (
    <span className={`sua-brand-logo${compact ? ' sua-brand-logo-compact' : ''}`}>
      <BrandMark size={compact ? 24 : 30} />
      <span>수어역</span>
    </span>
  );
}
