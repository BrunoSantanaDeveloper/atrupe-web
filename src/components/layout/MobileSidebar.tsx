'use client'

// React
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

// UI
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

// Components
import { Avatar } from '../AvatarComponent'
import { MyProfileDialog } from './MyProfile'

// Assets
import favicon from '@public/logo/logo.png'

// Consts
import { HOME_PAGE, SYSTEM_HOME_PAGE } from '@/middleware'
import { getMainNavigation, userRoleObj } from '@/consts/nav'

// Icons
import { IconComponent } from '../common/Icon'
import {
  IconX,
  IconUser,
  IconMenu2,
  IconLogout,
  IconFilter,
  IconSearch,
} from '@tabler/icons-react'

// Hooks
import { useSession } from 'next-auth/react'
import { usePermissions } from '@/hooks/usePermissions'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Libs
import { cn, getFirstAndLastName } from '@/lib/utils'

// Types
import type { IconProps } from '@tabler/icons-react'
import type { SVGProps } from 'react'

interface NavigationItem {
  icon:
    | React.ComponentType<IconProps>
    | React.ComponentType<SVGProps<SVGSVGElement>>
  iconColor?: string
  title: string
  path?: string
  query?: string
  counter?: number
  action?: boolean
  permission?: string | string[]
  requiredModule?: string
  children?: NavigationItem[]
}

interface MobileSidebarProps {
  className?: string
}

