'use client'

// Mostra o conteúdo só para o administrador da empresa. Para o que é
// exclusivo dele por decisão do produto e não se concede pela tela de
// cargos, como a assinatura (spec assinatura, 19/09 e 23/10/2026)

import { useSession } from 'next-auth/react'
import type { ReactNode } from 'react'

export function AdminGate({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const { data: session, status } = useSession()
  if (status === 'loading') return null
  return session?.user?.isAdmin ? <>{children}</> : <>{fallback}</>
}
