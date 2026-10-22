import './brand.css';

/** A route arriving at the final stop, framed as a station nameplate. */
export function BrandMark({size=28}:{size?:number}) {
  return <span className="sua-brand-mark" style={{width:size,height:size}} aria-hidden="true"/>;
}

export function BrandLogo({compact=false}:{compact?:boolean}) {
  return <span className={`sua-brand-logo${compact?' sua-brand-logo-compact':''}`}>
    <BrandMark size={compact?24:30}/><span>수어역</span>
  </span>;
}
