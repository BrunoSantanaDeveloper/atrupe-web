import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth'

import { HOME_PAGE, SYSTEM_HOME_PAGE } from '@/middleware'

export default async function Home() {
  const session = await auth()

  const userIsSystemAdmin = session?.user?.isSystemAdmin

  if (userIsSystemAdmin) redirect(SYSTEM_HOME_PAGE)

  redirect(HOME_PAGE)
}
