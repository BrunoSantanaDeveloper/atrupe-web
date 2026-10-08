'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import {
  IconChevronDown as ChevronDown,
  IconChevronUp as ChevronUp,
  IconSearch as Search,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

export interface MemberOption {
  id: string
  name: string
  username?: string
  /** URL to avatar image */
  avatarSrc?: string
  /** Hex color for the presence dot (e.g. '#12B76A'). Omit to hide. */
  presenceColor?: string
  disabled?: boolean
}

export type MemberSelectIconVariant =
  | 'none'
  | 'user'
  | 'avatar'
  | 'dot'
  | 'search'

export interface MemberSelectProps {
  /** List of members to show in the dropdown */
  options: MemberOption[]
  /** Currently selected member */
  value?: MemberOption | null
  /** Called when the user selects or clears a member */
  onChange?: (member: MemberOption | null) => void
  /** Placeholder shown when no member is selected */
  placeholder?: string
  /** Optional field label rendered above the trigger */
  label?: string
  /**
   * Which leading icon to render in the trigger and list items:
   * - `none`   — no leading icon
   * - `user`   — person outline icon
   * - `avatar` — circular avatar (falls back to user icon when empty)
   * - `dot`    — colored presence dot
   */
  iconVariant?: MemberSelectIconVariant
  /** Show @username handle in items */
  showUsername?: boolean
  disabled?: boolean
  /** Shows a search input inside the dropdown panel */
  searchable?: boolean
  id?: string
  className?: string
}

/* ─────────────────────────────────────────────────────────────
   Internal helpers
───────────────────────────────────────────────────────────── */

const MEMBER_AVATAR_FALLBACK = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

/** User person outline icon (exact SVG from Figma) */
function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-5 h-5 flex-shrink-0', className)}
    >
      <path
        d="M16.6667 17.5V15.8333C16.6667 14.9493 16.3155 14.1014 15.6904 13.4763C15.0652 12.8512 14.2174 12.5 13.3333 12.5H6.66668C5.78262 12.5 4.93478 12.8512 4.30965 13.4763C3.68453 14.1014 3.33334 14.9493 3.33334 15.8333V17.5M13.3333 5.83333C13.3333 7.67428 11.841 9.16667 10 9.16667C8.15906 9.16667 6.66668 7.67428 6.66668 5.83333C6.66668 3.99238 8.15906 2.5 10 2.5C11.841 2.5 13.3333 3.99238 13.3333 5.83333Z"
        stroke="#667085"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Presence dot (filled circle) */
function PresenceDot({
  color = '#12B76A',
  disabled,
}: {
  color?: string
  disabled?: boolean
}) {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-2.5 h-2.5 flex-shrink-0"
    >
      <circle cx={5} cy={5} r={4} fill={disabled ? '#EAECF0' : color} />
    </svg>
  )
}

/** Check mark icon (green, from Figma) */
function CheckIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 flex-shrink-0 text-brand-600"
    >
      <path
        d="M16.6667 5L7.50001 14.1667L3.33334 10"
        stroke="#077550"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Search icon (exact SVG from Figma) */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-5 h-5 flex-shrink-0', className)}
    >
      <path
        d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
        stroke="#667085"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Leading icon slot inside trigger / list item */
function LeadingIcon({
  variant,
  member,
  disabled,
}: {
  variant: MemberSelectIconVariant
  member?: MemberOption | null
  disabled?: boolean
}) {
  if (variant === 'none') return null

  if (variant === 'search') return <SearchIcon />

  if (variant === 'dot') {
    return (
      <PresenceDot
        color={member?.presenceColor ?? '#12B76A'}
        disabled={disabled}
      />
    )
  }

  if (variant === 'avatar') {
    if (!member) return <UserIcon />
    return (
      <Avatar className="w-6 h-6 flex-shrink-0">
        {member.avatarSrc && (
          <AvatarImage src={member.avatarSrc} alt={member.name} />
        )}
        <AvatarFallback className="text-xs font-semibold text-gray-600 bg-gray-100">
          {MEMBER_AVATAR_FALLBACK(member.name)}
        </AvatarFallback>
      </Avatar>
    )
  }

  // 'user' variant
  return <UserIcon />
}

/* ─────────────────────────────────────────────────────────────
   MemberSelect
───────────────────────────────────────────────────────────── */

