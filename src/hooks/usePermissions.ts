'use client'

import { useSession } from 'next-auth/react'

export function usePermissions() {
  const { data: session } = useSession()

  const hasPermission = (permission: string) => {
    if (!session?.user?.permissions) return false

    // Admin bypass — has all permissions
    if (session.user.isAdmin) return true

    // Direct match
    if (session.user.permissions.includes(permission)) return true

    // Hierarchy: edit/create/delete imply view
    if (permission.endsWith(':view')) {
      const base = permission.replace(/:view$/, '')
      return (
        session.user.permissions.includes(`${base}:edit`) ||
        session.user.permissions.includes(`${base}:create`) ||
        session.user.permissions.includes(`${base}:delete`)
      )
    }

    return false
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
