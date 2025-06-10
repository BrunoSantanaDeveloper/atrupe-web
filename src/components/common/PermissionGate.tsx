'use client'

import { usePermissions } from '@/hooks/usePermissions'

interface Props {
  children: React.ReactNode
  permissions?: string[]
  requireAll?: boolean
  fallback?: React.ReactNode
}

export function PermissionGate({
  children,
  permissions = [],
  requireAll = false,
  fallback = null,
}: Props) {
  const { hasAnyPermission, hasAllPermissions } = usePermissions()

  if (!permissions.length) return <>{children}</>

  const hasPermission = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)

  if (!hasPermission) return <>{fallback}</>

  return <>{children}</>
}
