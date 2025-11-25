'use client'

import { useSession } from 'next-auth/react'

export function usePermissions() {
  const { data: session } = useSession()

  const hasPermission = (permission: string) => {
    if (!session?.user?.permissions) return false

    // Se o usuário for ADMIN, tem todas as permissões
    if (session.user.isAdmin) return true

    return session.user.permissions.includes(permission)
  }

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some((permission) => hasPermission(permission))
  }

  const hasAllPermissions = (permissions: string[]) => {
    return permissions.every((permission) => hasPermission(permission))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: session?.user?.permissions as string[],
  }
}
