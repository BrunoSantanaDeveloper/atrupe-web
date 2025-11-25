// Third-party Imports
import NextAuth, { type User } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { UAParser } from 'ua-parser-js'

// Lib Imports
import apiInstance from '@/lib/api'

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
        const api = await apiInstance()

        const headers = request.headers

        const parser = new UAParser(headers.get('user-agent') || '')

        api.defaults.headers['x-user-ip'] =
          headers.get('x-real-ip') || headers.get('x-forwarded-for')

        api.defaults.headers['x-device-info'] = JSON.stringify(
          parser.getResult(),
        )

        try {
          const res = await api.post('/auth/login', {
            username: credentials.username,
            password: credentials.password,
          })

          console.log('LOGIN:', res.data)

          const authData = res.data

          if (res.status === 401) {
            throw new Error(JSON.stringify(authData))
          }

          if (res.status === 201) {
            const token = `Bearer ${authData.access_token}`
            api.defaults.headers.Authorization = token

            // Para admin do sistema, company é null
            const company = authData.company || {}

            return {
              id: authData.id,
              name: authData.name,
              email: authData.email,
              avatar: authData.avatar,
              role: authData.role,
              employeeId: authData.employeeId,
              isAdmin: authData.isAdmin,
              isSystemAdmin: authData.isSystemAdmin,
              companyId: company.id || null,
              companyLogo: company.logo || null,
              companyFavicon: company.favicon || null,
              companyName: company.name || null,
              companyLegalName: company.legalName || null,
              accessToken: token,
              sessionId: authData.sessionId,
              subscription: company.subscription || 'FULL',
              subscriptionActive: company.subscriptionActive,
              trialEndsAt: company.trialEndsAt || null,
              permissions: authData.permissions || [],
              features: company.features || [],
              limits: company.limits || {},
            }
          }

          return null

          // eslint-disable-next-line
        } catch (e: any) {
          throw new Error(e.message)
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
            }
          }

          if (session.user) {
            if (typeof session.user.avatar !== 'undefined') {
              token.avatar = session.user.avatar
            }
            if (typeof session.user.name !== 'undefined') {
              token.name = session.user.name
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
