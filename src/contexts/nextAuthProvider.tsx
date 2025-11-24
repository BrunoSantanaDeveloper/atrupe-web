'use client'

// Third-party Imports
import { SessionProvider, signOut, useSession } from 'next-auth/react'
import type { Session } from 'next-auth'

// Types Imports
import type { PropsWithChildren } from 'react'
import { useEffect, useRef, useCallback } from 'react'

interface Props {
  basePath?: string
  session: Session | null
}

/**
 * Componente que monitora a atividade do usuário e renova a sessão apenas se estiver ativo
 */
function SessionActivityHandler({ children }: PropsWithChildren) {
  const { data: session, update } = useSession()
  const lastActivityRef = useRef<number>(Date.now())
  const refreshIntervalRef = useRef<NodeJS.Timeout>()

  // Atualiza o timestamp de última atividade
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
  }, [])

  useEffect(() => {
    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    events.forEach((event) => {
      document.addEventListener(event, updateActivity)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity)
      })
    }
  }, [updateActivity])

  useEffect(() => {
    // Se houver erro no refresh, desloga o usuário
    if (session?.error === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/login' })
    }
  }, [session])

  useEffect(() => {
    // Verifica a cada 5 minutos se o usuário está ativo
    refreshIntervalRef.current = setInterval(
      async () => {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current

        // Se o usuário esteve ativo nos últimos 10 minutos, renova a sessão
        if (timeSinceLastActivity < 10 * 60 * 1000) {
          await update()
        }
      },
      5 * 60 * 1000,
    ) // Verifica a cada 5 minutos

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [update])

  return <>{children}</>
}

// eslint-disable-next-line
export function NextAuthProvider({
  children,
  session,
}: PropsWithChildren<Props>) {
  return (
    <SessionProvider session={session}>
      <SessionActivityHandler>{children}</SessionActivityHandler>
    </SessionProvider>
  )
}
