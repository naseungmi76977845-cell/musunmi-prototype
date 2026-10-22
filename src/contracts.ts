import type {ReactNode} from 'react';
export type SystemName='seed'|'astryx';
export type ColorName='forest'|'sage'|'coral'|'blue'|'violet';
export const palettes={forest:{name:'그린·라임',brand:'#287344',soft:'#EEF7E9',accent:'#DAEF99',hover:'#205F37'},sage:{name:'그린·라임 소프트',brand:'#506B55',soft:'#F2F5EE',accent:'#DDE5C7',hover:'#405645'},blue:{name:'블루·스카이',brand:'#255FC7',soft:'#EDF3FF',accent:'#B9E5FF',hover:'#1F4FA5'},violet:{name:'인디고·코랄',brand:'#5146B5',soft:'#F1EFFE',accent:'#FFC1AB',hover:'#413891'},coral:{name:'오렌지·크림',brand:'#BA4C20',soft:'#FFF4E9',accent:'#FFE0A1',hover:'#9C3B16'}} as const;
export type ButtonProps={children:ReactNode;onClick?:()=>void;disabled?:boolean;kind?:'primary'|'secondary'|'ghost'|'danger';type?:'button'|'submit';className?:string};
export type FieldProps={label:string;value:string;onChange:(value:string)=>void;type?:string;placeholder?:string;error?:string;autoComplete?:string;maxLength?:number;multiline?:boolean};
export type CheckProps={label:string;checked:boolean;onChange:(value:boolean)=>void;description?:string};
export type ChipProps={children:ReactNode;selected?:boolean;onClick:()=>void};
export type Kit={Provider:(p:{color:ColorName;children:ReactNode})=>ReactNode;Button:(p:ButtonProps)=>ReactNode;Field:(p:FieldProps)=>ReactNode;Check:(p:CheckProps)=>ReactNode;Chip:(p:ChipProps)=>ReactNode};