export function MemberSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione um membro',
  label,
  iconVariant = 'none',
  showUsername = false,
  disabled = false,
  searchable = false,
  id,
  className,
}: MemberSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const filtered = React.useMemo(() => {
    if (!searchable || !query.trim()) return options
    const q = query.toLowerCase()
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.username && o.username.toLowerCase().includes(q)),
    )
  }, [options, query, searchable])

  function handleSelect(member: MemberOption) {
    if (member.disabled) return
    onChange?.(value?.id === member.id ? null : member)
    setOpen(false)
    setQuery('')
  }

  const isOpen = open && !disabled

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <PopoverPrimitive.Root
        open={isOpen}
        onOpenChange={disabled ? undefined : setOpen}
      >
        {/* ── Trigger ── */}
        <PopoverPrimitive.Trigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-expanded={isOpen}
            className={cn(
              'flex items-center gap-2 w-full px-3.5 py-2.5 rounded-lg bg-white border text-left transition-shadow',
              'outline-none focus-visible:outline-none',
              // border
              isOpen
                ? 'border-brand-300 shadow-[0px_1px_2px_0_rgba(16,24,40,0.05),0px_0px_0px_4px_#f4ebff]'
                : 'border-gray-300 shadow-[0px_1px_2px_0_rgba(16,24,40,0.05)]',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {/* Leading icon */}
            <LeadingIcon
              variant={iconVariant}
              member={value}
              disabled={disabled}
            />

            {/* Text content */}
            <span className="flex-1 flex items-center gap-2 min-w-0">
              {value ? (
                <>
                  <span className="text-base font-medium text-gray-900 truncate">
                    {value.name}
                  </span>
                  {showUsername && value.username && (
                    <span className="text-base text-gray-500 truncate">
                      @{value.username}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-base text-gray-500">{placeholder}</span>
              )}
            </span>

            {/* Chevron — hidden for 'search' variant (no dropdown indicator) */}
            {iconVariant !== 'search' &&
              (isOpen ? (
                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
              ))}
          </button>
        </PopoverPrimitive.Trigger>

        {/* ── Dropdown Panel ── */}
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(
            'z-50 w-[var(--radix-popover-trigger-width)] min-w-[320px] rounded-lg bg-white py-1',
            'border border-gray-100',
            'shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)]',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
            'max-h-80 overflow-hidden flex',
          )}
        >
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search input */}
            {searchable && (
              <div className="px-3.5 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="flex-1 text-sm text-gray-900 placeholder-gray-500 outline-none bg-transparent"
                  />
                </div>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto member-select-scroll">
              {filtered.length === 0 ? (
                <div className="px-3.5 py-4 text-sm text-gray-500 text-center">
                  Nenhum membro encontrado
                </div>
              ) : (
                filtered.map((member) => {
                  const isSelected = value?.id === member.id
                  return (
                    <button
                      key={member.id}
                      type="button"
                      disabled={member.disabled}
                      onClick={() => handleSelect(member)}
                      className={cn(
                        'w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left transition-colors',
                        isSelected && 'bg-gray-50',
                        !isSelected && !member.disabled && 'hover:bg-gray-50',
                        member.disabled &&
                          'cursor-not-allowed pointer-events-none',
                      )}
                    >
                      {/* Left: icon + name */}
                      <div className="flex items-center gap-2 min-w-0">
                        <LeadingIcon
                          variant={iconVariant}
                          member={member}
                          disabled={member.disabled}
                        />
                        <span
                          className={cn(
                            'text-base font-medium truncate',
                            member.disabled ? 'text-gray-200' : 'text-gray-900',
                          )}
                        >
                          {member.name}
                        </span>
                        {showUsername && member.username && (
                          <span
                            className={cn(
                              'text-base truncate',
                              member.disabled
                                ? 'text-gray-200'
                                : 'text-gray-500',
                            )}
                          >
                            @{member.username}
                          </span>
                        )}
                      </div>

                      {/* Right: check mark when selected */}
                      {isSelected && !member.disabled && <CheckIcon />}
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Custom scrollbar track (decorative, matches Figma spec) */}
          <div className="w-4 flex-shrink-0 flex items-start justify-center py-1">
            <div
              className="w-2 rounded-lg bg-gray-200"
              style={{ minHeight: 32, height: '40%' }}
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Root>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MemberSearchInput — trigger-only, no chevron (search variant)
   Maps to the "Buscar" column in the Figma spec.
───────────────────────────────────────────────────────────── */

export interface MemberSearchInputProps {
  value?: MemberOption | null
  placeholder?: string
  label?: string
  showUsername?: boolean
  focused?: boolean
  disabled?: boolean
  className?: string
}

export function MemberSearchInput({
  value,
  placeholder = 'Buscar',
  label,
  showUsername = false,
  focused = false,
  disabled = false,
  className,
}: MemberSearchInputProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white border transition-shadow',
          focused
            ? 'border-brand-300 shadow-[0px_1px_2px_0_rgba(16,24,40,0.05),0px_0px_0px_4px_#f4ebff]'
            : 'border-gray-300 shadow-[0px_1px_2px_0_rgba(16,24,40,0.05)]',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <SearchIcon />
        <span className="flex-1 flex items-center gap-2 min-w-0">
          {value ? (
            <>
              <span className="text-base font-medium text-gray-900 truncate">
                {value.name}
              </span>
              {showUsername && value.username && (
                <span className="text-base text-gray-500 truncate">
                  @{value.username}
                </span>
              )}
            </>
          ) : (
            <span className="text-base text-gray-500">{placeholder}</span>
          )}
        </span>
      </div>
    </div>
  )
}
