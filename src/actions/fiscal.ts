'use server'

import { cookies } from 'next/headers'

export async function getAuthToken() {
  const cookieStore = cookies()
  return cookieStore.get('auth_token')?.value
}
