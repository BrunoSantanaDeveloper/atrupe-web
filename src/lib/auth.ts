// Third-party Imports
import axios from 'axios'
import NextAuth, { type User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { UAParser } from 'ua-parser-js'

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
    favicon: string
    subscription: string
    subscriptionActive: boolean
    trialEndsAt: string
    blockLevel: string
    features: string[]
    limits: Record<string, number>
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
            response?: { status?: number }
            code?: string
            message?: string
          }
          const status = axiosError?.response?.status
          const code = axiosError?.code

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
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // Se há um usuário (primeiro login), use os dados do usuário
      if (user) {
        return { ...user, ...token }
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
          favicon: token.companyFavicon || '',
          // Liberação só para testes locais: com DEV_IGNORE_BLOCK=true no
          // .env.local, o `next dev` ignora o bloqueio vindo do backend.
          // Nunca vale no build de produção
          blockLevel:
            process.env.NODE_ENV === 'development' &&
            process.env.DEV_IGNORE_BLOCK === 'true'
              ? 'NONE'
              : (token.blockLevel as 'NONE' | 'PARTIAL' | 'FULL') || 'NONE',
          plan: {
            name: token.subscription || 'TRIAL',
            active: token.subscriptionActive || false,
            trialEndsAt: token.trialEndsAt || '',
            features: token.features || [],
            limits: token.limits || {},
          },
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
