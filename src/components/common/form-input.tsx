'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
   Design Tokens (extracted from Figma)
───────────────────────────────────────────────────────────── */

const TOKEN = {
  // Border
  borderDefault: 'border-gray-300',
  borderFocus: 'border-brand-300',
  borderError: 'border-error-300',

  // Shadow
  shadowDefault: '[box-shadow:0px_1px_2px_0_rgba(16,24,40,0.05)]',
  shadowFocus: '[box-shadow:0px_0px_0px_2px_#fff,0px_0px_0px_4px_#475467]',

  // Background
  bgDefault: 'bg-white',
  bgDisabled: 'bg-gray-50',

  // Text
  textLabel: 'text-sm font-medium text-gray-700',
  textPlaceholder: 'text-base text-gray-400',
  textFilled: 'text-base text-gray-900',
  textHint: 'text-sm text-gray-500',
  textError: 'text-sm text-error-500',
  textAddon: 'text-base text-gray-500',

  // Icon strokes
  strokeLeading: '#667085',
  strokeHelp: '#98A2B3',
  strokeError: '#F04438',
} as const

/* ─────────────────────────────────────────────────────────────
   Shared SVG icons
───────────────────────────────────────────────────────────── */

function HelpIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      className="w-4 h-4 flex-shrink-0"
    >
      <path
        d="M6.06 6C6.21673 5.55442 6.5261 5.17872 6.9333 4.9394C7.3405 4.70009 7.81926 4.61261 8.28478 4.69245C8.7503 4.7723 9.17254 5.01433 9.47671 5.37567C9.78089 5.737 9.94737 6.19433 9.94666 6.66665C9.94666 7.99998 7.94666 8.66665 7.94666 8.66665M8 11.3333H8.00666M14.6667 8C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8C1.33333 4.31808 4.3181 1.33331 8 1.33331C11.6819 1.33331 14.6667 4.31808 14.6667 8Z"
        stroke={TOKEN.strokeHelp}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      className="w-4 h-4 flex-shrink-0"
    >
      <path
        d="M8 5.33337V8.00004M8 10.6667H8.00666M14.6667 8.00004C14.6667 11.6819 11.6819 14.6667 8 14.6667C4.3181 14.6667 1.33333 11.6819 1.33333 8.00004C1.33333 4.31814 4.3181 1.33337 8 1.33337C11.6819 1.33337 14.6667 4.31814 14.6667 8.00004Z"
        stroke={TOKEN.strokeError}
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      className="w-5 h-5 flex-shrink-0"
    >
      <path
        d="M18.3333 5C18.3333 4.08331 17.5833 3.33331 16.6667 3.33331H3.33334C2.41667 3.33331 1.66667 4.08331 1.66667 5M18.3333 5V15C18.3333 15.9167 17.5833 16.6667 16.6667 16.6667H3.33334C2.41667 16.6667 1.66667 15.9167 1.66667 15V5M18.3333 5L10 10.8333L1.66667 5"
        stroke={TOKEN.strokeLeading}
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      className="w-5 h-5 flex-shrink-0"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="#667085"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MastercardIcon() {
  return (
    <svg
      width={34}
      height={24}
      viewBox="0 0 34 24"
      fill="none"
      className="w-[34px] h-6 flex-shrink-0"
    >
      <rect x="0.5" y="0.5" width={33} height={23} rx="3.5" fill="white" />
      <rect x="0.5" y="0.5" width={33} height={23} rx="3.5" stroke="#F2F4F7" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.179 16.8294C15.9949 17.8275 14.459 18.43 12.7807 18.43C9.03582 18.43 6 15.4303 6 11.73C6 8.02966 9.03582 5.02997 12.7807 5.02997C14.459 5.02997 15.9949 5.63247 17.179 6.63051C18.363 5.63247 19.8989 5.02997 21.5773 5.02997C25.3221 5.02997 28.358 8.02966 28.358 11.73C28.358 15.4303 25.3221 18.43 21.5773 18.43C19.8989 18.43 18.363 17.8275 17.179 16.8294Z"
        fill="#ED0006"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.179 16.8294C18.6369 15.6005 19.5614 13.7719 19.5614 11.73C19.5614 9.68801 18.6369 7.85941 17.179 6.63051C18.363 5.63247 19.8989 5.02997 21.5772 5.02997C25.3221 5.02997 28.3579 8.02966 28.3579 11.73C28.3579 15.4303 25.3221 18.43 21.5772 18.43C19.8989 18.43 18.363 17.8275 17.179 16.8294Z"
        fill="#F9A000"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.179 16.8294C18.6369 15.6005 19.5614 13.7719 19.5614 11.73C19.5614 9.68805 18.6369 7.85946 17.179 6.63055C15.7211 7.85946 14.7966 9.68805 14.7966 11.73C14.7966 13.7719 15.7211 15.6005 17.179 16.8294Z"
        fill="#FF5E00"
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

export type InputState =
  | 'default'
  | 'filled'
  | 'focused'
  | 'disabled'
  | 'error'
  | 'error-focused'

export type InputVariant =
  | 'text' // plain text, no leading icon
  | 'email' // leading email icon
  | 'phone' // country-code prefix + input
  | 'currency' // R$ prefix (leading addon)
  | 'currency-suffix' // value then R$ suffix (trailing addon)
  | 'website' // http:// text addon prefix
  | 'card' // mastercard logo leading addon
  | 'textarea' // multi-line text area

export interface FormInputProps {
  id?: string
  label?: string
  hint?: string
  placeholder?: string
  value?: string
  variant?: InputVariant
  state?: InputState
  onChange?: (value: string) => void
  className?: string
  /** For phone variant: country code label (default "BR") */
  countryCode?: string
  /** For currency: symbol (default "R$") */
  currencySymbol?: string
  /** For website: prefix (default "http://") */
  urlPrefix?: string
  /** For textarea variant: number of visible rows (default 4) */
  rows?: number
}

/* ─────────────────────────────────────────────────────────────
   Border + shadow utility
───────────────────────────────────────────────────────────── */

function getBorderClass(state: InputState): string {
  switch (state) {
    case 'focused':
      return TOKEN.borderFocus
    case 'error':
      return TOKEN.borderError
    case 'error-focused':
      return TOKEN.borderError
    default:
      return TOKEN.borderDefault
  }
}

function getShadowClass(state: InputState): string {
  switch (state) {
    case 'focused':
    case 'error-focused':
      return TOKEN.shadowFocus
    default:
      return TOKEN.shadowDefault
  }
}

function getBgClass(state: InputState): string {
  return state === 'disabled' ? TOKEN.bgDisabled : TOKEN.bgDefault
}

function getTextClass(state: InputState, hasValue: boolean): string {
  if (state === 'disabled' || !hasValue) return TOKEN.textPlaceholder
  return TOKEN.textFilled
}

function getTrailingIcon(state: InputState) {
  return state === 'error' || state === 'error-focused' ? (
    <AlertIcon />
  ) : (
    <HelpIcon />
  )
}

/* ─────────────────────────────────────────────────────────────
   Sub-components per variant
───────────────────────────────────────────────────────────── */

function TextInput({
  state,
  placeholder,
  value,
  onChange,
  id,
}: {
  state: InputState
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  id?: string
}) {
  const hasValue = !!value
  const isDisabled = state === 'disabled'
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3.5 py-2.5 rounded-lg border overflow-hidden',
        getBgClass(state),
        getBorderClass(state),
        getShadowClass(state),
      )}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2">
        <input
          id={id}
          type="text"
          disabled={isDisabled}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none text-base',
            hasValue
              ? 'text-gray-900'
              : 'text-gray-400 placeholder:text-gray-400',
            isDisabled && 'cursor-not-allowed',
          )}
        />
      </div>
      {getTrailingIcon(state)}
    </div>
  )
}

