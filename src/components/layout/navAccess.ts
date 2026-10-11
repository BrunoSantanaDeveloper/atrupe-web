// Regras do menu que o computador (SidebarComponent) e o celular
// (MobileSidebar) precisam aplicar igual (plano 5.5: "lógica igual no desktop
// e no celular").

interface NavPermissionItem {
  permission?: string | string[]
  /** Com lista, exige todas (E); sem, basta uma (OU). */
  requireAllPermissions?: boolean
}

interface PermissionChecks {
  isAdmin?: boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
}

/** O item de menu passa pela permissão do cargo (o administrador vê tudo). */
export function navPermissionAllowed(
  item: NavPermissionItem,
  { isAdmin, hasAnyPermission, hasAllPermissions }: PermissionChecks,
) {
  const { permission, requireAllPermissions } = item
  if (!permission) return true
  if (isAdmin) return true

  const permissions = Array.isArray(permission) ? permission : [permission]
  return requireAllPermissions
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)
}

interface NavGroup {
  path?: string
  children?: { path?: string }[]
}

/**
 * O grupo do menu que abre na rota atual: primeiro o do filho ativo (o de
 * caminho mais longo que a rota começa, para um filho mais geral de outro
 * grupo não vencer), depois o do prefixo do grupo. Produtos está em Cadastros
 * com a rota /configuracoes/produtos; pelo prefixo, abriria Configurações sem
 * item marcado.
 */
export function openNavGroupPath(groups: NavGroup[], pathname: string) {
  let byChild: NavGroup | undefined
  let longest = 0
  for (const group of groups) {
    for (const child of group.children || []) {
      const path = child.path?.split('?')[0]
      if (path && pathname.startsWith(path) && path.length > longest) {
        byChild = group
        longest = path.length
      }
    }
  }
  const byPrefix = groups.find((group) => pathname.startsWith(group.path || ''))
  return (byChild ?? byPrefix)?.path
}
