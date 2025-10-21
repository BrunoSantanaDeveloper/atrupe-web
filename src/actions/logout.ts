'use server'

// Lib Imports
import { signOut, auth } from '@/lib/auth'
import { createItemNew } from './_cruds'

export default async function logout() {
  try {
    // Obter a sessão atual para pegar o sessionId
    const session = await auth()

    if (session?.sessionId) {
      // Notificar o backend sobre o logout
      const res = await createItemNew({ route: '/activity-monitor/logout' })

      if (!res.success) {
        console.error('Erro ao registrar logout no backend:', res.message)
      }
    }
  } catch (error) {
    console.error('Erro ao processar logout:', error)
  } finally {
    // Sempre realizar o signOut, independente do resultado da notificação
    await signOut({ redirect: false })
  }
}
