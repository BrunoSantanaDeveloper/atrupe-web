'use server'

// Lib Imports
import { signOut } from '@/lib/auth'

export default async function logout() {
  await signOut({ redirect: false })
}
