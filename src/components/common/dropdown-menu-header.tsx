'use client'

import * as React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface DropdownMenuHeaderProps {
  /** Avatar image URL */
  avatarSrc?: string
  /** User's display name */
  name: string
  /** User's email or subtitle */
  email?: string
  /** Online / presence indicator color. Pass `false` to hide. */
  presenceColor?: string | false
  /** Optional section title shown to the right of the avatar block */
  sectionTitle?: string
  className?: string
}

/**
 * DropdownMenuHeader
 *
 * Renders the top header of an account-style dropdown panel.
 * Matches the Figma spec: avatar (40px) + presence dot + name + email,
 * with an optional section title aligned to the right.
 */
export function DropdownMenuHeader({
  avatarSrc,
  name,
  email,
  presenceColor = '#12B76A',
  sectionTitle,
  className,
}: DropdownMenuHeaderProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3',
        sectionTitle && 'justify-between',
        className,
      )}
    >
      {/* Avatar + presence */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          {avatarSrc && <AvatarImage src={avatarSrc} alt={name} />}
          <AvatarFallback className="text-sm font-semibold text-gray-600 bg-gray-100">
            {initials}
          </AvatarFallback>
        </Avatar>

        {presenceColor !== false && (
          <span
            className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white"
            style={{ backgroundColor: presenceColor }}
          />
        )}
      </div>

      {/* Name + email */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-[#344054] leading-tight truncate">
          {name}
        </span>
        {email && (
          <span className="text-sm text-[#667085] leading-tight truncate">
            {email}
          </span>
        )}
      </div>

      {/* Optional section title */}
      {sectionTitle && (
        <span className="ml-auto flex-shrink-0 text-sm font-semibold text-[#344054]">
          {sectionTitle}
        </span>
      )}
    </div>
  )
}
