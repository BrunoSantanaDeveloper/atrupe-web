// Next
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Libs
import { auth } from '@/lib/auth'

// Constants
export const HOME_PAGE = '/dashboard'
export const SYSTEM_HOME_PAGE = '/admin'
const SUBSCRIPTION_PAGE = '/assinatura'
const GUEST_ROUTES = [
  'login',
  'cadastro',
  'cadastro/inicio',
  'cadastro/verificar-email',
  'cadastro/nova-senha',
  'validar-cadastro',
  'termos-de-uso',
  'aviso-de-privacidade',
  'esqueci-minha-senha',
  'esqueci-minha-senha/email-enviado',
  'redefinir-senha',
  'redefinindo-senha',
]
const SHARED_ROUTES = ['shared-route']

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const session = await auth()
  const user = session?.user
  const isUserLoggedIn = !!user
  const trialEndsAt = session?.company.plan.trialEndsAt
  const userIsSystemAdmin = user?.isSystemAdmin

  const isTrialExpired = trialEndsAt
    ? new Date(trialEndsAt) < new Date()
    : false

  // If the user is not logged in and is trying to access a private route, redirect to the login page
  const privateRoute = ![...GUEST_ROUTES, ...SHARED_ROUTES].some((route) =>
    pathname.endsWith(route),
  )

  if (!isUserLoggedIn && privateRoute) {
    let redirectUrl = '/login'

    if (!(pathname === '/')) {
      const searchParamsStr = new URLSearchParams({
        to: pathname,
      }).toString()

      redirectUrl += `?${searchParamsStr}`
    }

    return NextResponse.redirect(new URL(redirectUrl, req.url).toString())
  }

  // If the user is logged in and is trying to access a guest route, redirect to the root page
  const isRequestedRouteIsGuestRoute = GUEST_ROUTES.some((route) =>
    pathname.endsWith(route),
  )

  if (
    isUserLoggedIn &&
    isRequestedRouteIsGuestRoute &&
    !pathname.endsWith(HOME_PAGE.slice(1))
  ) {
    const redirectPage = userIsSystemAdmin ? SYSTEM_HOME_PAGE : HOME_PAGE
    return NextResponse.redirect(new URL(redirectPage, req.url).toString())
  }

  const isAllowedRouteWhenTrialExpired =
    pathname.endsWith('logout') || pathname.startsWith(SUBSCRIPTION_PAGE)

  // If the user is logged in but the trial has expired, redirect to the subscription page
  if (isUserLoggedIn && isTrialExpired && !isAllowedRouteWhenTrialExpired) {
    return NextResponse.redirect(new URL(SUBSCRIPTION_PAGE, req.url).toString())
  }

  // Set pathname in the headers
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', req.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
}
