'use client'

// Next
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// UI

// Components
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ClientActions } from '../../clientes/[id]/components/ClientActions'
import { DetailCardSkeleton } from '../../clientes/[id]/components/DetailCardSkeleton'

// Consts
import { supplierStatusObj } from '@/consts/supplier'

// UI
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

// Hooks
import { useSupplierById } from '@/hooks/queries/useSupplierById'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePermissions } from '@/hooks/usePermissions'

interface Props {
  params: {
    id: string
    tab: string
  }
  children: React.ReactNode
}

export default function SupplierDetailLayout({ children, params }: Props) {
  // A aba ativa vem do último segmento do caminho (dados, orcamentos…): o
  // layout fica em [id] e não recebe o segmento da aba em params
  const pathname = usePathname()
  const activeTab = pathname?.split('/').filter(Boolean).at(-1) ?? 'dados'
  const { data, isLoading } = useSupplierById({ id: params.id })
  const { canManageSuppliers } = usePlanFeatures()
  const { hasAllPermissions } = usePermissions()

  const showAdvancedTabs = canManageSuppliers()

  // A aba Financeiro só aparece se o usuário tiver permissão do fluxo/valores.
  const canViewTab: Record<string, boolean> = {
    dados: true,
    financeiro: hasAllPermissions([
      'financial:flow:view',
      'values:values:view',
    ]),
  }

  // Fornecedor não possui orçamentos nem ordens de serviço (são documentos de
  // venda, ligados a cliente). A única aba adicional é o Financeiro (contas a
  // pagar), liberada pelo plano Lite via `supplier_additional_tabs`.
  const allTabs: TabNavType[] = [
    {
      value: 'REGISTER',
      tab: 'dados',
      label: 'Cadastro',
    },
    {
      value: 'FINANCIAL',
      tab: 'financeiro',
      label: 'Financeiro',
    },
  ]

  const tabs = (
    showAdvancedTabs ? allTabs : allTabs.filter((tab) => tab.tab === 'dados')
  ).filter((tab) => canViewTab[tab.tab] ?? true)

  return (
    <PermissionGate
      permissions={['register:supplier:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar fornecedor.
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
          previousPage="/cadastros/fornecedores"
          badge={supplierStatusObj[data?.status]}
          primaryCta={
            <ClientActions params={params} data={data} entityType="supplier" />
          }
        />
        <Tabs value={activeTab} defaultValue="dados" variant="pill">
          {tabs.length > 1 && (
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.tab} asChild>
                  <Link
                    href={`/cadastros/fornecedores/${params.id}/${tab.tab}`}
                  >
                    <span>{tab.label}</span>
                    {tab?.count && tab?.count > 0 ? (
                      <Badge
                        variant={
                          activeTab === tab.tab ? 'light' : 'neutralLight'
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
