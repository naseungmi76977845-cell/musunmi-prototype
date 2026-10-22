import {useId, type CSSProperties, type ReactNode} from 'react';
import {ActionButton, Checkbox, Chip, TextField} from '@seed-design/react';
import type {ButtonProps, CheckProps, ColorName, FieldProps, Kit} from '../contracts';
import {palettes} from '../contracts';
import '@seed-design/css/all.css';
import './seed.css';

const buttonVariants = {
  primary: 'brandSolid',
  secondary: 'neutralWeak',
  ghost: 'ghost',
  danger: 'criticalSolid',
} as const;

function Button({children, onClick, disabled, kind = 'primary', type = 'button', className}: ButtonProps) {
  return <ActionButton
    className={['seed-kit-button', className].filter(Boolean).join(' ')}
    data-kind={kind}
    variant={buttonVariants[kind]}
    color={kind === 'ghost' ? 'fg.brand' : undefined}
    size="large"
    type={type}
    disabled={disabled}
    onClick={onClick}
  >{children}</ActionButton>;
}

function Field({label, value, onChange, type, placeholder, error, autoComplete, maxLength, multiline}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;

  return <div className="seed-kit-field">
    <label className="seed-kit-field-label" htmlFor={id}>{label}</label>
    <TextField.Root
      className={`seed-kit-field-control${multiline ? ' seed-kit-field-control-multiline' : ''}`}
      size="large"
      variant="outline"
      value={value}
      onValueChange={onChange}
      invalid={Boolean(error)}
    >
      {multiline
        ? <TextField.Textarea
            id={id}
            className="seed-kit-textarea"
            aria-label={label}
            aria-describedby={describedBy}
            placeholder={placeholder}
            maxLength={maxLength}
          />
        : <TextField.Input
            id={id}
            className="seed-kit-input"
            aria-label={label}
            aria-describedby={describedBy}
            type={type ?? 'text'}
            autoComplete={autoComplete}
            placeholder={placeholder}
            maxLength={maxLength}
          />}
    </TextField.Root>
    {error && <p className="seed-kit-field-error" id={errorId} role="alert">{error}</p>}
  </div>;
}

const checkmark: ReactNode = <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
  <path d="m3.2 8.2 3.1 3.1 6.5-6.6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
</svg>;

function Check({label, checked, onChange, description}: CheckProps) {
  const descriptionId = useId();
  return <Checkbox.Root
    className="seed-kit-check"
    size="large"
    weight="regular"
    checked={checked}
    onCheckedChange={onChange}
  >
    <Checkbox.HiddenInput
      aria-label={label}
      aria-describedby={description ? descriptionId : undefined}
    />
    <Checkbox.Control>
      <Checkbox.Indicator checked={checkmark} />
    </Checkbox.Control>
    <span className="seed-kit-check-copy">
      <Checkbox.Label>{label}</Checkbox.Label>
      {description && <span className="seed-kit-check-description" id={descriptionId}>{description}</span>}
    </span>
  </Checkbox.Root>;
}

function Provider({color, children}: {color: ColorName; children: ReactNode}) {
  const palette = palettes[color];
  const theme = {
    '--seed-color-fg-brand': palette.brand,
    '--seed-color-fg-brand-contrast': palette.hover,
    '--seed-color-bg-brand-solid': palette.brand,
    '--seed-color-bg-brand-solid-pressed': palette.hover,
    '--seed-color-bg-brand-weak': palette.soft,
    '--seed-color-bg-brand-weak-pressed': palette.accent,
    '--seed-color-stroke-brand-solid': palette.brand,
    '--seed-color-stroke-brand-weak': `color-mix(in srgb, ${palette.brand} 38%, white)`,
    '--seed-color-stroke-focus-ring': palette.brand,
    '--seed-color-fg-placeholder': 'var(--seed-color-palette-gray-800)',
  } as CSSProperties;

  return <div className="seed-kit-root" data-seed="" data-seed-color-mode="light-only" style={theme}>
    {children}
  </div>;
}

function SeedChip({children, selected = false, onClick}: {children: ReactNode; selected?: boolean; onClick: () => void}) {
  return <Chip.Toggle
    className="seed-kit-chip"
    checked={selected}
    onCheckedChange={() => onClick()}
    variant="solid"
    size="large"
    layout="withText"
  >
    <Chip.Label>{children}</Chip.Label>
    <Checkbox.HiddenInput />
  </Chip.Toggle>;
}

export const kit: Kit = {Provider, Button, Field, Check, Chip: SeedChip};
