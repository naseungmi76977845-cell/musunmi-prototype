import {BrandMark} from './brand';
import './station-nameplate.css';

/** Compact subway-style station nameplate for the home header. */
export function StationNameplate({code = 'S00', name = '수어역', english = 'SUEO STATION'}:{code?: string; name?: string; english?: string}) {
  return <div className="station-nameplate" aria-label={`${name}, ${english}, 역 번호 ${code}`}>
    <span className="station-nameplate-code">{code}</span>
    <div className="station-nameplate-copy">
      <span className="station-nameplate-title"><BrandMark size={22}/><b>{name}</b></span>
      <small>{english}</small>
    </div>
    <span className="station-nameplate-rail" aria-hidden="true"/>
  </div>;
}
