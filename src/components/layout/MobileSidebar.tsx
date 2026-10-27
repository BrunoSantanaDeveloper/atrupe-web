'use client'

// React
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

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
import { ThemeToggleGroup } from './ThemeToggleGroup'
import { THEME_SWITCHER } from './theme-options'

// Assets
import favicon from '@public/logo/logo.png'

// Consts
import { HOME_PAGE, SYSTEM_HOME_PAGE } from '@/middleware'
import { getMainNavigation, userRoleObj } from '@/consts/nav'

// Icons
import { IconComponent } from '../common/Icon'
import { IconX, IconUser, IconMenu2, IconLogout } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Hooks
import { useSession } from 'next-auth/react'
import { usePermissions } from '@/hooks/usePermissions'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useFiscalOnboardingStatus } from '@/hooks/useFiscalOnboardingStatus'

// Libs
import { cn, getFirstAndLastName } from '@/lib/utils'
import { planAllowsUsers } from '@/lib/plans/planAccess'
import { DEMO_DATA } from '@/lib/demo'
import { navPermissionAllowed, openNavGroupPath } from './navAccess'
import { useQuickSaleEnabled } from '@/hooks/queries/useQuickSaleEnabled'

// Types
import type { IconProps } from '@tabler/icons-react'
import type { SVGProps } from 'react'

interface NavigationItem {
  icon:
    | React.ComponentType<IconProps>
    | React.ComponentType<SVGProps<SVGSVGElement>>
  title: string
  path?: string
  query?: string
  counter?: number
  action?: boolean
  permission?: string | string[]
  requireAllPermissions?: boolean
  requiredModule?: string
  requiredFeature?: string | string[]
  demo?: boolean
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

  const { hasAnyPermission, hasAllPermissions } = usePermissions()
  const { hasFeature, hasAnyFeature } = usePlanFeatures()
  // "Usar venda rápida" desligado em Configurações › Vendas tira o item
  const quickSaleEnabled = useQuickSaleEnabled()
  const { isPending: isFiscalPending, needsSetup: isFiscalNeedsSetup } =
    useFiscalOnboardingStatus()

  if (!session) return null

  const user = session.user
  const userRole = user.role || 'USER'
  const userIsSystemAdmin = user.isSystemAdmin
  const companyFavicon = session.company?.favicon as string

  const mainNavigation = getMainNavigation(user)

  // Checks if a subscription module (additional feature) is contracted by the company
  const hasContractedModule = (requiredModule?: string): boolean => {
    if (!requiredModule) return true
    return hasFeature(requiredModule)
  }

  // A regra de permissão do item, a mesma do menu do computador (navAccess):
  // antes o celular ignorava o requireAllPermissions e mostrava itens que o
  // computador esconde
  const checkPermission = (item: NavigationItem) =>
    navPermissionAllowed(item, {
      isAdmin: session.user.isAdmin,
      hasAnyPermission,
      hasAllPermissions,
    })

  const checkItemAccess = (item: NavigationItem): boolean => {
    // Tela de demonstração (dados de exemplo): só com a flag
    if (item.demo && !DEMO_DATA) return false

    if (item.path?.includes('novo=venda-rapida') && !quickSaleEnabled) {
      return false
    }

    if (!checkPermission(item)) {
      return false
    }

    if (!hasContractedModule(item.requiredModule)) {
      return false
    }

    // -1 e a chave ausente são ilimitados; só o limite 0 esconde.
    if (item.path?.includes('/colaboradores-e-usuarios')) {
      return planAllowsUsers(session?.company?.plan?.limits)
    }

    // Recurso do plano que o item exige (declarado em consts/nav.ts)
    if (
      item.requiredFeature &&
      !hasAnyFeature(
        Array.isArray(item.requiredFeature)
          ? item.requiredFeature
          : [item.requiredFeature],
      )
    ) {
      return false
    }

    return true
  }

