'use client'

// A ponte entre as telas do kit de atendimento e o design system do Atrupe.
// As telas (deste diretório) usam só estes componentes, com as mesmas props
// do modelo do kit (atrupe-back/atendimento/modelos/react/primitives.tsx).

import { useId, type ReactNode } from 'react'

import { Alert as UiAlert } from '@/components/ui/alert'
import { Button as UiButton } from '@/components/ui/button'
import {
  Card as UiCard,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Text as UiText } from '@/components/ui/typography'
import { cn } from '@/lib/utils'

export function Stack({
  children,
  gap = 16,
  direction = 'column',
}: {
  children: ReactNode
  gap?: number
  direction?: 'row' | 'column'
}) {
  return (
    <div
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row flex-wrap items-center' : 'flex-col',
      )}
      style={{ gap }}
    >
      {children}
    </div>
  )
}

export function Card({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <UiCard>
      {title ? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent className={cn('px-6 pb-6', !title && 'pt-6')}>
        {children}
      </CardContent>
    </UiCard>
  )
}

export function Text({
  children,
  tone = 'normal',
}: {
  children: ReactNode
  tone?: 'normal' | 'muted' | 'danger'
}) {
  return (
    <UiText
      variant={tone === 'muted' ? 'helper' : 'body'}
      className={cn(tone === 'danger' && 'text-error-600')}
    >
      {children}
    </UiText>
  )
}

const BUTTON_VARIANT = {
  primary: 'default',
  secondary: 'neutralOutline',
  danger: 'errorOutline',
} as const

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <UiButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      variant={BUTTON_VARIANT[variant]}
    >
      {children}
    </UiButton>
  )
}

function FieldMessage({ hint, error }: { hint?: string; error?: string }) {
  if (error) return <Text tone="danger">{error}</Text>
  if (hint) return <Text tone="muted">{hint}</Text>
  return null
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  secret,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  error?: string
  secret?: boolean
  placeholder?: string
}) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={secret ? 'password' : 'text'}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn(error && 'border-error-300')}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldMessage hint={hint} error={error} />
    </div>
  )
}

export function TextArea({
  label,
  value,
  onChange,
  hint,
  error,
  rows = 4,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  hint?: string
  error?: string
  rows?: number
}) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        aria-invalid={Boolean(error)}
        className={cn(error && 'border-error-300')}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldMessage hint={hint} error={error} />
    </div>
  )
}

export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: Array<{ value: T; label: string; hint?: string }>
  onChange: (value: T) => void
}) {
  const id = useId()
  return (
    <fieldset className="grid gap-3">
      <legend className="type-label mb-2">{label}</legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => onChange(next as T)}
        className="gap-3"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-start gap-3">
            <RadioGroupItem
              id={`${id}-${option.value}`}
              value={option.value}
              className="mt-0.5"
            />
            <label
              htmlFor={`${id}-${option.value}`}
              className="grid cursor-pointer gap-0.5"
            >
              <span className="type-body-strong">{option.label}</span>
              {option.hint ? <Text tone="muted">{option.hint}</Text> : null}
            </label>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  hint?: string
}) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="grid cursor-pointer gap-0.5">
        <span className="type-body">{label}</span>
        {hint ? <Text tone="muted">{hint}</Text> : null}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

const ALERT_CLASS = {
  info: undefined,
  warning: undefined,
  danger: undefined,
  success: 'border-success-200 bg-success-50 text-success-800',
} as const

export function Alert({
  children,
  tone = 'info',
}: {
  children: ReactNode
  tone?: 'info' | 'warning' | 'danger' | 'success'
}) {
  return (
    <UiAlert
      variant={
        tone === 'danger' ? 'error' : tone === 'warning' ? 'warning' : 'default'
      }
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('type-body', ALERT_CLASS[tone])}
    >
      {children}
    </UiAlert>
  )
}

export function Loading({ label = 'Carregando' }: { label?: string }) {
  return (
    <div className="flex items-center text-gray-500" role="status">
      <Spinner />
      <span className="type-secondary">{label}...</span>
    </div>
  )
}
