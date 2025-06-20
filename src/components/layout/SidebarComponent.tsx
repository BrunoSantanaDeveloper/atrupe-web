'use client'

// React
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

// UI
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

// Components
import { Avatar } from '../AvatarComponent'
import { UserDropdown } from './UserDropdown'

// Assets
import favicon from '@public/logo/logo.png'
import logo from '@public/logo/logo-text.png'

// Libs
import { cn, getFirstAndLastName } from '@/lib/utils'

// Consts
import { getMainNavigation, userRoleObj } from '@/consts/nav'

// Third-party
import { setCookie } from 'cookies-next'

// Icons
import { IconComponent } from '../common/Icon'
import { IconChevronLeft } from '@tabler/icons-react'

// Types
import type { Session } from 'next-auth'
import type { SecondaryNavigationType } from '@/consts/nav'
import type { IconProps } from '@tabler/icons-react'
import type { SVGProps } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useSession } from 'next-auth/react'

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
  permission?: string
  children?: NavigationItem[]
}

interface Props {
  defaultCollapsed: boolean
  session: Session
  secondaryNavigation?: SecondaryNavigationType
}

export function SidebarComponent(props: Props) {
  const { defaultCollapsed, secondaryNavigation } = props

  const { data: currentSession } = useSession()
  const session = currentSession || props.session

  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [secondaryNav] = useState<SecondaryNavigationType | undefined>(
    secondaryNavigation,
  )

  const pathname = usePathname()

  const userRole = session.user.role || 'USER'
  const companyLogo = session.company.logo as string
  const companyFavicon = session.company.favicon as string

  const mainNavigation = getMainNavigation(userRole)

  const { hasPermission } = usePermissions()
  const {
    canManageSectors,
    getUserLimit,
    getRejectionReasonsType,
    hasFinancialModule,
  } = usePlanFeatures()

  // TODO: Verificar se o usuário é admin com isAdmin
  // Função auxiliar que verifica permissão considerando admin
  const checkPermission = (permission?: string) => {
    // return !permission || session.user.isAdmin || hasPermission(permission)
    return (
      !permission || session.user.role === 'Admin' || hasPermission(permission)
    )
  }

  // Função que verifica se um item deve ser exibido baseado em permissões e features do plano
  const checkItemAccess = (item: NavigationItem): boolean => {
    // Primeiro verifica permissões
    if (!checkPermission(item.permission)) {
      return false
    }

    // Depois verifica features específicas do plano baseado no path
    // Controle de Setores
    if (item.path?.includes('/setores')) {
      return canManageSectors()
    }

    // Controle de Colaboradores e Usuários - baseado no limite de usuários
    if (item.path?.includes('/colaboradores-e-usuarios')) {
      return getUserLimit() > 0
    }

    // Controle de PDV/Frente de Caixa
    if (item.path?.includes('/frente-de-caixa')) {
      return hasFinancialModule('pdv')
    }

    // Controle de Controle de Caixa
    if (item.path?.includes('/controle-de-caixa')) {
      return hasFinancialModule('cash')
    }

    // Controle de A Receber
    if (item.path?.includes('/a-receber')) {
      return hasFinancialModule('receivable')
    }

    // Controle de A Pagar
    if (item.path?.includes('/a-pagar')) {
      return hasFinancialModule('payable')
    }

    // Controle de Motivos de Rejeição e Cancelamento
    if (item.path?.includes('/motivos-de-rejeicao-e-cancelamento')) {
      return getRejectionReasonsType() !== 'none'
    }

    // Outras verificações de features podem ser adicionadas aqui

    return true
  }

  // Filtra os itens de navegação baseado nas permissões e features do plano
  const filteredNavigation = mainNavigation
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => checkItemAccess(child)),
    }))
    .filter((item) => checkItemAccess(item) && (item.children?.length ?? 0) > 0)

  const handleCollapse = () => {
    setCollapsed((prev) => !prev)

    const sidebarCollapsed = !collapsed

    setCookie('sidebarCollapsed', JSON.stringify(sidebarCollapsed), {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 365 days
    })
  }

  return (
    <aside
      className={cn(
        'bg-white border-r hidden lg:block transition-all ease-in-out duration-500 text-nowrap overflow-hidden space-y-4',
        collapsed ? 'max-w-24 min-w-24' : 'max-w-[296px] min-w-[296px]',
      )}
    >
      <TooltipProvider>
        <div className="flex flex-col h-full">
          {/* header */}
          <div className="border-b">
            <div className="flex items-center justify-between h-28 transition-all ease-in-out duration-500 px-6 relative">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src={companyLogo || logo}
                  alt="logo empresa"
                  width={145}
                  height={35}
                  className={cn(
                    'min-w-[145px] max-h-28 h-full transition-all ease-in-out duration-500 object-contain',
                    collapsed ? '-ml-44 opacity-0' : 'ml-0',
                  )}
                />
                <Image
                  src={companyFavicon || favicon}
                  alt="logo empresa"
                  width={38}
                  height={38}
                  className={cn(
                    'min-w-[38px] max-h-28 h-full transition-all ease-in-out duration-500 object-contain',
                    collapsed ? 'ml-9' : 'ml-44 opacity-0',
                  )}
                />
              </Link>
              <Button
                type="button"
                size="iconXs"
                variant="neutralGhost"
                className={cn(
                  'rounded-full absolute right-2',
                  collapsed
                    ? 'shadow-lg outline outline-1 outline-gray-200 bg-white'
                    : '',
                )}
                onClick={handleCollapse}
              >
                <IconChevronLeft
                  className={cn(
                    'text-gray transition-transform duration-300',
                    collapsed && 'rotate-180',
                  )}
                />
              </Button>
            </div>
          </div>

          <div>
            {/* User info */}
            <div className="border-b mb-3">
              <div
                className={cn(
                  'flex justify-between items-center gap-3 h-28 transition-all ease-in-out duration-500 px-6 relative',
                  secondaryNav && 'hidden',
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    url={session?.user?.avatar || ''}
                    name={session?.user?.name || ''}
                    size="sm"
                  />
                  <div
                    className={cn(
                      'transition-all ease-in-out duration-500',
                      collapsed ? 'ml-4 opacity-0' : 'ml-0',
                    )}
                  >
                    <p className="text-sm font-semibold text-gray-700">
                      {getFirstAndLastName(session?.user?.name || '')}
                    </p>
                    <p className="text-xs font-medium text-gray">
                      {userRoleObj[userRole] || userRole}
                    </p>
                  </div>
                </div>
                <UserDropdown collapsed={collapsed} />
              </div>
            </div>
          </div>

          {/* Main navigation */}
          <ScrollArea>
            <nav
              className="overflow-hidden text-nowrap"
              hidden={!!secondaryNav}
            >
              <Accordion
                type="single"
                collapsible
                className="w-full px-4"
                defaultValue={`/${pathname.split('/')[1]}`}
              >
                {filteredNavigation.map((item, index) => {
                  // Verifica se há pelo menos um item filho com permissão
                  const hasPermittedChildren = item.children?.some((child) =>
                    checkItemAccess(child),
                  )

                  // Se não houver itens filhos com permissão, não renderiza o item
                  if (!hasPermittedChildren) return null

                  return (
                    <Tooltip key={index} delayDuration={300}>
                      <AccordionItem value={`${item?.path}`}>
                        <AccordionTrigger>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'flex items-center transition-all ease-in-out duration-500 min-w-52',
                                collapsed ? 'gap-10 px-5' : 'gap-4 px-2',
                              )}
                            >
                              <IconComponent
                                icon={item?.icon}
                                className="text-gray-600"
                              />
                              <span
                                className={cn(
                                  'text-gray-700 text-sm font-semibold transition-all ease-in-out duration-500',
                                  collapsed && 'opacity-0',
                                )}
                              >
                                {item?.title}
                              </span>
                            </div>
                          </TooltipTrigger>
                        </AccordionTrigger>
                        <TooltipContent
                          side="right"
                          hidden={!collapsed}
                          className="-ml-40"
                        >
                          <p>{item?.title}</p>
                        </TooltipContent>
                        <AccordionContent>
                          <ul>
                            {item?.children?.map((navChild, childIndex) => (
                              <li
                                key={childIndex}
                                className="flex items-center mb-1"
                              >
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      asChild
                                      type="button"
                                      variant="neutralGhost"
                                      className={cn(
                                        'h-10 w-full justify-between transition-all ease-in-out duration-500',
                                        collapsed ? 'px-5' : 'px-2',
                                        pathname.includes(`${navChild?.path}`)
                                          ? 'text-brand-600 bg-brand-25 hover:bg-brand-25'
                                          : 'text-gray',
                                      )}
                                    >
                                      <Link
                                        href={
                                          `${navChild?.path}${navChild?.query || ''}` ||
                                          '#'
                                        }
                                      >
                                        <div className="flex items-center gap-4">
                                          <IconComponent
                                            icon={navChild?.icon}
                                            className={cn(
                                              'size-6',
                                              pathname.includes(
                                                `${navChild?.path}`,
                                              )
                                                ? 'text-brand'
                                                : navChild?.iconColor ||
                                                    'text-gray-400',
                                              navChild?.action
                                                ? 'text-brand'
                                                : '',
                                            )}
                                          />
                                          <span
                                            className={cn(
                                              'text-xs font-medium transition-all ease-in-out duration-500',
                                              collapsed
                                                ? 'ml-4 opacity-0'
                                                : 'mr-0',
                                              navChild?.action &&
                                                'font-semibold text-gray-600',
                                            )}
                                          >
                                            {navChild?.title}
                                          </span>
                                        </div>
                                        {navChild?.counter ? (
                                          <Badge
                                            variant="neutralLight"
                                            className={cn(
                                              'transition-all ease-in-out duration-500',
                                              collapsed && 'opacity-0',
                                            )}
                                          >
                                            +{navChild?.counter}
                                          </Badge>
                                        ) : null}
                                      </Link>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="right"
                                    hidden={!collapsed}
                                  >
                                    <p>{navChild?.title}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Tooltip>
                  )
                })}
              </Accordion>
            </nav>
          </ScrollArea>
        </div>

        {/* Secondary navigation */}
        {/* <nav
          className="overflow-hidden text-nowrap px-4"
          hidden={!secondaryNav}
        >
          <div className="flex items-center gap-2 mb-2">
            <Button asChild type="button" size="icon" variant="neutralGhost">
              <Link href={secondaryNav?.parentPath || ''}>
                <ArrowLeft size={18} />
              </Link>
            </Button>
            {!collapsed ? (
              <p className="text-sm font-semibold">{secondaryNav?.title}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            {secondaryNav?.items?.map((item, index) => {
              const spn = pathname?.split('/') || '' // split pathname
              const sip = item?.path?.split('/') || '' // split item path

              return (
                <Tooltip key={index} delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      type="button"
                      className={cn(
                        'justify-between transition-all ease-in-out duration-500',
                        collapsed ? 'px-5' : 'mx-4',
                        spn[spn.length - 1] === sip[sip.length - 1] ||
                          spn[spn.length - 2] === sip[sip.length - 1]
                          ? 'text-brand-600 bg-brand-25 hover:bg-brand-25'
                          : 'text-gray',
                      )}
                      variant="neutralGhost"
                    >
                      <Link href={`${item?.path}`}>
                        <div className="flex items-center gap-4">
                          {item?.icon ? (
                            <IconComponent icon={item?.icon} />
                          ) : (
                            <Skeleton className="w-6 h-6" />
                          )}
                          {!collapsed ? (
                            <span className="text-xs font-semibold">
                              {item?.title}
                            </span>
                          ) : null}
                        </div>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" hidden={!collapsed}>
                    <p>{item?.title}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        </nav> */}
      </TooltipProvider>
    </aside>
  )
}
