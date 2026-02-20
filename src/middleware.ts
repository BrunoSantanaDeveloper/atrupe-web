// Next
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Libs
import { auth } from '@/lib/auth'

// Config
import {
  GUEST_ROUTES,
  SHARED_ROUTES,
  ALLOWED_WHEN_PARTIAL,
  ALLOWED_WHEN_TRIAL_EXPIRED,
  HOME_PAGE,
  SYSTEM_HOME_PAGE,
  SUBSCRIPTION_PAGE,
  BLOCKED_PAGE,
  PARTIAL_BLOCKED_PAGE,
} from '@/config/routes'

// Re-export para compatibilidade
export { HOME_PAGE, SYSTEM_HOME_PAGE }

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const session = await auth()
  const user = session?.user
  const isUserLoggedIn = !!user
  const trialEndsAt = session?.company?.plan?.trialEndsAt
  const blockLevel = session?.company?.blockLevel
  const userIsSystemAdmin = user?.isSystemAdmin

  const isTrialExpired = trialEndsAt
    ? new Date(trialEndsAt) < new Date()
    : false

  const isFullBlocked = blockLevel === 'FULL'
  const isPartialBlocked = blockLevel === 'PARTIAL'

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

  // If the user is logged in but the trial has expired, redirect to the subscription page
  const isAllowedRouteWhenTrialExpired = ALLOWED_WHEN_TRIAL_EXPIRED.some(
    (route) => pathname.endsWith('logout') || pathname.startsWith(route),
  )

  if (isUserLoggedIn && isTrialExpired && !isAllowedRouteWhenTrialExpired) {
    return NextResponse.redirect(new URL(SUBSCRIPTION_PAGE, req.url).toString())
  }

  // If the company is fully blocked, redirect to the blocked page
  const isAllowedRouteWhenBlocked =
    pathname.endsWith('logout') ||
    pathname.startsWith(BLOCKED_PAGE) ||
    pathname.startsWith(SUBSCRIPTION_PAGE)

  if (isUserLoggedIn && isFullBlocked && !isAllowedRouteWhenBlocked) {
    return NextResponse.redirect(new URL(BLOCKED_PAGE, req.url).toString())
  }

  // If the company is partially blocked, restrict access to only allowed routes
  if (isUserLoggedIn && isPartialBlocked) {
    const isAllowedInPartial = ALLOWED_WHEN_PARTIAL.some(
      (route) => pathname === route || pathname.startsWith(route + '/'),
    )

    if (!isAllowedInPartial) {
      return NextResponse.redirect(
        new URL(PARTIAL_BLOCKED_PAGE, req.url).toString(),
      )
    }
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
