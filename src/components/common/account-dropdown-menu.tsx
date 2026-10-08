'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { IconCheck as Check } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */

export type AccountMenuItemDef = {
  label: string
  shortcut?: string
  checked?: boolean // only used when variant includes checkboxes
  onCheckedChange?: (checked: boolean) => void
  onClick?: () => void
  disabled?: boolean
}

export type AccountMenuGroup = {
  items: AccountMenuItemDef[]
}

export type AccountMenuVariant =
  | 'simple' // no shortcuts, no header
  | 'shortcuts' // shortcuts, no header
  | 'label-shortcuts' // "Menu da conta" label + shortcuts
  | 'avatar-shortcuts' // avatar header (name+email) + shortcuts
  | 'label-checkboxes' // "Menu da conta" label + checkbox items + shortcuts
  | 'avatar-checkboxes' // avatar header + checkbox items + shortcuts

export interface AccountDropdownMenuProps {
  variant?: AccountMenuVariant
  // header props (avatar variants)
  avatarSrc?: string
  userName?: string
  userEmail?: string
  presenceColor?: string // e.g. '#12B76A'
  // label header
  menuLabel?: string
  // menu structure
  groups: AccountMenuGroup[]
  // trigger
  trigger: React.ReactNode
  // Radix content props
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}

/* ─────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────── */

/** DS-token panel shell */
function MenuContent({
  children,
  align = 'end',
  side = 'bottom',
  sideOffset = 4,
}: {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-60 overflow-hidden rounded-lg border border-gray-100 bg-white text-gray-700',
          'shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)]',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
        )}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  )
}

/** Text-only label header: "Menu da conta" */
function LabelHeader({ label }: { label: string }) {
  return (
    <>
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-700 truncate">{label}</p>
      </div>
      <div className="h-px bg-gray-100" />
    </>
  )
}

/** Avatar header with name, email, and optional presence dot */
function AvatarHeader({
  avatarSrc,
  userName,
  userEmail,
  presenceColor = '#12B76A',
}: {
  avatarSrc?: string
  userName?: string
  userEmail?: string
  presenceColor?: string
}) {
  return (
    <>
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar with presence indicator */}
          <div className="relative flex-shrink-0 w-10 h-10">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                {userName?.[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
            {/* Presence dot — matches Figma: 11.5×11.5 rounded rect at bottom-right */}
            <span
              className="absolute bottom-0 right-0 block w-[11.5px] h-[11.5px] rounded-full border-[1.5px] border-white"
              style={{ backgroundColor: presenceColor }}
            />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">
              {userName}
            </p>
            <p className="text-sm text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-100" />
    </>
  )
}

/** Separator between groups */
const Separator = () => <div className="h-px bg-gray-100 my-0" />

/** Plain menu item (no shortcut, no checkbox) */
function SimpleItem({ item }: { item: AccountMenuItemDef }) {
  return (
    <DropdownMenuPrimitive.Item
      disabled={item.disabled}
      onSelect={item.onClick}
      className={cn(
        'relative flex cursor-pointer select-none items-center px-4 py-2.5',
        'text-sm font-medium text-gray-700 outline-none transition-colors',
        'hover:bg-gray-50 focus:bg-gray-50',
        'data-[disabled]:pointer-events-none data-[disabled]:text-gray-200',
      )}
    >
      {item.label}
    </DropdownMenuPrimitive.Item>
  )
}

/** Menu item with shortcut on the right */
function ShortcutItem({ item }: { item: AccountMenuItemDef }) {
  return (
    <DropdownMenuPrimitive.Item
      disabled={item.disabled}
      onSelect={item.onClick}
      className={cn(
        'relative flex cursor-pointer select-none items-center justify-between px-4 py-2.5',
        'text-sm font-medium text-gray-700 outline-none transition-colors',
        'hover:bg-gray-50 focus:bg-gray-50',
        'data-[disabled]:pointer-events-none data-[disabled]:text-gray-200',
      )}
    >
      <span>{item.label}</span>
      {item.shortcut && (
        <span className="ml-auto text-xs text-gray-500 font-normal">
          {item.shortcut}
        </span>
      )}
    </DropdownMenuPrimitive.Item>
  )
}

/** Checkbox item with shortcut — unchecked state renders the DS square border box */
function CheckboxItem({ item }: { item: AccountMenuItemDef }) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      disabled={item.disabled}
      checked={item.checked ?? false}
      onCheckedChange={item.onCheckedChange}
      className={cn(
        'relative flex cursor-pointer select-none items-center justify-between px-4 py-2.5',
        'text-sm text-gray-700 outline-none transition-colors',
        'hover:bg-gray-50 focus:bg-gray-50',
        'data-[disabled]:pointer-events-none data-[disabled]:text-gray-200',
      )}
    >
      <div className="flex items-center gap-3">
        {/* DS checkbox box — 16×16 rounded border */}
        <span className="relative flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white flex-shrink-0">
          <DropdownMenuPrimitive.ItemIndicator>
            <Check className="h-3 w-3 text-gray-700" />
          </DropdownMenuPrimitive.ItemIndicator>
        </span>
        <span className="text-sm">{item.label}</span>
      </div>
      {item.shortcut && (
        <span className="ml-auto text-xs text-gray-500 font-normal">
          {item.shortcut}
        </span>
      )}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */

export function AccountDropdownMenu({
  variant = 'simple',
  avatarSrc,
  userName,
  userEmail,
  presenceColor = '#12B76A',
  menuLabel = 'Menu da conta',
  groups,
  trigger,
  align = 'end',
  side = 'bottom',
  sideOffset = 4,
}: AccountDropdownMenuProps) {
  const hasShortcuts = variant !== 'simple'
  const hasCheckboxes =
    variant === 'label-checkboxes' || variant === 'avatar-checkboxes'
  const hasAvatarHeader =
    variant === 'avatar-shortcuts' || variant === 'avatar-checkboxes'
  const hasLabelHeader =
    variant === 'label-shortcuts' || variant === 'label-checkboxes'

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>
      <MenuContent align={align} side={side} sideOffset={sideOffset}>
        {/* Header */}
        {hasAvatarHeader && (
          <AvatarHeader
            avatarSrc={avatarSrc}
            userName={userName}
            userEmail={userEmail}
            presenceColor={presenceColor}
          />
        )}
        {hasLabelHeader && <LabelHeader label={menuLabel} />}

        {/* Groups */}
        {groups.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <Separator />}
            <DropdownMenuPrimitive.Group>
              {group.items.map((item, ii) =>
                hasCheckboxes ? (
                  <CheckboxItem key={ii} item={item} />
                ) : hasShortcuts ? (
                  <ShortcutItem key={ii} item={item} />
                ) : (
                  <SimpleItem key={ii} item={item} />
                ),
              )}
            </DropdownMenuPrimitive.Group>
          </React.Fragment>
        ))}
      </MenuContent>
    </DropdownMenuPrimitive.Root>
  )
}
