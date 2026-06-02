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
  const { data: session, status, update } = useSession()
  const lastActivityRef = useRef<number>(Date.now())
  const initialRefreshDoneRef = useRef(false)
  const refreshInFlightRef = useRef(false)

  // Atualiza o timestamp de última atividade
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
  }, [])

  // Busca dados do usuário via rota API interna (proxy)
  const fetchUserMe = useCallback(async () => {
    if (status !== 'authenticated') return null

    try {
      const response = await fetch('/api/user/me')
      if (response.redirected) {
        return null
      }
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  }, [status])

  // Busca dados atualizados do /user/me e atualiza a sessão
  const refreshUserData = useCallback(async () => {
    if (refreshInFlightRef.current) return

    refreshInFlightRef.current = true

    try {
      const userData = await fetchUserMe()
      if (!userData) return

      const updatePayload: {
        user?: Record<string, unknown>
        company?: Record<string, unknown>
      } = {}

      // Verificar mudanças no usuário
      const newPermissions = userData.policies || []
      const currentPermissions = session?.user?.permissions || []
      const permissionsChanged =
        JSON.stringify([...newPermissions].sort()) !==
        JSON.stringify([...currentPermissions].sort())

      if (permissionsChanged) {
        updatePayload.user = {
          ...updatePayload.user,
          permissions: newPermissions,
        }
      }
      const userName = userData.name || ''
      if (userName !== session?.user?.name) {
        updatePayload.user = { ...updatePayload.user, name: userName }
      }
      const userAvatar = userData.avatar || ''
      if (userAvatar !== session?.user?.avatar) {
        updatePayload.user = {
          ...updatePayload.user,
          avatar: userAvatar,
        }
      }

      // Verificar mudanças na empresa
      const company = userData.employee?.company
      if (company) {
        const companyName = company.name || ''
        if (companyName !== session?.company?.name) {
          updatePayload.company = {
            ...updatePayload.company,
            name: companyName,
          }
        }
        const companyLegalName = company.legalName || ''
        if (companyLegalName !== session?.company?.legalName) {
          updatePayload.company = {
            ...updatePayload.company,
            legalName: companyLegalName,
          }
        }
        const companyLogo = company.logoUrl || ''
        if (companyLogo !== session?.company?.logo) {
          updatePayload.company = {
            ...updatePayload.company,
            logo: companyLogo,
          }
        }
        const companyFavicon = company.favIconUrl || ''
        if (companyFavicon !== session?.company?.favicon) {
          updatePayload.company = {
            ...updatePayload.company,
            favicon: companyFavicon,
          }
        }
      }

      // Só atualiza se algum dado mudou
      if (updatePayload.user || updatePayload.company) {
        await update(updatePayload)
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error)
    } finally {
      refreshInFlightRef.current = false
    }
  }, [fetchUserMe, session, update])

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

  // Atualiza dados do usuário no mount inicial (refresh da página)
  useEffect(() => {
    if (status === 'unauthenticated') {
      initialRefreshDoneRef.current = false
      return
    }

    if (status === 'authenticated' && !initialRefreshDoneRef.current) {
      initialRefreshDoneRef.current = true
      refreshUserData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    // Atualiza dados do usuário quando a janela ganha foco (volta para a aba)
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === 'visible' &&
        status === 'authenticated'
      ) {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current

        // Se o usuário esteve ativo nos últimos 10 minutos, renova a sessão e dados
        if (timeSinceLastActivity < 10 * 60 * 1000) {
          await update()
          await refreshUserData()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [update, refreshUserData, status])

  // Periodic session refresh to detect blockLevel changes (every 5 minutes)
  useEffect(() => {
    if (status !== 'authenticated') return

    const BLOCK_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

    const interval = setInterval(async () => {
      // Silently refresh session to get updated blockLevel from server
      await update()
    }, BLOCK_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [update, status])

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
