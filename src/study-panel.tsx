import {BookOpen, ChevronRight, Heart, MapPin, Sunrise, TrainFront, Users, type LucideIcon} from 'lucide-react';
import type {Kit} from './contracts';
import './study-panel.css';

type StudyWord={id:string;title:string;category:string;hint:string};

const topicIcons:Record<string,LucideIcon>={일상:Sunrise,마음:Heart,사람:Users,장소:MapPin};

const stops=[
  {id:'hello',title:'첫인사역',hint:'안녕하세요'},
  {id:'thanks',title:'고마움역',hint:'감사합니다'},
  {id:'friend',title:'친구역',hint:'친구'},
  {id:'school',title:'학교역',hint:'학교'},
  {id:'meet',title:'반가움역',hint:'반갑습니다'},
  {id:'family',title:'가족역',hint:'가족'},
  {id:'happy',title:'기쁨역',hint:'기쁘다'},
  {id:'again',title:'다시역',hint:'다시'},
  {id:'yes',title:'대답역',hint:'네'},
  {id:'no',title:'거절역',hint:'아니요'},
  {id:'sorry',title:'미안역',hint:'미안합니다'},
  {id:'love',title:'사랑역',hint:'사랑합니다'},
  {id:'home',title:'집역',hint:'집'},
  {id:'work',title:'회사역',hint:'회사'},
  {id:'meal',title:'식사역',hint:'밥'},
  {id:'water',title:'물역',hint:'물'},
  {id:'today',title:'오늘역',hint:'오늘'},
  {id:'tomorrow',title:'내일역',hint:'내일'},
  {id:'goodbye',title:'배웅역',hint:'안녕히 가세요'},
  {id:'help',title:'부탁역',hint:'도와주세요'},
];
const stationPositions=stops.map((stop,i)=>({...stop,x:[58,58,130,130,202,202,130,130][i%8],y:52+i*98}));
const terminal=stationPositions[stationPositions.length-1];
const mapHeight=terminal.y+160;
const trackPath=stationPositions.reduce((path,station,i)=>{
  if(i===0)return `M${station.x} 20 V${station.y}`;
  const previous=stationPositions[i-1];
  return path+(station.x===previous.x?` V${station.y}`:` L${station.x} ${previous.y+Math.abs(station.x-previous.x)} V${station.y}`);
},'')+` V${terminal.y+34}`;

export function StudyPanel({words,bookmarks,onSelect}:{kit:Kit;words:StudyWord[];bookmarks:string[];onSelect:(id:string)=>void;onBrowse:(category?:string)=>void}) {
  const savedWords=words.filter(word=>bookmarks.includes(word.id));

  return <div className="study-panel">
    <section className="study-journey" aria-labelledby="study-journey-title">
      <div className="study-line-board"><span className="study-line-number">1</span><div><h1 id="study-journey-title">일상선</h1><span>첫인사역 → {terminal.title}</span></div><TrainFront size={24} aria-hidden="true"/></div>
      <div className="study-transit-map" style={{height:mapHeight}}>
        <svg className="study-transit-tracks" viewBox={`0 0 320 ${mapHeight}`} preserveAspectRatio="none" aria-hidden="true">
          <path className="study-main-track" d={trackPath}/>
          <path className="study-track-cap" d={`M49 20 H67 M${terminal.x-9} ${terminal.y+34} H${terminal.x+9}`}/>
        </svg>
        <ol className="study-stations">
          {stationPositions.map(({id,title,hint,x,y},i)=><li key={id} className={`study-station${i===stationPositions.length-1?' study-station-terminal':''}`} style={{left:`calc(${x/3.2}% - 14px)`,top:y-28}}>
            <button onClick={()=>onSelect(id)} aria-label={`${title} · ${hint} 살펴보기`}>
              <span className="study-station-symbol" aria-hidden="true">{i===0&&<i/>}</span>
              <span className="study-station-copy"><span><b>{title}</b>{i===0&&<em>출발</em>}{i===stationPositions.length-1&&<em>종착</em>}</span><small>{hint}</small></span>
            </button>
          </li>)}
        </ol>
        <div className="study-terminus" style={{top:terminal.y+62}}><span className="study-terminus-art" aria-hidden="true"><TrainFront size={25}/></span><p>일상선 종착역</p></div>
      </div>
    </section>

    {savedWords.length>0&&<section className="study-saved" aria-labelledby="study-saved-title">
        <div className="study-section-heading">
          <h2 id="study-saved-title">저장한 표현 다시 보기</h2>
          <span className="study-saved-count">{savedWords.length}개</span>
        </div>
        <div className="study-saved-list">
          {savedWords.map(word=>{
            const Icon=topicIcons[word.category]||BookOpen;
            return <button key={word.id} className="study-saved-word" onClick={()=>onSelect(word.id)}>
              <span className="study-saved-icon"><Icon size={19} strokeWidth={1.8} aria-hidden="true"/></span>
              <span className="study-saved-copy"><b>{word.title}</b><small>{word.hint}</small></span>
              <ChevronRight size={18} className="study-topic-arrow" aria-hidden="true"/>
            </button>;
          })}
        </div>
    </section>}

  </div>;
}