function EmailInput({
  state,
  placeholder,
  value,
  onChange,
  id,
}: {
  state: InputState
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  id?: string
}) {
  const isDisabled = state === 'disabled'
  const hasValue = !!value
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3.5 py-2.5 rounded-lg border overflow-hidden',
        getBgClass(state),
        getBorderClass(state),
        getShadowClass(state),
      )}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2">
        <EmailIcon />
        <input
          id={id}
          type="email"
          disabled={isDisabled}
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none text-base',
            hasValue
              ? 'text-gray-900'
              : 'text-gray-400 placeholder:text-gray-400',
            isDisabled && 'cursor-not-allowed',
          )}
        />
      </div>
      {getTrailingIcon(state)}
    </div>
  )
}

function PhoneInput({
  state,
  placeholder,
  value,
  onChange,
  countryCode = 'BR',
  id,
}: {
  state: InputState
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  countryCode?: string
  id?: string
}) {
  const isDisabled = state === 'disabled'
  const hasValue = !!value
  return (
    <div
      className={cn(
        'flex items-start rounded-lg border overflow-hidden',
        getBgClass(state),
        getBorderClass(state),
        getShadowClass(state),
      )}
    >
      {/* Country prefix */}
      <button
        type="button"
        disabled={isDisabled}
        className={cn(
          'flex items-center gap-0.5 pl-3.5 pr-3 py-2.5 flex-shrink-0 border-r border-gray-300',
          isDisabled && 'cursor-not-allowed',
        )}
      >
        <span className="text-base text-gray-900">{countryCode}</span>
        <ChevronDownIcon />
      </button>
      {/* Input */}
      <div className="flex items-center flex-1 min-w-0 gap-2 pr-3.5 py-2.5">
        <input
          id={id}
          type="tel"
          disabled={isDisabled}
          placeholder={placeholder ?? '+1 (555) 000-0000'}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none text-base',
            hasValue
              ? 'text-gray-900'
              : 'text-gray-400 placeholder:text-gray-400',
            isDisabled && 'cursor-not-allowed',
          )}
        />
        {getTrailingIcon(state)}
      </div>
    </div>
  )
}

