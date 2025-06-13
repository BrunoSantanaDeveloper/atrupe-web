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
    }
    company: {
      id: string
      name: string
      legalName: string
      logo: string
      favicon: string
      subscription: 'TRIAL' | 'START' | 'LITE' | 'PRO' | 'ELITE' | 'FULL'
      isTrial: boolean
      trialEndsAt: string
    }
    accessToken: string
  }
}

export const {
  handlers: { GET, POST },
  signOut,
  auth,
} = NextAuth({
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
          const res = await api.post('/auth/login', credentials)

          const authData = await res.data

          if (res.status === 401) {
            throw new Error(JSON.stringify(authData))
          }

          if (res.status === 201) {
            const token = `Bearer ${authData.access_token}`
            api.defaults.headers.Authorization = token

            const isTrial = authData.company.subscription === 'TRIAL'

            return {
              id: authData.id,
              name: authData.name,
              email: authData.email,
              avatar: authData.avatar,
              role: authData.role,
              employeeId: authData.employeeId,
              companyId: authData.company.id,
              companyLogo: authData.company.logo,
              companyFavicon: authData.company.favicon,
              companyName: authData.company.name,
              companyLegalName: authData.company.legalName,
              accessToken: token,
              subscription: authData.company.subscription,
              isTrial,
              trialEndsAt: authData.company.trialEndsAt,
              permissions: authData.permissions || [],
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
        // Atualizar dados da empresa se fornecidos
        if (session.company) {
          if (typeof session.company.isTrial !== 'undefined') {
            token.isTrial = session.company.isTrial
          }
          if (typeof session.company.trialEndsAt !== 'undefined') {
            token.trialEndsAt = session.company.trialEndsAt
          }
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
        }
      }

      return token
    },
    session({ session, token }) {
      const sessionData = {
        user: {
          userId: token.id,
          name: token.name,
          email: token.email,
          role: token.role,
          avatar: token.avatar,
          employeeId: token.employeeId,
          permissions: token.permissions,
        },
        company: {
          id: token.companyId,
          name: token.companyName,
          legalName: token.companyLegalName,
          logo: token.companyLogo,
          favicon: token.companyFavicon,
          subscription: token.subscription,
          isTrial: token.isTrial,
          trialEndsAt: token.trialEndsAt,
        },
        expires: session.expires,
        accessToken: token.accessToken,
      }

      return sessionData
    },
  },
})
