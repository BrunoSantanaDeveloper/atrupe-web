// Third-party Imports
import axios from 'axios'
import NextAuth, { CredentialsSignin, type User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { UAParser } from 'ua-parser-js'
import type { BillingSituation } from '@/types/checkout'

/**
 * Login de quem transferiu o ambiente. O código chega à tela de login no
 * resultado do signIn, que mostra o motivo no lugar de "dados inválidos".
 */
class AccessTransferred extends CredentialsSignin {
  code = 'access_transferred'
}

/** Folga para o relógio da Vercel e o do backend não baterem ao segundo. */
const BACKEND_TOKEN_MARGIN_MS = 60 * 1000

/**
 * O access_token do backend vale 4h a partir do login e não é renovado. A
 * sessão do NextAuth, sim: cada consulta do navegador a reassina por mais 4h.
 * Sem esta checagem a sessão seguia aberta com um token que o backend já
 * recusava, toda chamada voltava 401 e o redirect para /logout entrava em
 * laço. Lê o `exp` do token sem validar a assinatura, que é do backend.
 */
function backendTokenExpired(accessToken: unknown): boolean {
  if (typeof accessToken !== 'string') return false
  const payload = accessToken.replace(/^Bearer\s+/i, '').split('.')[1]
  if (!payload) return false
  try {
    const { exp } = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    )
    return (
      typeof exp === 'number' &&
      Date.now() >= exp * 1000 - BACKEND_TOKEN_MARGIN_MS
    )
  } catch {
    return false
  }
}

interface LoginResponse {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  employeeId: string
  isAdmin: boolean
  isSystemAdmin: boolean
  access_token: string
  sessionId: string
  permissions: string[]
  company: {
    id: string
    name: string
    legalName: string
    logo: string
    logoDark?: string | null
    favicon: string
    subscription: string
    subscriptionActive: boolean
    trialEndsAt: string
    blockLevel: string
    features: string[]
    limits: Record<string, number>
    billing?: BillingSituation | null
    isOwner?: boolean
  } | null
}

declare module 'next-auth' {
  interface Session {
    user: User & {
      userId: string
      role: string
      avatar: string
      permissions: string[]
      employeeId: string
      isAdmin: boolean | undefined
      isSystemAdmin: boolean | undefined
    }
    company: {
      id: string
      name: string
      legalName: string
      logo: string
      /** Logo da empresa para o tema escuro (letras claras); vazio sem ela */
      logoDark: string
      favicon: string
      features: string[]
      blockLevel: 'NONE' | 'PARTIAL' | 'FULL'
      plan: {
        name: 'TRIAL' | 'START' | 'LITE' | 'PRO' | 'ELITE' | 'FULL'
        active: boolean
        trialEndsAt: string
        features: string[]
        limits: { [key: string]: number }
      }
      /** Situação da cobrança: alimenta a faixa de pagamento pendente/atrasado. */
      billing: BillingSituation | null
      /** Quem está logado é o titular da conta. */
      isOwner: boolean
    }
    accessToken: string
    sessionId: string
    error?: string
  }
}