function CurrencyInput({
  state,
  placeholder,
  value,
  onChange,
  currencySymbol = 'R$',
  suffix = false,
  id,
}: {
  state: InputState
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  currencySymbol?: string
  suffix?: boolean
  id?: string
}) {
  const isDisabled = state === 'disabled'
  const hasValue = !!value
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3.5 py-2.5 rounded-lg border overflow-hidden',
        getBgClass(state),
        getBorderClass(state),
        getShadowClass(state),
      )}
    >
      <div className="flex items-start flex-1 min-w-0 gap-2">
        {!suffix && (
          <span
            className={cn(
              'text-base flex-shrink-0',
              isDisabled ? 'text-gray-400' : 'text-gray-500',
            )}
          >
            {currencySymbol}
          </span>
        )}
        <input
          id={id}
          type="text"
          disabled={isDisabled}
          placeholder={placeholder ?? '1,000.00'}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none text-base',
            hasValue
              ? 'text-gray-900'
              : 'text-gray-400 placeholder:text-gray-400',
            isDisabled && 'cursor-not-allowed',
          )}
        />
        {suffix && (
          <span
            className={cn(
              'text-base flex-shrink-0',
              isDisabled ? 'text-gray-400' : 'text-gray-500',
            )}
          >
            {currencySymbol}
          </span>
        )}
      </div>
      {!suffix && getTrailingIcon(state)}
    </div>
  )
}

function WebsiteInput({
  state,
  placeholder,
  value,
  onChange,
  urlPrefix = 'http://',
  id,
}: {
  state: InputState
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  urlPrefix?: string
  id?: string
}) {
  const isDisabled = state === 'disabled'
  const hasValue = !!value
  const prefixBg = isDisabled ? TOKEN.bgDisabled : TOKEN.bgDefault
  return (
    <div
      className={cn(
        'flex items-start rounded-lg border overflow-hidden',
        isDisabled ? TOKEN.bgDisabled : TOKEN.bgDefault,
        'border-gray-300', // outer border always default — inner field carries the state border
        TOKEN.shadowDefault,
      )}
    >
      {/* Prefix addon */}
      <div
        className={cn(
          'flex items-center pl-3.5 pr-3 py-2.5 flex-shrink-0',
          prefixBg,
        )}
      >
        <span className={TOKEN.textAddon}>{urlPrefix}</span>
      </div>
      {/* Input field — carries the state border on its left only */}
      <div
        className={cn(
          'flex items-center flex-1 min-w-0 gap-2 px-3.5 py-2.5 border-l rounded-tr-lg rounded-br-lg',
          TOKEN.bgDefault,
          getBorderClass(state),
          getShadowClass(state),
        )}
      >
        <input
          id={id}
          type="url"
          disabled={isDisabled}
          placeholder={placeholder ?? 'www.atrupe.com.br'}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none text-base',
            hasValue
              ? 'text-gray-900'
              : 'text-gray-400 placeholder:text-gray-400',
            isDisabled && 'cursor-not-allowed',
          )}
        />
        {getTrailingIcon(state)}
      </div>
    </div>
  )
}

