import type {ReactNode} from 'react';
export type SystemName='seed'|'astryx';
export type ColorName='deep'|'medium'|'fresh';

export const THEME_STORAGE_KEY='sua-theme';

export const palettes={
  deep:{
    name:'딥그린',
    short:'딥그린',
    brand:'#2F6A4C',
    bg:'#F6F5F2',
    soft:'#E8F0EB',
    surface:'#E8F0EB',
    accent:'#8FB39C',
    hover:'#275A40',
    ink:'#1A2420',
    muted:'#5E6B64',
  },
  medium:{
    name:'미디엄그린',
    short:'미디엄그린',
    brand:'#3A7D55',
    bg:'#F7F6F3',
    soft:'#E9F2EC',
    surface:'#E9F2EC',
    accent:'#9CC7AE',
    hover:'#316B48',
    ink:'#1A2420',
    muted:'#5E6B64',
  },
  fresh:{
    name:'프레시그린',
    short:'프레시그린',
    brand:'#0F9F63',
    bg:'#F8F8F5',
    soft:'#E6F7EE',
    surface:'#E6F7EE',
    accent:'#7EC9A0',
    hover:'#0D8553',
    ink:'#15231C',
    muted:'#5A6B62',
  },
} as const;

const legacyMap: Record<string, ColorName>={
  forest:'deep',
  sage:'deep',
  coral:'medium',
  blue:'medium',
  violet:'medium',
};

export function isColorName(value:string|null|undefined):value is ColorName{
  return value==='deep'||value==='medium'||value==='fresh';
}

export function resolveColor(params:URLSearchParams=new URLSearchParams(location.search)):ColorName{
  const raw=params.get('theme')||params.get('color');
  if(isColorName(raw))return raw;
  if(raw&&raw in legacyMap)return legacyMap[raw];
  try{
    const stored=localStorage.getItem(THEME_STORAGE_KEY);
    if(isColorName(stored))return stored;
  }catch{/* ignore */}
  return 'deep';
}

export function rememberColor(color:ColorName){
  try{localStorage.setItem(THEME_STORAGE_KEY,color)}catch{/* ignore */}
}

export function paletteVars(color:ColorName){
  const p=palettes[color];
  return {
    '--brand':p.brand,
    '--soft':p.soft,
    '--surface':p.surface,
    '--accent':p.accent,
    '--brand-hover':p.hover,
    '--bg':p.bg,
    '--ink':p.ink,
    '--muted':p.muted,
  };
}

export type ButtonProps={children:ReactNode;onClick?:()=>void;disabled?:boolean;kind?:'primary'|'secondary'|'ghost'|'danger';type?:'button'|'submit';className?:string};
export type FieldProps={label:string;value:string;onChange:(value:string)=>void;type?:string;placeholder?:string;error?:string;autoComplete?:string;maxLength?:number;multiline?:boolean};
export type CheckProps={label:string;checked:boolean;onChange:(value:boolean)=>void;description?:string};
export type ChipProps={children:ReactNode;selected?:boolean;onClick:()=>void};
export type Kit={Provider:(p:{color:ColorName;children:ReactNode})=>ReactNode;Button:(p:ButtonProps)=>ReactNode;Field:(p:FieldProps)=>ReactNode;Check:(p:CheckProps)=>ReactNode;Chip:(p:ChipProps)=>ReactNode};
