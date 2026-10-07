'use client'

// Next
import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PermissionGate } from '@/components/common/PermissionGate'

// Components
import { ClientActions } from './components/ClientActions'
import { DetailCardSkeleton } from './components/DetailCardSkeleton'
import { TabNavType, Topbar } from '@/components/common/Topbar'

// Consts
import { clientStatusObj } from '@/consts/client'

// Hooks
import { useClientById } from '@/hooks/queries/useClient'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePermissions } from '@/hooks/usePermissions'

interface Props {
  params: {
    id: string
    tab: string
  }
  children: React.ReactNode
}

export default function ClientDetailLayout({ children, params }: Props) {
  const { data, isLoading } = useClientById({ id: params.id })
  const { canManageClients } = usePlanFeatures()
  const { hasPermission, hasAllPermissions } = usePermissions()

  // Cada aba avançada só aparece se o usuário tiver a permissão do seu conteúdo.
  const canViewTab: Record<string, boolean> = {
    cadastro: true,
    orcamentos: hasPermission('sale:quotation:view'),
    ordens: hasPermission('sale:order:view'),
    financeiro: hasAllPermissions([
      'financial:flow:view',
      'values:values:view',
    ]),
  }

  const totals: { [key: string]: number } = {
    orcamentos: data?.quotationsQuantity,
    ordens: data?.ordersQuantity,
  }

  const showAdvancedTabs = canManageClients()

  const allTabs: TabNavType[] = [
    {
      value: 'REGISTER',
      tab: 'cadastro',
      label: 'Cadastro',
    },
    {
      value: 'QUOTATIONS',
      tab: 'orcamentos',
      label: 'Orçamentos',
      count: totals?.orcamentos,
    },
    {
      value: 'ORDERS',
      tab: 'ordens',
      label: 'Ordens de serviço',
      count: totals?.ordens,
    },
    {
      value: 'FINANCIAL',
      tab: 'financeiro',
      label: 'Financeiro',
    },
  ]

  const tabs = (
    showAdvancedTabs ? allTabs : allTabs.filter((tab) => tab.tab === 'cadastro')
  ).filter((tab) => canViewTab[tab.tab] ?? true)

  return (
    <PermissionGate
      permissions={['register:client:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar cliente.
        </div>
      }
    >
      <div className="space-y-5">
        <Topbar
          title={data?.general?.name}
          supportText={
            data?.type === 'PERSON'
              ? 'PF'
              : data?.type === 'COMPANY'
                ? 'PJ'
                : ''
          }
          previousPage="/cadastros/clientes"
          badge={clientStatusObj[data?.status]}
          primaryCta={
            <ClientActions params={params} data={data} entityType="client" />
          }
        />
        <Tabs value={params.tab} defaultValue="cadastro" variant="pill">
          {tabs.length > 1 && (
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.tab} asChild>
                  <Link href={`/cadastros/clientes/${params.id}/${tab.tab}`}>
                    <span>{tab.label}</span>
                    {tab?.count && tab?.count > 0 ? (
                      <Badge
                        variant={
                          params.tab === tab.tab ? 'light' : 'neutralLight'
                        }
                        className="ml-2"
                      >
                        {tab.count}
                      </Badge>
                    ) : null}
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          )}
        </Tabs>
        <div>
          {isLoading ? (
            <DetailCardSkeleton />
          ) : (
            <div className="space-y-3">{children}</div>
          )}
        </div>
      </div>
    </PermissionGate>
  )
}
