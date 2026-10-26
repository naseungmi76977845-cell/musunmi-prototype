import './gugu.css';

/** Official Gugu mascot — face and proportions stay as provided; attendant props are UI-only overlays. */
export function Gugu({
  size = 88,
  attendant = false,
  className = '',
}:{
  size?: number;
  attendant?: boolean;
  className?: string;
}) {
  return <span className={`gugu${attendant ? ' gugu-attendant' : ''}${className ? ` ${className}` : ''}`} style={{width: size, height: size * 1.12}}>
    <img src="/brand/sueoyeok/gugu.jpg" alt="" width={size} height={Math.round(size * 1.12)} decoding="async"/>
    {attendant && <>
      <span className="gugu-hat" aria-hidden="true"/>
      <span className="gugu-badge" aria-hidden="true">S00</span>
    </>}
  </span>;
}
