'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
   SVG icon set (extracted from Figma — 9 actions)
   Both sizes share the same viewBox; CSS `width/height` scales.
───────────────────────────────────────────────────────────── */

// Bold
function IconBold({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M19.6 14.79C20.57 14.12 21.25 13.02 21.25 12C21.25 9.74 19.5 8 17.25 8H11V22H18.04C20.13 22 21.75 20.3 21.75 18.21C21.75 16.69 20.89 15.39 19.6 14.79ZM14 10.5H17C17.83 10.5 18.5 11.17 18.5 12C18.5 12.83 17.83 13.5 17 13.5H14V10.5ZM17.5 19.5H14V16.5H17.5C18.33 16.5 19 17.17 19 18C19 18.83 18.33 19.5 17.5 19.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Italic
function IconItalic({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M14 8V11H16.21L12.79 19H10V22H18V19H15.79L19.21 11H22V8H14Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Heading 1
function IconH1({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M21.7822 22H18.8525V15.9062H13.1396V22H10.21V7.78125H13.1396V13.543H18.8525V7.78125H21.7822V22Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Heading 2
function IconH2({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M20.748 22H18.0215V17.25H13.9824V22H11.2402V10.625H13.9824V15.1406H18.0215V10.625H20.748V22Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Quote
function IconQuote({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M10 21H13L15 17V11H9V17H12L10 21ZM18 21H21L23 17V11H17V17H20L18 21Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Link
function IconLink({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M7.9 16C7.9 14.29 9.29 12.9 11 12.9H15V11H11C8.24 11 6 13.24 6 16C6 18.76 8.24 21 11 21H15V19.1H11C9.29 19.1 7.9 17.71 7.9 16ZM12 17H20V15H12V17ZM21 11H17V12.9H21C22.71 12.9 24.1 14.29 24.1 16C24.1 17.71 22.71 19.1 21 19.1H17V21H21C23.76 21 26 18.76 26 16C26 13.24 23.76 11 21 11Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Image
function IconImage({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M25 23V9C25 7.9 24.1 7 23 7H9C7.9 7 7 7.9 7 9V23C7 24.1 7.9 25 9 25H23C24.1 25 25 24.1 25 23ZM12.5 17.5L15 20.51L18.5 16L23 22H9L12.5 17.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Bullet list
function IconBulletList({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M8.25 14.5C7.42 14.5 6.75 15.17 6.75 16C6.75 16.83 7.42 17.5 8.25 17.5C9.08 17.5 9.75 16.83 9.75 16C9.75 15.17 9.08 14.5 8.25 14.5ZM8.25 8.5C7.42 8.5 6.75 9.17 6.75 10C6.75 10.83 7.42 11.5 8.25 11.5C9.08 11.5 9.75 10.83 9.75 10C9.75 9.17 9.08 8.5 8.25 8.5ZM8.25 20.5C7.42 20.5 6.75 21.18 6.75 22C6.75 22.82 7.43 23.5 8.25 23.5C9.07 23.5 9.75 22.82 9.75 22C9.75 21.18 9.08 20.5 8.25 20.5ZM11.25 23H25.25V21H11.25V23ZM11.25 17H25.25V15H11.25V17ZM11.25 9V11H25.25V9H11.25Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Ordered list
function IconOrderedList({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path
        d="M7 21H9V21.5H8V22.5H9V23H7V24H10V20H7V21ZM8 12H9V8H7V9H8V12ZM7 15H8.8L7 17.1V18H10V17H8.2L10 14.9V14H7V15ZM12 9V11H26V9H12ZM12 23H26V21H12V23ZM12 17H26V15H12V17Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   Caret arrow for floating tooltip position
───────────────────────────────────────────────────────────── */

type CaretPosition = 'bottom-center' | 'bottom-left' | 'top-center'

function Caret({
  position,
  caretW = 16,
}: {
  position: CaretPosition
  caretW?: number
}) {
  const caretH = 9

  if (position === 'bottom-center' || position === 'bottom-left') {
    // Arrow pointing DOWN — appears below the toolbar
    const alignClass =
      position === 'bottom-left' ? 'self-start ml-7' : 'self-center'
    return (
      <svg
        width={caretW}
        height={caretH}
        viewBox={`0 0 ${caretW} 9`}
        fill="none"
        className={alignClass}
      >
        <path
          d={`M${caretW - 1.929} 0C${caretW - 1.038} 0 ${caretW + 0.408} 1.077 ${caretW - 0.222} 1.707L${caretW / 2 + 0.707} 7.778C${caretW / 2 + 0.316} 8.169 ${caretW / 2 - 0.316} 8.169 ${caretW / 2 - 0.707} 7.778L1.222 1.707C0.592 1.077 1.038 0 1.929 0L${caretW - 1.929} 0Z`}
          fill="#101828"
        />
      </svg>
    )
  }

  // Arrow pointing UP — appears above the toolbar (tooltip is below cursor)
  return (
    <svg
      width={caretW}
      height={caretH}
      viewBox={`0 0 ${caretW} 9`}
      fill="none"
      className="self-center"
    >
      <path
        d={`M1.929 9C1.038 9 0.592 7.923 1.222 7.293L${caretW / 2 - 0.707} 1.222C${caretW / 2 - 0.316} 0.831 ${caretW / 2 + 0.316} 0.831 ${caretW / 2 + 0.707} 1.222L${caretW - 1.222} 7.293C${caretW - 0.592} 7.923 ${caretW - 1.038} 9 ${caretW - 1.929} 9L1.929 9Z`}
        fill="#101828"
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   Types & constants
───────────────────────────────────────────────────────────── */

export type ToolbarSize = 'sm' | 'lg'
export type ToolbarTheme = 'dark' | 'light'

type ToolbarAction =
  | 'bold'
  | 'italic'
  | 'h1'
  | 'h2'
  | 'quote'
  | 'link'
  | 'image'
  | 'bullet-list'
  | 'ordered-list'

const ALL_ACTIONS: ToolbarAction[] = [
  'bold',
  'italic',
  'h1',
  'h2',
  'quote',
  'link',
  'image',
  'bullet-list',
  'ordered-list',
]

/* ─────────────────────────────────────────────────────────────
   Icon renderer
───────────────────────────────────────────────────────────── */

function ToolIcon({ action, px }: { action: ToolbarAction; px: number }) {
  switch (action) {
    case 'bold':
      return <IconBold size={px} />
    case 'italic':
      return <IconItalic size={px} />
    case 'h1':
      return <IconH1 size={px} />
    case 'h2':
      return <IconH2 size={px} />
    case 'quote':
      return <IconQuote size={px} />
    case 'link':
      return <IconLink size={px} />
    case 'image':
      return <IconImage size={px} />
    case 'bullet-list':
      return <IconBulletList size={px} />
    case 'ordered-list':
      return <IconOrderedList size={px} />
  }
}

/* ─────────────────────────────────────────────────────────────
   Floating (dark) toolbar
   Variants: lg (32px icons, p-2, gap-1) and sm (28px icons, p-1.5, gap-0.5)
   Caret position: 'bottom-center' | 'bottom-left' | 'top-center'
───────────────────────────────────────────────────────────── */

export interface FloatingToolbarProps {
  size?: ToolbarSize
  caretPosition?: CaretPosition
  actions?: ToolbarAction[]
  activeActions?: ToolbarAction[]
  onAction?: (action: ToolbarAction) => void
  className?: string
}

export function FloatingToolbar({
  size = 'lg',
  caretPosition = 'bottom-center',
  actions = ALL_ACTIONS,
  activeActions = [],
  onAction,
  className,
}: FloatingToolbarProps) {
  const isLg = size === 'lg'
  const iconPx = isLg ? 32 : 28
  const padding = isLg ? 'p-2' : 'p-1.5'
  const gap = isLg ? 'gap-1' : 'gap-0.5'
  const caretW = isLg ? 16 : 28

  const isTopCaret = caretPosition === 'top-center'

  return (
    <div
      className={cn(
        'flex flex-col items-center',
        // drop-shadow matches Figma spec
        '[filter:drop-shadow(0px_12px_16px_rgba(16,24,40,0.08))_drop-shadow(0px_4px_6px_rgba(16,24,40,0.03))]',
        className,
      )}
    >
      {isTopCaret && <Caret position="top-center" caretW={caretW} />}

      <div className={cn('flex rounded-lg bg-[#101828]', padding)}>
        <div className={cn('flex items-center', gap)}>
          {actions.map((action) => {
            const isActive = activeActions.includes(action)
            return (
              <button
                key={action}
                type="button"
                aria-label={action}
                onClick={() => onAction?.(action)}
                className={cn(
                  'flex items-center justify-center rounded transition-colors',
                  isActive
                    ? 'bg-[#475467] text-white'
                    : 'text-[#d0d5dd] hover:text-white hover:bg-[#344054]',
                )}
                style={{ width: iconPx, height: iconPx }}
              >
                <ToolIcon action={action} px={iconPx} />
              </button>
            )
          })}
        </div>
      </div>

      {!isTopCaret && <Caret position={caretPosition} caretW={caretW} />}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Inline (light) toolbar — sits inside the editor
   Dropdown for text style + icon buttons on white/transparent bg
───────────────────────────────────────────────────────────── */

const LIGHT_ICON_SIZES = { lg: 32, sm: 28 } as const

export interface InlineToolbarProps {
  size?: ToolbarSize
  textStyleLabel?: string
  actions?: ToolbarAction[]
  activeActions?: ToolbarAction[]
  onAction?: (action: ToolbarAction) => void
  onTextStyleChange?: () => void
  className?: string
}

function ChevronDown({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
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

export function InlineToolbar({
  size = 'lg',
  textStyleLabel = 'Normal text',
  actions = ALL_ACTIONS,
  activeActions = [],
  onAction,
  onTextStyleChange,
  className,
}: InlineToolbarProps) {
  const iconPx = LIGHT_ICON_SIZES[size]
  const gap = size === 'lg' ? 'gap-1' : 'gap-0.5'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Text style dropdown */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={onTextStyleChange}
          className={cn(
            'flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white border border-[#d0d5dd]',
            '[box-shadow:0px_1px_2px_0_rgba(16,24,40,0.05)]',
            'text-base font-medium text-[#101828]',
          )}
        >
          <span>{textStyleLabel}</span>
          <ChevronDown size={20} />
        </button>
      </div>

      {/* Format buttons */}
      <div className={cn('flex items-center', gap)}>
        {actions.map((action) => {
          const isActive = activeActions.includes(action)
          return (
            <button
              key={action}
              type="button"
              aria-label={action}
              onClick={() => onAction?.(action)}
              className={cn(
                'flex items-center justify-center rounded transition-colors',
                isActive
                  ? 'bg-[#A9F1CC] text-[#085D40]'
                  : 'text-[#98A2B3] hover:text-[#344054] hover:bg-gray-100',
              )}
              style={{ width: iconPx, height: iconPx }}
            >
              <ToolIcon action={action} px={iconPx} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Exports
───────────────────────────────────────────────────────────── */

export type { ToolbarAction, CaretPosition }
export default FloatingToolbar
