'use client'

// Third-party Imports
import { SessionProvider, signOut, useSession } from 'next-auth/react'
import type { Session } from 'next-auth'
import { usePathname } from 'next/navigation'

// Types Imports
import type { PropsWithChildren } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import type { CompanySessionBlock } from '@/types/checkout'

interface Props {
  basePath?: string
  session: Session | null
}

/** Intervalo mínimo entre duas buscas do estado da empresa sem `force`. */
const COMPANY_REFRESH_MIN_INTERVAL = 60 * 1000

interface CompanySessionContextValue {
  /**
   * Busca no servidor o estado da empresa e o leva à sessão. Sem `force`,
   * ignora a chamada feita a menos de 1 min da anterior (montagem, foco, a
   * cada 5 min); com `force`, busca na hora — a API recusou por plano, então
   * a sessão está velha. Devolve o bloco lido, ou `null` quando não buscou.
   */
  refreshCompanyState: (options?: {
    force?: boolean
  }) => Promise<CompanySessionBlock | null>
}

const CompanySessionContext = createContext<CompanySessionContextValue | null>(
  null,
)

/** O refresh do estado da empresa do provider; `null` fora dele. */
export function useCompanySessionContext() {
  return useContext(CompanySessionContext)
}

/**
 * Componente que monitora a atividade do usuário e renova a sessão apenas se estiver ativo
 */
function SessionActivityHandler({ children }: PropsWithChildren) {
  const { data: session, status, update } = useSession()
  const lastActivityRef = useRef<number>(Date.now())
  const lastCompanyRefreshRef = useRef<number>(0)
  // Na tela de saída nada consulta o servidor nem renova a sessão: um
  // update() concorrente reemitiria o cookie que o signOut acabou de apagar.
  const isLoggingOut = usePathname() === '/logout'

  /**
   * Busca no servidor o estado da empresa — plano, bloqueio e situação da
   * cobrança — e o leva à sessão. `update()` sem argumentos só reassinava o
   * token, sem consultar nada: bloqueio e pagamento confirmado só apareciam
   * no login seguinte. Vai pela rota de API, e não por server action: ver
   * `app/api/company/session/route.ts`.
   */
  const companyRefreshInFlightRef =
    useRef<Promise<CompanySessionBlock | null> | null>(null)
  const refreshCompanyState = useCallback(
    async (options?: { force?: boolean }) => {
      if (!session?.company?.id) return null
      // Uma busca em andamento já traz o estado novo: vários 403 juntos não
      // disparam várias buscas.
      if (companyRefreshInFlightRef.current) {
        return companyRefreshInFlightRef.current
      }
      if (
        !options?.force &&
        Date.now() - lastCompanyRefreshRef.current <
          COMPANY_REFRESH_MIN_INTERVAL
      ) {
        return null
      }
      lastCompanyRefreshRef.current = Date.now()

      const run = async () => {
        const block: CompanySessionBlock | null = await fetch(
          '/api/company/session',
        )
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
        if (!block) return null
        await update({
          company: {
            plan: block.plan,
            blockLevel: block.blockLevel,
            billing: block.billing,
            isOwner: block.isOwner,
          },
        })
        return block
      }

      companyRefreshInFlightRef.current = run().finally(() => {
        companyRefreshInFlightRef.current = null
      })
      return companyRefreshInFlightRef.current
    },
    [session?.company?.id, update],
  )
  const companySessionContext = useMemo(
    () => ({ refreshCompanyState }),
    [refreshCompanyState],
  )
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

    if (
      status === 'authenticated' &&
      !initialRefreshDoneRef.current &&
      !isLoggingOut
    ) {
      initialRefreshDoneRef.current = true
      refreshUserData()
      // O plano (recursos e limites) pode ter mudado no painel do superadmin:
      // recarregar a página já traz a composição nova.
      refreshCompanyState()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    // Atualiza dados do usuário quando a janela ganha foco (volta para a aba)
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState === 'visible' &&
        status === 'authenticated' &&
        !isLoggingOut
      ) {
        const timeSinceLastActivity = Date.now() - lastActivityRef.current

        // Se o usuário esteve ativo nos últimos 10 minutos, renova a sessão e dados
        if (timeSinceLastActivity < 10 * 60 * 1000) {
          await update()
          await refreshUserData()
          // Quem volta à aba depois de pagar vê a cobrança já confirmada.
          await refreshCompanyState()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [update, refreshUserData, refreshCompanyState, status, isLoggingOut])

  // Periodic session refresh to detect blockLevel changes (every 5 minutes)
  useEffect(() => {
    if (status !== 'authenticated' || isLoggingOut) return

    const BLOCK_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

    const interval = setInterval(async () => {
      await refreshCompanyState()
    }, BLOCK_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [refreshCompanyState, status, isLoggingOut])

  return (
    <CompanySessionContext.Provider value={companySessionContext}>
      {children}
    </CompanySessionContext.Provider>
  )
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
