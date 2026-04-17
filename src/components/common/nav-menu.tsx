'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
   Design tokens
───────────────────────────────────────────────────────────── */

const COLOR = {
  iconDefault: '#98A2B3',
  iconActive: '#099260',
  iconCta: '#099260',
  iconGroup: '#475467',
  textDefault: '#667085',
  textActive: '#077550',
  textCta: '#475467',
  textGroup: '#344054',
  bgActive: '#ecfdf4',
  badgeBg: '#f2f4f7',
  badgeText: '#344054',
  alertBg: '#fff6ed',
  sectionBorder: '#eaecf0',
} as const

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

export interface NavBadgeCounter {
  type: 'counter'
  /** Displayed label, e.g. "+9" or "3" */
  label: string
}

export interface NavBadgeAlert {
  type: 'alert'
}

export type NavBadge = NavBadgeCounter | NavBadgeAlert

export interface NavItemDef {
  id: string
  label: string
  /**
   * Icon render function. Receives the resolved CSS color string so
   * callers can apply it to stroke/fill attributes.
   * Example: `(c) => <svg ...><path stroke={c} d="..." /></svg>`
   */
  icon: (color: string) => React.ReactNode
  badge?: NavBadge
  href?: string
  active?: boolean
  /** 'cta' = filled green icon + semibold label — no active bg */
  variant?: 'default' | 'cta'
  onClick?: () => void
}

export interface NavGroupDef {
  id: string
  label: string
  icon: (color: string) => React.ReactNode
  items: NavItemDef[]
  defaultOpen?: boolean
}

export type NavEntry = NavItemDef | NavGroupDef

export function isNavGroup(e: NavEntry): e is NavGroupDef {
  return 'items' in e
}

/* ─────────────────────────────────────────────────────────────
   Internal icons (not exported)
───────────────────────────────────────────────────────────── */