export const {
  handlers: { GET, POST },
  signOut,
  auth,
} = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 4, // 4 horas
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'E-mail' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize: async (credentials, request) => {
        const headers = request.headers
        const parser = new UAParser(headers.get('user-agent') || '')

        // Instância axios sem interceptores para não chamar redirect() durante o login.
        // Sem timeout explícito: o backend pode demorar 20-30s em logins que
        // disparam sync com Asaas (empresas em TRIAL ou bloqueadas).
        const api = axios.create({
          baseURL: process.env.API_URL,
          headers: {
            'Content-Type': 'application/json',
            'x-user-ip':
              headers.get('x-real-ip') ||
              (headers.get('x-forwarded-for') ?? '').split(',')[0].trim() ||
              '',
            'x-device-info': JSON.stringify(parser.getResult()),
          },
        })

        const buildUser = (authData: LoginResponse) => {
          const token = `Bearer ${authData.access_token}`
          const company = authData.company
          return {
            id: authData.id,
            name: authData.name,
            email: authData.email,
            avatar: authData.avatar,
            role: authData.role,
            employeeId: authData.employeeId,
            isAdmin: authData.isAdmin,
            isSystemAdmin: authData.isSystemAdmin,
            companyId: company?.id ?? null,
            companyLogo: company?.logo ?? null,
            companyLogoDark: company?.logoDark ?? null,
            companyFavicon: company?.favicon ?? null,
            companyName: company?.name ?? null,
            companyLegalName: company?.legalName ?? null,
            accessToken: token,
            sessionId: authData.sessionId,
            subscription: company?.subscription ?? 'FULL',
            subscriptionActive: company?.subscriptionActive ?? false,
            trialEndsAt: company?.trialEndsAt ?? null,
            blockLevel: company?.blockLevel ?? 'NONE',
            permissions: authData.permissions ?? [],
            features: company?.features ?? [],
            limits: company?.limits ?? {},
            billing: company?.billing ?? null,
            isOwner: company?.isOwner ?? false,
          }
        }

        try {
          const res = await api.post<LoginResponse>('/auth/login', {
            username: credentials.username,
            password: credentials.password,
          })
          return buildUser(res.data)
        } catch (firstError: unknown) {
          const axiosError = firstError as {
            response?: {
              status?: number
              data?: { userMessage?: { code?: string } }
            }
            code?: string
            message?: string
          }
          const status = axiosError?.response?.status
          const code = axiosError?.code

          // Quem transferiu o ambiente é informado do motivo, e não recebe
          // o mesmo "dados inválidos" de uma senha errada. O backend só diz
          // isso com a senha certa.
          if (
            status === 401 &&
            axiosError?.response?.data?.userMessage?.code ===
              'ACCESS_TRANSFERRED'
          ) {
            throw new AccessTransferred()
          }

          // Credenciais inválidas: retorna null imediatamente
          if (status === 401 || status === 403) {
            return null
          }

          // Rate limit (429): retentar dentro da janela só piora. Retorna null.
          if (status === 429) {
            console.error('[auth] Login bloqueado por rate limit (429)')
            return null
          }

          // Timeout: o backend ainda está processando (ex: sync Asaas demorado).
          // Não retenta pois a segunda tentativa também ficaria aguardando.
          if (code === 'ECONNABORTED') {
            console.error('[auth] Login timeout — backend demorou demais:', {
              message: axiosError?.message,
            })
            return null
          }

          // Erro de conectividade (ECONNREFUSED, rede): tenta uma vez mais após 800ms
          console.error(
            '[auth] Erro de conectividade no login, retentando...',
            {
              code,
              status,
              message: axiosError?.message,
            },
          )

          await new Promise((resolve) => setTimeout(resolve, 800))

          try {
            const res = await api.post<LoginResponse>('/auth/login', {
              username: credentials.username,
              password: credentials.password,
            })
            return buildUser(res.data)
          } catch {
            return null
          }
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  events: {
    // Registra a saída no monitor de atividade do backend. Roda em todo
    // signOut (tela de logout, troca de conta). Com o token vencido o backend
    // responderia 401, então nem chama.
    async signOut(message) {
      const token = 'token' in message ? message.token : null
      if (!token?.accessToken || !token.sessionId) return
      if (backendTokenExpired(token.accessToken)) return

      await axios
        .post(`${process.env.API_URL}/activity-monitor/logout`, undefined, {
          headers: {
            Authorization: String(token.accessToken),
            'x-session-id': String(token.sessionId),
          },
          timeout: 5000,
        })
        .catch((error) => {
          console.error('Erro ao registrar logout no backend:', error?.message)
        })
    },
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // Se há um usuário (primeiro login), use os dados do usuário
      if (user) {
        return { ...user, ...token }
      }

      // Token do backend vencido: null encerra a sessão, e o middleware manda
      // para o login em vez de abrir páginas cujas chamadas voltam 401.
      if (backendTokenExpired(token.accessToken)) {
        return null
      }

      // Se é um update trigger, atualize os dados do token
      if (trigger === 'update' && session) {
        try {
          // Atualizar dados da empresa se fornecidos
          if (session.company) {
            if (typeof session.company.name !== 'undefined') {
              token.companyName = session.company.name
            }
            if (typeof session.company.legalName !== 'undefined') {
              token.companyLegalName = session.company.legalName
            }
            if (typeof session.company.logo !== 'undefined') {
              token.companyLogo = session.company.logo
            }
            if (typeof session.company.logoDark !== 'undefined') {
              token.companyLogoDark = session.company.logoDark
            }
            if (typeof session.company.favicon !== 'undefined') {
              token.companyFavicon = session.company.favicon
            }
            // Verificar se plan existe antes de acessar suas propriedades
            if (session.company.plan) {
              if (typeof session.company.plan.name !== 'undefined') {
                token.subscription = session.company.plan.name
              }
              if (typeof session.company.plan.features !== 'undefined') {
                token.features = session.company.plan.features
              }
              if (typeof session.company.plan.active !== 'undefined') {
                token.subscriptionActive = session.company.plan.active
              }
              if (typeof session.company.plan.limits !== 'undefined') {
                token.limits = session.company.plan.limits
              }
              if (typeof session.company.plan.trialEndsAt !== 'undefined') {
                token.trialEndsAt = session.company.plan.trialEndsAt
              }
            }
            if (typeof session.company.blockLevel !== 'undefined') {
              token.blockLevel = session.company.blockLevel
            }
            if (typeof session.company.billing !== 'undefined') {
              token.billing = session.company.billing
            }
            if (typeof session.company.isOwner !== 'undefined') {
              token.isOwner = session.company.isOwner
            }
          }

          if (session.user) {
            if (typeof session.user.avatar !== 'undefined') {
              token.avatar = session.user.avatar
            }
            if (typeof session.user.name !== 'undefined') {
              token.name = session.user.name
            }
            // Atualizar permissões se fornecidas
            if (typeof session.user.permissions !== 'undefined') {
              token.permissions = session.user.permissions
            }
          }
        } catch (error) {
          // Em caso de erro, logar mas não quebrar a sessão
          console.error('Erro ao atualizar sessão:', error)
        }
      }

      return token
    },
    session({ session, token }) {
      const sessionData = {
        user: {
          userId: token.id || '',
          name: token.name || '',
          email: token.email || '',
          role: token.role || '',
          avatar: token.avatar || '',
          employeeId: token.employeeId || '',
          isAdmin: token.isAdmin,
          isSystemAdmin: token.isSystemAdmin,
          permissions: token.permissions || [],
        },
        company: {
          id: token.companyId || '',
          name: token.companyName || '',
          legalName: token.companyLegalName || '',
          logo: token.companyLogo || '',
          logoDark: token.companyLogoDark || '',
          favicon: token.companyFavicon || '',
          blockLevel:
            (token.blockLevel as 'NONE' | 'PARTIAL' | 'FULL') || 'NONE',
          plan: {
            name: token.subscription || 'TRIAL',
            active: token.subscriptionActive || false,
            trialEndsAt: token.trialEndsAt || '',
            features: token.features || [],
            limits: token.limits || {},
          },
          billing: (token.billing as BillingSituation | null) ?? null,
          isOwner: !!token.isOwner,
        },
        expires: session.expires,
        accessToken: token.accessToken || '',
        sessionId: token.sessionId || '',
        error: token.error as string | undefined,
      }

      return sessionData
    },
  },
})
