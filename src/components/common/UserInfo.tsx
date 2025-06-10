'use client'

import { Avatar } from '@/components/AvatarComponent'
import Link from 'next/link'

interface UserInfoProps {
  name: string
  description: string
  link?: string
  imageUrl?: string
}

export function UserInfo({
  name,
  description,
  link,
  imageUrl = '',
}: UserInfoProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar url={imageUrl} name={name} size="sm" />

      <div className="flex flex-col">
        <span className="text-sm font-medium">{name}</span>
        {link ? (
          <Link
            href={link}
            className="text-sm text-gray hover:opacity-80 active:opacity-95 transition-opacity"
          >
            {description}
          </Link>
        ) : (
          <span className="text-sm text-gray">{description}</span>
        )}
      </div>
    </div>
  )
}