function AlertBadge() {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 p-1 rounded-2xl mix-blend-multiply"
      style={{ background: COLOR.alertBg }}
    >
      <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
        <path
          d="M6 4V6M6 8H6.005M1.5 6C1.5 6.59095 1.6164 7.17611 1.84254 7.72208C2.06869 8.26804 2.40016 8.76412 2.81802 9.18198C3.23588 9.59984 3.73196 9.93131 4.27792 10.1575C4.82389 10.3836 5.40905 10.5 6 10.5C6.59095 10.5 7.17611 10.3836 7.72208 10.1575C8.26804 9.93131 8.76412 9.59984 9.18198 9.18198C9.59984 8.76412 9.93131 8.26804 10.1575 7.72208C10.3836 7.17611 10.5 6.59095 10.5 6C10.5 4.80653 10.0259 3.66193 9.18198 2.81802C8.33807 1.97411 7.19347 1.5 6 1.5C4.80653 1.5 3.66193 1.97411 2.81802 2.81802C1.97411 3.66193 1.5 4.80653 1.5 6Z"
          stroke="#EC4A0A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

function CounterBadge({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0 px-2 py-0.5 rounded-2xl mix-blend-multiply"
      style={{ background: COLOR.badgeBg }}
    >
      <span className="text-xs font-medium" style={{ color: COLOR.badgeText }}>
        {label}
      </span>
    </div>
  )
}

function ChevronDown() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      className="flex-shrink-0"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="#099260"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronUp() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      className="flex-shrink-0"
    >
      <path
        d="M12 10L8 6L4 10"
        stroke="#099260"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────
   NavItem — exported for standalone usage
───────────────────────────────────────────────────────────── */

export function NavItem({
  item,
  onClickOverride,
}: {
  item: NavItemDef
  onClickOverride?: (id: string) => void
}) {
  const isCta = item.variant === 'cta'
  const isActive = !!item.active && !isCta

  const iconColor = isCta
    ? COLOR.iconCta
    : isActive
      ? COLOR.iconActive
      : COLOR.iconDefault

  const handleClick = () => {
    item.onClick?.()
    onClickOverride?.(item.id)
  }

  return (
    <div
      id={`nav-item-${item.id}`}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'flex justify-between items-center h-10 p-2 rounded cursor-pointer transition-colors select-none',
        isActive && 'bg-[#ecfdf4]',
        !isActive && !isCta && 'hover:bg-gray-50',
      )}
    >
      {/* Left: icon + label (+ inline alert badge) */}
      <div className="flex items-center flex-grow min-w-0 gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
          {item.icon(iconColor)}
        </div>

        {/* Label */}
        <span
          className={cn(
            'text-xs truncate',
            isCta ? 'font-semibold' : 'font-medium',
          )}
          style={{
            color: isCta
              ? COLOR.textCta
              : isActive
                ? COLOR.textActive
                : COLOR.textDefault,
          }}
        >
          {item.label}
        </span>

        {/* Alert badge inline (after label) */}
        {item.badge?.type === 'alert' && <AlertBadge />}
      </div>

      {/* Counter badge trailing */}
      {item.badge?.type === 'counter' && (
        <CounterBadge label={item.badge.label} />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NavGroup — exported for standalone usage
───────────────────────────────────────────────────────────── */

export interface NavGroupProps {
  group: NavGroupDef
  onItemClick?: (id: string) => void
  /** If provided, controls open state externally */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NavGroup({
  group,
  onItemClick,
  open: openProp,
  onOpenChange,
}: NavGroupProps) {
  const [openInternal, setOpenInternal] = useState(group.defaultOpen ?? false)

  const isControlled = openProp !== undefined
  const isOpen = isControlled ? openProp : openInternal

  const toggle = () => {
    if (isControlled) {
      onOpenChange?.(!openProp)
    } else {
      setOpenInternal((v) => !v)
    }
  }

  return (
    <div
      id={`nav-group-${group.id}`}
      className="flex flex-col gap-3 pb-5 border-b border-[#eaecf0]"
    >
      {/* Group header */}
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => e.key === 'Enter' && toggle()}
        className="flex justify-between items-center px-2 cursor-pointer select-none"
      >
        <div className="flex items-center flex-grow min-w-0 gap-3">
          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            {group.icon(COLOR.iconGroup)}
          </div>
          <span
            className="text-sm font-semibold truncate flex-grow"
            style={{ color: COLOR.textGroup }}
          >
            {group.label}
          </span>
        </div>
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </div>

      {/* Sub-items */}
      {isOpen && (
        <div className="flex flex-col gap-1">
          {group.items.map((item) => (
            <NavItem key={item.id} item={item} onClickOverride={onItemClick} />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NavMenu — main exported component
───────────────────────────────────────────────────────────── */

export interface NavMenuProps {
  entries: NavEntry[]
  onItemClick?: (id: string) => void
  className?: string
}

export function NavMenu({ entries, onItemClick, className }: NavMenuProps) {
  // Group consecutive standalone items into blocks for proper gap-1 rendering
  const blocks: Array<
    | { type: 'group'; entry: NavGroupDef }
    | { type: 'items'; entries: NavItemDef[] }
  > = []

  for (const entry of entries) {
    if (isNavGroup(entry)) {
      blocks.push({ type: 'group', entry })
    } else {
      const last = blocks[blocks.length - 1]
      if (last?.type === 'items') {
        last.entries.push(entry)
      } else {
        blocks.push({ type: 'items', entries: [entry] })
      }
    }
  }

  return (
    <nav id="nav-menu" className={cn('flex flex-col', className)}>
      {blocks.map((block, i) => {
        if (block.type === 'group') {
          return (
            <NavGroup
              key={block.entry.id}
              group={block.entry}
              onItemClick={onItemClick}
            />
          )
        }
        return (
          <div key={i} className="flex flex-col gap-1">
            {block.entries.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                onClickOverride={onItemClick}
              />
            ))}
          </div>
        )
      })}
    </nav>
  )
}

export default NavMenu
