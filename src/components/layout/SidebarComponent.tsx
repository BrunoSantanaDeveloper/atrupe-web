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
import logoLight from '@public/logo/logo-text-light.png'

// Libs
import { cn, getFirstAndLastName } from '@/lib/utils'
import { planAllowsUsers } from '@/lib/plans/planAccess'
import { DEMO_DATA } from '@/lib/demo'
import { navPermissionAllowed, openNavGroupPath } from './navAccess'
import { useQuickSaleEnabled } from '@/hooks/queries/useQuickSaleEnabled'

// Consts
import { HOME_PAGE, SYSTEM_HOME_PAGE } from '@/middleware'
import { getMainNavigation, userRoleObj } from '@/consts/nav'

// Third-party
import { setCookie } from 'cookies-next'

// Icons
import { IconComponent } from '../common/Icon'
import { IconChevronLeft } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Types
import type { Session } from 'next-auth'
import type { MainNavigationType, SecondaryNavigationType } from '@/consts/nav'
import { usePermissions } from '@/hooks/usePermissions'
import { useFollowUpSummary } from '@/hooks/queries/useFollowUp'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { useFiscalOnboardingStatus } from '@/hooks/useFiscalOnboardingStatus'
import { usePendingPath } from '@/hooks/usePendingPath'
import { useSession } from 'next-auth/react'

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
  // Item ativo marcado no clique, antes de a página nova chegar
  const { currentPath, markPending } = usePendingPath()

  const user = session.user
  const userRole = user.role || 'USER'
  const userIsSystemAdmin = user.isSystemAdmin
  const companyLogo = session.company.logo as string
  // Versão do logo para o tema escuro: a da empresa, quando ela cadastrou;
  // sem logo da empresa, a da Atrupe com letras claras
  const darkLogo = companyLogo ? session.company.logoDark || '' : logoLight
  const companyFavicon = session.company.favicon as string

  const mainNavigation = getMainNavigation(user)

  const { hasAnyPermission, hasAllPermissions } = usePermissions()
  const { hasFeature, hasAnyFeature } = usePlanFeatures()
  // "Usar venda rápida" desligado em Configurações › Vendas tira o item
  const quickSaleEnabled = useQuickSaleEnabled()
  const { isPending: isFiscalPending, needsSetup: isFiscalNeedsSetup } =
    useFiscalOnboardingStatus()

  // Checks if a subscription module (additional feature) is contracted by the company
  const hasContractedModule = (requiredModule?: string): boolean => {
    if (!requiredModule) return true
    return hasFeature(requiredModule)
  }

  // A regra de permissão do item, a mesma do menu do celular (navAccess)
  const checkPermission = (item: MainNavigationType) =>
    navPermissionAllowed(item, {
      isAdmin: session.user.isAdmin,
      hasAnyPermission,
      hasAllPermissions,
    })

  // Função que verifica se um item deve ser exibido baseado em permissões, features do plano e módulos contratados
  const checkItemAccess = (item: MainNavigationType): boolean => {
    // Tela de demonstração (dados de exemplo): só com a flag
    if (item.demo && !DEMO_DATA) return false

    if (item.path?.includes('novo=venda-rapida') && !quickSaleEnabled) {
      return false
    }

    // Primeiro verifica permissões
    if (!checkPermission(item)) {
      return false
    }

    // Verifica se o módulo contratado está disponível
    if (!hasContractedModule(item.requiredModule)) {
      return false
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

    // A tela foi para outro lugar neste plano (Papéis em Materiais no PRO)
    if (item.hiddenWithFeature && hasFeature(item.hiddenWithFeature)) {
      return false
    }

    // Controle de Colaboradores e Usuários - baseado no limite de usuários
    // (-1 e a chave ausente são ilimitados; só o limite 0 esconde)
    if (item.path?.includes('/colaboradores-e-usuarios')) {
      return planAllowsUsers(session?.company?.plan?.limits)
    }

    // Outras verificações de features podem ser adicionadas aqui

    return true
  }

  // O contador de "para retomar" no menu Orçamentos (CRM-3, 27/10/2026):
  // contato até hoje ou proposta vencendo, no escopo do vendedor
  const canSeeQuotations = hasAnyPermission(['sale:quotation:view'])
  const { data: followUp } = useFollowUpSummary(
    canSeeQuotations && hasFeature(FEATURES.SALES.SALES_FOLLOW_UP),
  )
  const withCounter = <T extends { path?: string; counter?: number }>(
    item: T,
  ): T =>
    item.path === '/vendas/orcamentos' && followUp?.due
      ? { ...item, counter: followUp.due }
      : item

  // Filtra os itens de navegação baseado nas permissões e features do plano
  const filteredNavigation = mainNavigation
    .map((item) => ({
      ...withCounter(item),
      hasOriginalChildren: !!item.children,
      children: item.children
        ?.filter((child) => checkItemAccess(child))
        .map((child) => withCounter(child)),
    }))
    .filter(
      (item) =>
        checkItemAccess(item) &&
        (item.hasOriginalChildren ? (item.children?.length ?? 0) > 0 : true),
    )

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
        'bg-white border-r border-gray-200 hidden lg:block transition-[min-width,max-width] ease-out duration-slow text-nowrap overflow-hidden space-y-4',
        collapsed ? 'max-w-24 min-w-24' : 'max-w-[296px] min-w-[296px]',
      )}
    >
      <TooltipProvider>
        <div className="flex flex-col h-full">
          {/* header */}
          <div className="border-b border-gray-200">
            <div className="flex items-center justify-between h-28 transition-all ease-out duration-slow px-6 relative">
              <Link
                href={userIsSystemAdmin ? SYSTEM_HOME_PAGE : HOME_PAGE}
                className="flex items-center"
              >
                <Image
                  src={companyLogo || logo}
                  alt="logo empresa"
                  width={145}
                  height={35}
                  className={cn(
                    'min-w-[145px] max-h-28 h-full transition-all ease-out duration-slow object-contain',
                    collapsed ? '-ml-44 opacity-0' : 'ml-0',
                    // No tema escuro troca para a versão de letras claras
                    // (da empresa ou da Atrupe), quando ela existe
                    !!darkLogo && 'dark:hidden',
                  )}
                />
                {!!darkLogo && (
                  <Image
                    src={darkLogo}
                    alt="logo empresa"
                    width={145}
                    height={35}
                    className={cn(
                      'hidden dark:block min-w-[145px] max-h-28 h-full transition-all ease-out duration-slow object-contain',
                      collapsed ? '-ml-44 opacity-0' : 'ml-0',
                    )}
                  />
                )}
                <Image
                  src={companyFavicon || favicon}
                  alt="logo empresa"
                  width={38}
                  height={38}
                  className={cn(
                    'min-w-[38px] max-h-28 h-full transition-all ease-out duration-slow object-contain',
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
                  aria-hidden
                  size={ICON_SIZE.sm}
                  className={cn(
                    'text-gray transition-transform ease-out duration-slow',
                    collapsed && 'rotate-180',
                  )}
                />
              </Button>
            </div>
          </div>

          <div>
            {/* User info */}
            <div className="border-b border-gray-200 mb-3">
              <div
                className={cn(
                  'flex justify-between items-center gap-3 h-28 transition-all ease-out duration-slow px-6 relative',
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
                      'transition-all ease-out duration-slow',
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
          <ScrollArea className="flex-1">
            <nav
              className="overflow-hidden text-nowrap"
              hidden={!!secondaryNav}
            >
              <Accordion
                type="single"
                collapsible
                className="w-full px-4"
                defaultValue={openNavGroupPath(filteredNavigation, pathname)}
              >
                {filteredNavigation.map((item, index) => {
                  const hasChildren = item.hasOriginalChildren

                  if (!hasChildren) {
                    return (
                      <div key={index} className="border-b border-gray-60 py-2">
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
                            <Link
                              href={`${item?.path}${item?.query || ''}` || '#'}
                              onClick={markPending(item?.path)}
                              className={cn(
                                'flex flex-1 mr-2 h-11 items-center justify-between font-medium transition-all hover:no-underline rounded-lg',
                                currentPath.includes(`${item?.path}`)
                                  ? 'bg-brand-25 text-brand-600 font-semibold'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-700',
                              )}
                            >
                              <div
                                className={cn(
                                  'flex items-center transition-all ease-out duration-slow min-w-52',
                                  collapsed ? 'gap-10 px-5' : 'gap-4 px-2',
                                )}
                              >
                                <IconComponent
                                  icon={item?.icon}
                                  size="md"
                                  className={cn(
                                    currentPath.includes(`${item?.path}`)
                                      ? 'text-brand'
                                      : 'text-gray-600',
                                  )}
                                />
                                <span
                                  className={cn(
                                    'text-gray-700 text-sm font-semibold transition-all ease-out duration-slow',
                                    currentPath.includes(`${item?.path}`) &&
                                      'text-brand',
                                    collapsed && 'opacity-0',
                                  )}
                                >
                                  {item?.title}
                                </span>
                              </div>
                              {item?.requiredModule === 'nota_fiscal' &&
                              (isFiscalPending || isFiscalNeedsSetup) ? (
                                <Badge
                                  variant={
                                    isFiscalPending
                                      ? 'warningLight'
                                      : 'neutralLight'
                                  }
                                  className={cn(
                                    'text-xs px-1.5 py-0.5 transition-all ease-out duration-slow mr-2',
                                    collapsed && 'opacity-0',
                                  )}
                                >
                                  {isFiscalPending ? 'Pendente' : 'Configurar'}
                                </Badge>
                              ) : item?.counter ? (
                                <Badge
                                  variant="light"
                                  className={cn(
                                    'transition-all ease-out duration-slow mr-2',
                                    collapsed && 'opacity-0',
                                  )}
                                >
                                  {item?.counter}
                                </Badge>
                              ) : null}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            hidden={!collapsed}
                            className="-ml-40"
                          >
                            <p>{item?.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )
                  }

                  // Verifica se há pelo menos um item filho com permissão
                  const hasPermittedChildren = item.children?.some((child) =>
                    checkItemAccess(child),
                  )

                  // Se não houver itens filhos com permissão, não renderiza o item
                  if (!hasPermittedChildren) return null

                  return (
                    <Tooltip key={index} delayDuration={300}>
                      <AccordionItem
                        value={`${item?.path}`}
                        className="border-gray-60 py-2"
                      >
                        {/* Grupo aberto vira pílula Brand/25 (Figma §3.12,
                            05/10/2026), para separar o módulo dos subitens */}
                        <AccordionTrigger
                          asHeading={false}
                          className="h-11 rounded-lg py-0 pr-3 hover:bg-gray-50 data-[state=open]:bg-brand-25 data-[state=open]:text-brand-600 [&[data-state=open]_svg]:text-brand-600 [&[data-state=open]_span]:text-brand-600"
                        >
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'flex items-center transition-all ease-out duration-slow min-w-52',
                                collapsed ? 'gap-10 px-5' : 'gap-4 px-2',
                              )}
                            >
                              <IconComponent
                                icon={item?.icon}
                                size="md"
                                className="text-gray-600"
                              />
                              <span
                                className={cn(
                                  'text-gray-700 text-sm font-semibold transition-all ease-out duration-slow',
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
                        <AccordionContent className="pt-2">
                          {/* Subitens recuados, com linha-guia à esquerda e
                              respiro entre eles, para o módulo e os subitens
                              não parecerem a mesma coisa (05/10/2026) */}
                          <ul
                            className={cn(
                              'space-y-1 transition-all ease-out duration-slow',
                              collapsed
                                ? ''
                                : 'ml-5 border-l border-gray-200 pl-3',
                            )}
                          >
                            {item?.children?.map((navChild, childIndex) => (
                              <li
                                key={childIndex}
                                className="flex items-center"
                              >
                                <Tooltip delayDuration={300}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      asChild
                                      type="button"
                                      variant="none"
                                      className={cn(
                                        'h-10 w-full justify-between rounded-lg transition-all ease-out duration-slow',
                                        collapsed ? 'px-5' : 'px-2',
                                        currentPath.includes(
                                          `${navChild?.path}`,
                                        )
                                          ? 'text-brand-600 bg-brand-25 hover:bg-brand-50 font-semibold'
                                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                                      )}
                                    >
                                      <Link
                                        href={
                                          `${navChild?.path}${navChild?.query || ''}` ||
                                          '#'
                                        }
                                        onClick={markPending(navChild?.path)}
                                      >
                                        <div className="flex items-center gap-4">
                                          <IconComponent
                                            icon={navChild?.icon}
                                            size="md"
                                            className={cn(
                                              currentPath.includes(
                                                `${navChild?.path}`,
                                              )
                                                ? 'text-brand'
                                                : 'text-gray-500',
                                              navChild?.action
                                                ? 'text-brand'
                                                : '',
                                            )}
                                          />
                                          <span
                                            className={cn(
                                              'text-sm font-medium transition-all ease-out duration-slow',
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
                                        {navChild?.requiredModule ===
                                          'nota_fiscal' &&
                                        (isFiscalPending ||
                                          isFiscalNeedsSetup) ? (
                                          <Badge
                                            variant={
                                              isFiscalPending
                                                ? 'warningLight'
                                                : 'neutralLight'
                                            }
                                            className={cn(
                                              'text-xs px-1.5 py-0.5 transition-all ease-out duration-slow',
                                              collapsed && 'opacity-0',
                                            )}
                                          >
                                            {isFiscalPending
                                              ? 'Pendente'
                                              : 'Configurar'}
                                          </Badge>
                                        ) : navChild?.counter ? (
                                          <Badge
                                            variant="light"
                                            className={cn(
                                              'transition-all ease-out duration-slow',
                                              collapsed && 'opacity-0',
                                            )}
                                          >
                                            {navChild?.counter}
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

          {process.env.NODE_ENV === 'development' && (
            <div className="border-t border-gray-200 p-4">
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500">
                  Plano: {session.company.plan?.name}
                </p>
              )}
            </div>
          )}

          {/* WhatsApp Link */}
          {/* <div className="border-t p-4">
            <Button
              asChild
              type="button"
              variant="ghost"
              className={cn(
                'w-full h-12 justify-start transition-all ease-out duration-slow hover:bg-green-50 hover:text-green-600',
                collapsed ? 'px-5' : 'px-2',
              )}
            >
              <a
                href="https://wa.me/554721229194"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4"
              >
                <IconComponent
                  icon={IconBrandWhatsapp}
                  className="w-6 h-6 text-green-600 flex-shrink-0"
                />
                <span
                  className={cn(
                    'text-sm font-medium transition-all ease-out duration-slow',
                    collapsed ? 'ml-4 opacity-0' : 'mr-0',
                  )}
                >
                  Suporte WhatsApp
                </span>
              </a>
            </Button>
          </div> */}
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
                        'justify-between transition-all ease-out duration-slow',
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