export function MobileSidebar({ className }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  const { hasPermission } = usePermissions()
  const {
    hasFinancialModule,
    canManageRejectionReasons,
    canManageDeliverySchedule,
  } = usePlanFeatures()

  if (!session) return null

  const user = session.user
  const userRole = user.role || 'USER'
  const userIsSystemAdmin = user.isSystemAdmin
  const companyFavicon = session.company?.favicon as string

  const mainNavigation = getMainNavigation(user)

  // Módulos contratados mockados
  const contractedModules = {
    nota_fiscal: false,
  }

  const hasContractedModule = (requiredModule?: string): boolean => {
    if (!requiredModule) return true
    return (
      contractedModules[requiredModule as keyof typeof contractedModules] ??
      false
    )
  }

  const getUserLimit = () => session?.company?.plan?.limits?.max_users || 0

  const checkPermission = (permission?: string | string[]) => {
    if (!permission) return true
    if (session.user.role === 'Admin') return true

    if (Array.isArray(permission)) {
      return permission.some((perm) => hasPermission(perm))
    }

    return hasPermission(permission)
  }

  const checkItemAccess = (item: NavigationItem): boolean => {
    if (!checkPermission(item.permission)) {
      return false
    }

    if (!hasContractedModule(item.requiredModule)) {
      return false
    }

    if (item.path?.includes('/colaboradores-e-usuarios')) {
      return getUserLimit() > 0
    }

    if (item.path?.includes('/frente-de-caixa')) {
      return hasFinancialModule('pdv')
    }

    if (item.path?.includes('/controle-de-caixa')) {
      return hasFinancialModule('cash')
    }

    if (item.path?.includes('/a-receber')) {
      return hasFinancialModule('receivable')
    }

    if (item.path?.includes('/a-pagar')) {
      return hasFinancialModule('payable')
    }

    if (item.path?.includes('/motivos-de-rejeicao-e-cancelamento')) {
      return canManageRejectionReasons()
    }

    if (item.path?.includes('/producao')) {
      return canManageDeliverySchedule()
    }

    return true
  }

  const filteredNavigation = mainNavigation
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => checkItemAccess(child)),
    }))
    .filter((item) => checkItemAccess(item) && (item.children?.length ?? 0) > 0)

  const handleLogOut = () => {
    setOpen(false)
    router.push('/logout')
  }

  const handleLinkClick = () => {
    setOpen(false)
  }

  const handleProfileClick = () => {
    setOpen(false)
    setTimeout(() => {
      setProfileOpen(true)
    }, 150)
  }

  return (
    <>
      {/* Header with logo and toggle button - z-index higher to stay on top */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b lg:hidden relative z-50">
        <Link href={userIsSystemAdmin ? SYSTEM_HOME_PAGE : HOME_PAGE}>
          <Image
            src={companyFavicon || favicon}
            alt="Logo da empresa"
            width={38}
            height={38}
            className="object-contain ml-8"
          />
        </Link>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="neutralGhost"
            size="iconMd"
            RightIcon={IconSearch}
            className="bg-transparent"
          />
          <Button
            type="button"
            variant="neutralGhost"
            size="iconMd"
            RightIcon={IconFilter}
            className="bg-transparent"
          />
          <Button
            type="button"
            variant="neutralGhost"
            size="iconMd"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            className={cn(className, 'bg-transparent')}
            onClick={() => setOpen(!open)}
            RightIcon={open ? IconX : IconMenu2}
          />
        </div>
      </header>

      {/* Full screen menu - slides behind header with clip animation */}
      <div
        className={cn(
          'fixed inset-x-0 top-[73px] bottom-0 bg-white z-40 lg:hidden flex flex-col transition-all duration-300 ease-in-out',
          open
            ? 'opacity-100 max-h-[calc(100vh-73px)]'
            : 'opacity-0 max-h-0 overflow-hidden pointer-events-none',
        )}
      >
        {/* User info */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar
              url={session?.user?.avatar || ''}
              name={session?.user?.name || ''}
              size="sm"
            />
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {getFirstAndLastName(session?.user?.name || '')}
              </p>
              <p className="text-xs font-medium text-gray">
                {userRoleObj[userRole] || userRole}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-2">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue={
              filteredNavigation.find((item) =>
                pathname.startsWith(item.path || ''),
              )?.path
            }
          >
            {filteredNavigation.map((item, index) => {
              const hasPermittedChildren = item.children?.some((child) =>
                checkItemAccess(child),
              )

              if (!hasPermittedChildren) return null

              return (
                <AccordionItem key={index} value={`${item?.path}`}>
                  <AccordionTrigger className="py-3 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <IconComponent
                        icon={item?.icon}
                        className="size-5 text-gray-600"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        {item?.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="pl-2">
                      {item?.children?.map((navChild, childIndex) => (
                        <li key={childIndex} className="mb-1">
                          <Button
                            asChild
                            type="button"
                            variant="neutralGhost"
                            className={cn(
                              'h-10 w-full justify-between px-2',
                              pathname.includes(`${navChild?.path}`)
                                ? 'text-brand-600 bg-brand-25 hover:bg-brand-25'
                                : 'text-gray',
                            )}
                            onClick={handleLinkClick}
                          >
                            <Link
                              href={
                                `${navChild?.path}${navChild?.query || ''}` ||
                                '#'
                              }
                            >
                              <div className="flex items-center gap-3">
                                <IconComponent
                                  icon={navChild?.icon}
                                  className={cn(
                                    'size-5',
                                    pathname.includes(`${navChild?.path}`)
                                      ? 'text-brand'
                                      : navChild?.iconColor || 'text-gray-400',
                                    navChild?.action ? 'text-brand' : '',
                                  )}
                                />
                                <span
                                  className={cn(
                                    'text-xs font-medium',
                                    navChild?.action &&
                                      'font-semibold text-gray-600',
                                  )}
                                >
                                  {navChild?.title}
                                </span>
                              </div>
                              {navChild?.counter ? (
                                <Badge variant="neutralLight">
                                  +{navChild?.counter}
                                </Badge>
                              ) : null}
                            </Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          {/* Perfil and Sair - same style as accordion items */}
          <div className="border-b mt-3 pb-2">
            <button
              type="button"
              className="flex flex-1 items-center gap-3 pt-2 pb-3 w-full text-left"
              onClick={handleProfileClick}
            >
              <IconUser className="size-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">
                Perfil
              </span>
            </button>
          </div>
          <div className="border-b mt-3 pb-2">
            <button
              type="button"
              className="flex flex-1 items-center gap-3 pt-2 pb-3 w-full text-left"
              onClick={handleLogOut}
            >
              <IconLogout className="size-5 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Sair</span>
            </button>
          </div>
        </nav>
      </div>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <MyProfileDialog />
      </Dialog>
    </>
  )
}
