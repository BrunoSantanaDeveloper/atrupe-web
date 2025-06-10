// Next
import { cookies } from 'next/headers'

// Components
import { SidebarComponent } from './SidebarComponent'

// Lib
import { auth } from '@/lib/auth'
// import { secondaryNavMatcher } from '@/lib/utils'

export async function Sidebar() {
  const session = await auth()

  if (!session) return null

  // const headerList = headers()

  const sidebarCollapsedCookie =
    cookies().get('sidebarCollapsed')?.value || 'false'

  const sidebarCollapsed = JSON.parse(sidebarCollapsedCookie)

  // const pathname = headerList.get('x-pathname')

  // const secondaryNavigation = secondaryNavMatcher(pathname, 'server')

  return (
    <SidebarComponent
      session={session}
      defaultCollapsed={sidebarCollapsed}
      // secondaryNavigation={secondaryNavigation}
    />
  )
}
