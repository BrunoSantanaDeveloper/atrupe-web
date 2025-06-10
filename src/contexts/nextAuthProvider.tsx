'use client'

// Third-party Imports
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'

// Types Imports
import type { PropsWithChildren } from 'react'

interface Props {
  basePath?: string
  session: Session | null
}

// eslint-disable-next-line
export function NextAuthProvider({
  children,
  session,
}: PropsWithChildren<Props>) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
