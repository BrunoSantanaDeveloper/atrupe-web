// Next
import { notFound } from 'next/navigation'

// Lib
import { auth } from '@/lib/auth'

// Types
import { type PropsWithChildren } from 'react'

export default async function AdminLayout({ children }: PropsWithChildren) {
  const session = await auth()

  const isSystemAdmin = session?.user?.isSystemAdmin

  if (!isSystemAdmin) notFound()

  return children
}
