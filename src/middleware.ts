// Next
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Libs
import { auth } from '@/lib/auth'
import { DEMO_DATA } from '@/lib/demo'

// Config
import {
  GUEST_ROUTES,
  SHARED_ROUTES,
  ALLOWED_WHEN_TRIAL_EXPIRED,
  HOME_PAGE,
  SYSTEM_HOME_PAGE,
  SUBSCRIPTION_PAGE,
  BLOCKED_PAGE,
  isDemoRoute,
} from '@/config/routes'

// Re-export para compatibilidade
export { HOME_PAGE, SYSTEM_HOME_PAGE }

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const session = await auth()
  const user = session?.user
  const isUserLoggedIn = !!user
  const trialEndsAt = session?.company?.plan?.trialEndsAt
  const planName = session?.company?.plan?.name
  const blockLevel = session?.company?.blockLevel
  const userIsSystemAdmin = user?.isSystemAdmin

  // Só redireciona por trial expirado se o plano ainda for TRIAL.
  // Após contratar, o token pode ter trialEndsAt desatualizado — a troca de plano
  // é propagada imediatamente e serve como flag definitiva.
  const isTrialExpired =
    planName === 'TRIAL' && trialEndsAt
      ? new Date(trialEndsAt) < new Date()
      : false

  const isFullBlocked = blockLevel === 'FULL'

  // Tela de demonstração (dados de exemplo) sem a flag: responde "página não
  // encontrada", com ou sem sessão, pelo mesmo caminho do /admin abaixo
  if (!DEMO_DATA && isDemoRoute(pathname)) {
    return NextResponse.rewrite(new URL('/pagina-nao-encontrada', req.url))
  }

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

  // Rota inexistente: renderiza o 404 padrão sem revelar o título da página restrita
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  if (isUserLoggedIn && isAdminRoute && !userIsSystemAdmin) {
    return NextResponse.rewrite(new URL('/pagina-nao-encontrada', req.url))
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

  // Rota compartilhada (o convite de transferência) não é da empresa de quem
  // está logado: nem teste vencido nem bloqueio a desviam.
  const isSharedRoute = SHARED_ROUTES.some((route) => pathname.endsWith(route))

  // If the user is logged in but the trial has expired, redirect to the subscription page
  const isAllowedRouteWhenTrialExpired =
    isSharedRoute ||
    ALLOWED_WHEN_TRIAL_EXPIRED.some(
      (route) => pathname.endsWith('logout') || pathname.startsWith(route),
    )

  if (isUserLoggedIn && isTrialExpired && !isAllowedRouteWhenTrialExpired) {
    return NextResponse.redirect(new URL(SUBSCRIPTION_PAGE, req.url).toString())
  }

  // If the company is fully blocked, redirect to the blocked page
  const isAllowedRouteWhenBlocked =
    isSharedRoute ||
    pathname.endsWith('logout') ||
    pathname.startsWith(BLOCKED_PAGE) ||
    pathname.startsWith(SUBSCRIPTION_PAGE)

  if (isUserLoggedIn && isFullBlocked && !isAllowedRouteWhenBlocked) {
    return NextResponse.redirect(new URL(BLOCKED_PAGE, req.url).toString())
  }

  // PARTIAL block: user can navigate normally, restrictions are applied at component/API level
  // Only FULL block redirects to /blocked

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
