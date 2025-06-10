// Type Imports
import type { PropsWithChildren } from 'react'
import type { Session } from 'next-auth'

// Provider Imports
import { QueryProvider } from '@/contexts/queryProvider'
import { StoreNavHistoryProvider } from '@/contexts/storeNavHistory'
import { NextAuthProvider } from '@/contexts/nextAuthProvider'
// import { NextAuthProvider } from '@/contexts/nextAuthProvider'

// Styled Component Imports
// import AppReactToastify from '@/libs/styles/AppReactToastify'

const BASE_PATH = process.env.NEXTAUTH_BASEPATH || ''

export default function Providers({
  children,
  session,
}: PropsWithChildren<{ session: Session | null }>) {
  return (
    <NextAuthProvider basePath={BASE_PATH} session={session}>
      <QueryProvider>
        <StoreNavHistoryProvider>
          <>{children}</>
        </StoreNavHistoryProvider>
      </QueryProvider>
    </NextAuthProvider>
  )
}
