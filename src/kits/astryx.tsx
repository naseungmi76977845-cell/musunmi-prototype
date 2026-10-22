import {Children, isValidElement, type ReactNode} from 'react';
import {Button as AstryxButton} from '@astryxdesign/core/Button';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TextArea} from '@astryxdesign/core/TextArea';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {palettes, type ButtonProps, type ColorName, type FieldProps, type Kit} from '../contracts';
import './astryx.css';

const koreanSansFallbacks = 'Pretendard, "Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

const themes = Object.fromEntries(Object.entries(palettes).map(([name, palette]) => [name, defineTheme({
  name: `sueoyeok-${name}`,
  extends: neutralTheme,
  color: {accent: palette.brand},
  typography: {
    body: {family: 'Figtree', fallbacks: koreanSansFallbacks},
    heading: {family: 'Figtree', fallbacks: koreanSansFallbacks},
  },
  tokens: {
    '--size-element-sm': '44px',
    '--size-element-md': '48px',
    '--size-element-lg': '52px',
  },
})])) as Record<ColorName, ReturnType<typeof defineTheme>>;

function labelOf(children: ReactNode): string {
  return Children.toArray(children).map(child => {
    if (typeof child === 'string' || typeof child === 'number') return String(child);
    if (isValidElement<{children?: ReactNode}>(child)) return labelOf(child.props.children);
    return '';
  }).join(' ').trim();
}

const variants = {primary: 'primary', secondary: 'secondary', ghost: 'ghost', danger: 'destructive'} as const;
function Button({children, onClick, disabled, kind = 'primary', type = 'button', className}: ButtonProps) {
  return <AstryxButton label={labelOf(children)||'실행'} variant={variants[kind]} size="md"
    width="100%" type={type} isDisabled={disabled} onClick={onClick} data-kind={kind}
    className={['astryx-button', className].filter(Boolean).join(' ')}>{children}</AstryxButton>;
}

function Field({label, value, onChange, type, placeholder, error, autoComplete, maxLength, multiline}: FieldProps) {
  const status = error ? {type: 'error' as const, message: error} : undefined;
  // TextArea's maxLength displays a counter; the controlled adapter also enforces
  // the shared field limit so switching kits does not change form behaviour.
  const change = (next: string) => onChange(maxLength === undefined ? next : next.slice(0, maxLength));
  return <div className="astryx-field">
    {multiline
      ? <TextArea label={label} value={value} onChange={change} placeholder={placeholder}
          maxLength={maxLength} status={status} statusVariant="detached" rows={4} width="100%" />
      : <TextInput label={label} value={value} onChange={change} placeholder={placeholder}
          type={type === 'email' || type === 'password' ? type : 'text'}
          autoComplete={autoComplete}
          status={status} statusVariant="detached" size="lg" width="100%" />}
  </div>;
}

export const kit: Kit = {
  Provider: ({color, children}) => <Theme theme={themes[color]} mode="light"><div className="kit-astryx">{children}</div></Theme>,
  Button,
  Field,
  Check: ({label, checked, onChange, description}) => <div className="astryx-check"><CheckboxInput
    label={label} value={checked} onChange={onChange} description={description} size="md" width="100%" /></div>,
  Chip: ({children, selected = false, onClick}) => <AstryxButton
    label={labelOf(children)||'실행'} variant={selected ? 'primary' : 'secondary'} size="sm"
    onClick={onClick} aria-pressed={selected} className="astryx-chip">{children}</AstryxButton>,
};