function CardInput({
  state,
  placeholder,
  value,
  onChange,
  id,
}: {
  state: InputState
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  id?: string
}) {
  const isDisabled = state === 'disabled'
  const hasValue = !!value
  return (
    <div
      className={cn(
        'flex items-center gap-2 pl-2.5 pr-3.5 py-2.5 rounded-lg border overflow-hidden',
        getBgClass(state),
        getBorderClass(state),
        getShadowClass(state),
      )}
    >
      <div className="flex items-center flex-1 min-w-0 gap-2">
        <MastercardIcon />
        <input
          id={id}
          type="text"
          disabled={isDisabled}
          placeholder={placeholder ?? 'Número do cartão'}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'flex-1 min-w-0 bg-transparent outline-none text-base',
            hasValue
              ? 'text-gray-900'
              : 'text-gray-400 placeholder:text-gray-400',
            isDisabled && 'cursor-not-allowed',
          )}
        />
      </div>
      {getTrailingIcon(state)}
    </div>
  )
}

function TextareaInput({
  state,
  placeholder,
  value,
  onChange,
  id,
  rows = 4,
}: {
  state: InputState
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
  id?: string
  rows?: number
}) {
  const isDisabled = state === 'disabled'
  const hasValue = !!value
  return (
    <div
      className={cn(
        'flex rounded-lg border overflow-hidden',
        getBgClass(state),
        getBorderClass(state),
        getShadowClass(state),
      )}
    >
      <textarea
        id={id}
        rows={rows}
        disabled={isDisabled}
        placeholder={placeholder ?? 'Coloque uma descrição...'}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          'flex-1 w-full bg-transparent outline-none resize-none px-3.5 py-2.5 text-base',
          hasValue
            ? 'text-gray-900'
            : 'text-gray-500 placeholder:text-gray-500',
          isDisabled && 'cursor-not-allowed',
        )}
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main exported component
───────────────────────────────────────────────────────────── */

export function FormInput({
  id,
  label,
  hint,
  placeholder,
  value,
  variant = 'text',
  state = 'default',
  onChange,
  className,
  countryCode = 'BR',
  currencySymbol = 'R$',
  urlPrefix = 'http://',
  rows = 4,
}: FormInputProps) {
  const hasError = state === 'error' || state === 'error-focused'

  const renderField = () => {
    switch (variant) {
      case 'email':
        return (
          <EmailInput
            id={id}
            state={state}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        )
      case 'phone':
        return (
          <PhoneInput
            id={id}
            state={state}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            countryCode={countryCode}
          />
        )
      case 'currency':
        return (
          <CurrencyInput
            id={id}
            state={state}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            currencySymbol={currencySymbol}
            suffix={false}
          />
        )
      case 'currency-suffix':
        return (
          <CurrencyInput
            id={id}
            state={state}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            currencySymbol={currencySymbol}
            suffix={true}
          />
        )
      case 'website':
        return (
          <WebsiteInput
            id={id}
            state={state}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            urlPrefix={urlPrefix}
          />
        )
      case 'card':
        return (
          <CardInput
            id={id}
            state={state}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        )
      case 'textarea':
        return (
          <TextareaInput
            id={id}
            state={state}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows}
          />
        )
      default:
        return (
          <TextInput
            id={id}
            state={state}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        )
    }
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className={TOKEN.textLabel}>
          {label}
        </label>
      )}
      <div className="flex flex-col gap-1.5">
        {renderField()}
        {(hint || hasError) && (
          <p className={hasError ? TOKEN.textError : TOKEN.textHint}>
            {hasError ? (hint ?? 'Esta é uma mensagem de erro.') : hint}
          </p>
        )}
      </div>
    </div>
  )
}

export default FormInput