  const filteredNavigation = mainNavigation
    .map((item) => ({
      ...item,
      hasOriginalChildren: !!item.children,
      children: item.children?.filter((child) => checkItemAccess(child)),
    }))
    .filter(
      (item) =>
        checkItemAccess(item) &&
        (item.hasOriginalChildren ? (item.children?.length ?? 0) > 0 : true),
    )

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
          {/* <Button
            type="button"
            variant="neutralGhost"
            size="iconMd"
            RightIcon={IconSearch}
            className="bg-transparent"
          /> */}
          {/* Portal target for filter button from FiltersBar */}
          <div id="mobile-filter-button-portal" />
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
            defaultValue={openNavGroupPath(filteredNavigation, pathname)}
          >
            {filteredNavigation.map((item, index) => {
              const hasChildren = item.hasOriginalChildren

              if (!hasChildren) {
                return (
                  <div key={index} className="border-b border-gray-60 py-2">
                    <Link
                      href={`${item?.path}${item?.query || ''}` || '#'}
                      onClick={handleLinkClick}
                      className={cn(
                        'flex h-11 items-center justify-between w-full rounded-lg px-2 text-left font-medium transition-all hover:no-underline',
                        pathname.includes(`${item?.path}`)
                          ? 'bg-brand-25 text-brand-600 font-semibold'
                          : 'text-gray-600 hover:text-gray-700',
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent
                          icon={item?.icon}
                          size="md"
                          className={cn(
                            pathname.includes(`${item?.path}`)
                              ? 'text-brand'
                              : 'text-gray-600',
                          )}
                        />
                        <span
                          className={cn(
                            'text-sm font-semibold text-gray-700',
                            pathname.includes(`${item?.path}`) &&
                              'text-brand-600',
                          )}
                        >
                          {item?.title}
                        </span>
                      </div>
                      {item?.requiredModule === 'nota_fiscal' &&
                      (isFiscalPending || isFiscalNeedsSetup) ? (
                        <Badge
                          variant={
                            isFiscalPending ? 'warningLight' : 'neutralLight'
                          }
                          className="text-xs px-1.5 py-0.5"
                        >
                          {isFiscalPending ? 'Pendente' : 'Configurar'}
                        </Badge>
                      ) : item?.counter ? (
                        <Badge variant="neutralLight">+{item?.counter}</Badge>
                      ) : null}
                    </Link>
                  </div>
                )
              }

              const hasPermittedChildren = item.children?.some((child) =>
                checkItemAccess(child),
              )

              if (!hasPermittedChildren) return null

              return (
                <AccordionItem
                  key={index}
                  value={`${item?.path}`}
                  className="border-gray-60 py-2"
                >
                  <AccordionTrigger
                    asHeading={false}
                    className="h-11 rounded-lg px-2 py-0 hover:no-underline data-[state=open]:bg-brand-25 [&[data-state=open]_svg]:text-brand-600 [&[data-state=open]_span]:text-brand-600"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        icon={item?.icon}
                        size="md"
                        className="text-gray-600"
                      />
                      <span
                        className={cn('text-sm font-semibold text-gray-700')}
                      >
                        {item?.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2">
                    <ul className="ml-4 space-y-1 border-l border-gray-200 pl-3">
                      {item?.children?.map((navChild, childIndex) => (
                        <li key={childIndex}>
                          <Button
                            asChild
                            type="button"
                            variant="neutralGhost"
                            className={cn(
                              'h-10 w-full justify-between px-2',
                              pathname.includes(`${navChild?.path}`)
                                ? 'text-brand-600 bg-brand-25 hover:bg-brand-25'
                                : 'text-gray-500',
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
                                  size="md"
                                  className={cn(
                                    pathname.includes(`${navChild?.path}`)
                                      ? 'text-brand'
                                      : 'text-gray-500',
                                    navChild?.action ? 'text-brand' : '',
                                  )}
                                />
                                <span
                                  className={cn(
                                    'text-sm font-medium',
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
          <div className="border-b border-gray-200 mt-3 pb-2">
            <button
              type="button"
              className="flex flex-1 items-center gap-3 pt-2 pb-3 w-full text-left"
              onClick={handleProfileClick}
            >
              <IconUser
                aria-hidden
                size={ICON_SIZE.md}
                className="text-gray-600"
              />
              <span className="text-sm font-semibold text-gray-700">
                Perfil
              </span>
            </button>
          </div>
          {/* Escondido até a mudança tema-claro-escuro ser arquivada */}
          {THEME_SWITCHER && (
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 mt-3 pt-2 pb-3">
              <span className="text-sm font-semibold text-gray-700">Tema</span>
              <ThemeToggleGroup />
            </div>
          )}
          <div className="border-b border-gray-200 mt-3 pb-2">
            <button
              type="button"
              className="flex flex-1 items-center gap-3 pt-2 pb-3 w-full text-left"
              onClick={handleLogOut}
            >
              <IconLogout
                aria-hidden
                size={ICON_SIZE.md}
                className="text-gray-600"
              />
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
