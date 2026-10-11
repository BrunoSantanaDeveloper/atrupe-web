'use client'

import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import type { InputState } from './form-input'

/* ─────────────────────────────────────────────────────────────
   Sizes — box dimensions per Figma
───────────────────────────────────────────────────────────── */

const SIZE_MAP = {
  sm: { wrapper: 'w-16 h-16', text: 'text-5xl', gap: 'gap-2' },
  md: { wrapper: 'w-20 h-20', text: 'text-5xl', gap: 'gap-3' },
  lg: { wrapper: 'w-24 h-24', text: 'text-6xl', gap: 'gap-3' },
} as const

export type OtpSize = keyof typeof SIZE_MAP

/* ─────────────────────────────────────────────────────────────
   Per-digit visual logic (Figma states)
   ─────────────────────────────────────────────────────────────
   disabled  → bg-gray-50  | border #d0d5dd  | text #eaecf0 | no ring
   default   → bg-white    | border #d0d5dd  | text #d0d5dd (placeholder)
   filled    → bg-white    | border #38cf8f  | text #077550
   focused   → bg-white    | border #38cf8f  | text #077550 | outer ring #a9f1cc
   error     → bg-white    | border #fda29b  | text #d0d5dd or #101828
───────────────────────────────────────────────────────────── */

interface DigitVisuals {
  innerBorder: string
  textColor: string
  outerRing: boolean
  bgColor: string
}

function getDigitVisuals(
  digitValue: string,
  globalState: InputState,
  isFocused: boolean,
): DigitVisuals {
  if (globalState === 'disabled') {
    return {
      innerBorder: 'border-gray-300',
      textColor: 'text-gray-200',
      outerRing: false,
      bgColor: 'bg-gray-50',
    }
  }

  const isError = globalState === 'error' || globalState === 'error-focused'
  const hasValue = digitValue !== ''

  if (isError) {
    return {
      innerBorder: 'border-error-300',
      textColor: hasValue ? 'text-gray-900' : 'text-gray-300',
      outerRing: false,
      bgColor: 'bg-white',
    }
  }

  if (isFocused || hasValue) {
    return {
      innerBorder: 'border-brand-300',
      textColor: 'text-brand-600',
      outerRing: isFocused,
      bgColor: 'bg-white',
    }
  }

  return {
    innerBorder: 'border-gray-300',
    textColor: 'text-gray-300',
    outerRing: false,
    bgColor: 'bg-white',
  }
}

/* ─────────────────────────────────────────────────────────────
   Single digit box
───────────────────────────────────────────────────────────── */

interface DigitBoxProps {
  value: string
  size: OtpSize
  state: InputState
  index: number
  isFocused: boolean
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => void
  onChange: (value: string, idx: number) => void
  onFocus: (idx: number) => void
  onBlur: () => void
  inputRef: (el: HTMLInputElement | null, idx: number) => void
}

function DigitBox({
  value,
  size,
  state,
  index,
  isFocused,
  onKeyDown,
  onChange,
  onFocus,
  onBlur,
  inputRef,
}: DigitBoxProps) {
  const s = SIZE_MAP[size]
  const isDisabled = state === 'disabled'
  const { innerBorder, textColor, outerRing, bgColor } = getDigitVisuals(
    value,
    state,
    isFocused,
  )

  return (
    /* Outer wrapper — shows focus ring */
    <div
      className={cn(
        s.wrapper,
        'flex-shrink-0 rounded-lg',
        outerRing
          ? 'p-[3px] border-[3px] border-brand-100'
          : 'p-0 border-[3px] border-transparent', // reserve space so layout doesn't shift
      )}
    >
      {/* Inner digit box */}
      <div
        className={cn(
          'flex items-center justify-center w-full h-full rounded-lg border',
          bgColor,
          innerBorder,
          '[box-shadow:0px_1px_2px_0_rgba(16,24,40,0.05)]',
        )}
      >
        <input
          ref={(el) => inputRef(el, index)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={isDisabled}
          value={value}
          onFocus={() => onFocus(index)}
          onBlur={onBlur}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(-1)
            onChange(v, index)
          }}
          onKeyDown={(e) => onKeyDown(e, index)}
          className={cn(
            'w-full h-full bg-transparent outline-none text-center font-medium',
            s.text,
            textColor,
            isDisabled && 'cursor-not-allowed',
          )}
          placeholder="0"
        />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────────── */

export interface OtpInputProps {
  /** Number of digits. Defaults to 4 */
  length?: 4 | 6
  /**
   * "simple" — all digits in a single row
   * "split"  — digits split into two equal groups with a dash separator
   */
  format?: 'simple' | 'split'
  size?: OtpSize
  label?: string
  hint?: string
  state?: InputState
  value?: string
  onChange?: (value: string) => void
  id?: string
  className?: string
}

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */

export function OtpInput({
  length = 4,
  format = 'simple',
  size = 'md',
  label,
  hint,
  state = 'default',
  value = '',
  onChange,
  id,
  className,
}: OtpInputProps) {
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const refs = useRef<(HTMLInputElement | null)[]>([])
  const setRef = (el: HTMLInputElement | null, idx: number) => {
    refs.current[idx] = el
  }

  const handleChange = (v: string, idx: number) => {
    const next = [...digits]
    next[idx] = v
    onChange?.(next.join(''))
    if (v && idx < length - 1) {
      refs.current[idx + 1]?.focus()
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number,
  ) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && idx > 0) refs.current[idx - 1]?.focus()
    if (e.key === 'ArrowRight' && idx < length - 1)
      refs.current[idx + 1]?.focus()
  }

  const handleFocus = (idx: number) => setFocusedIndex(idx)
  const handleBlur = () => setFocusedIndex(null)

  const s = SIZE_MAP[size]
  const isError = state === 'error' || state === 'error-focused'
  const half = length / 2

  const renderBoxes = (indices: number[]) =>
    indices.map((i) => (
      <DigitBox
        key={i}
        index={i}
        value={digits[i]}
        size={size}
        state={state}
        isFocused={focusedIndex === i}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputRef={setRef}
      />
    ))

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className={cn('flex items-center', s.gap)}>
        {format === 'simple' ? (
          renderBoxes(Array.from({ length }, (_, i) => i))
        ) : (
          <>
            {renderBoxes(Array.from({ length: half }, (_, i) => i))}
            <span
              className={cn(
                'font-medium select-none',
                // reduce size to avoid layout shift from border-3 on wrapper
                size === 'sm'
                  ? 'text-4xl'
                  : size === 'md'
                    ? 'text-5xl'
                    : 'text-6xl',
                'text-gray-300',
              )}
            >
              -
            </span>
            {renderBoxes(Array.from({ length: half }, (_, i) => i + half))}
          </>
        )}
      </div>

      {hint && (
        <p
          className={cn(
            'text-sm',
            isError ? 'text-error-500' : 'text-gray-500',
          )}
        >
          {hint}
        </p>
      )}
    </div>
  )
}

export default OtpInput
