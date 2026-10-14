'use server'

// Lib Imports
import { signOut } from '@/lib/auth'

/**
 * Encerra a sessão do NextAuth. O registro da saída no backend fica no evento
 * `signOut` de `lib/auth.ts`, que roda em todo signOut.
 */
export default async function logout() {
  await signOut({ redirect: false })
}
