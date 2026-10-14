'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'

import Loading from '@/app/loading'

/**
 * Sai pela rota do NextAuth (/api/auth/signout), num fetch comum. Com server
 * action, o logout entrava na fila de actions do router atrás de outras: uma
 * que voltasse 401 recarregava esta página antes de ele rodar, e o cookie
 * nunca era apagado. A navegação de página inteira para /login descarta o
 * estado do cliente.
 */
export default function Logout() {
  useEffect(() => {
    signOut({ redirect: false })
      .catch(() => null)
      .finally(() => window.location.replace('/login'))
  }, [])

  return <Loading />
}
