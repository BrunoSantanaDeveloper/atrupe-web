'use client'

// Next
import { AlertBanner } from '@/components/ui/alert-banner'
import { IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react'
import { missingForRegular } from '@/lib/clientRegular'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
  // A aba ativa vem do último segmento do caminho (dados, orcamentos…): o
  // layout fica em [id] e não recebe o segmento da aba em params
  const pathname = usePathname()
  const activeTab = pathname?.split('/').filter(Boolean).at(-1) ?? 'dados'
  const { data, isLoading } = useClientById({ id: params.id })
  const { canManageClients, hasFeature } = usePlanFeatures()
  const { hasPermission, hasAllPermissions } = usePermissions()

  // Cada aba avançada só aparece se o usuário tiver a permissão do seu conteúdo.
  const canViewTab: Record<string, boolean> = {
    dados: true,
    orcamentos: hasPermission('sale:quotation:view'),
    // Acompanhamento comercial (CRM-4): os contatos de todos os orçamentos
    contatos:
      hasPermission('sale:quotation:view') && hasFeature('sales_follow_up'),
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
      tab: 'dados',
      label: 'Cadastro',
    },
    {
      value: 'QUOTATIONS',
      tab: 'orcamentos',
      label: 'Orçamentos',
      count: totals?.orcamentos,
    },
    {
      value: 'CONTACTS',
      tab: 'contatos',
      label: 'Contatos',
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
    showAdvancedTabs ? allTabs : allTabs.filter((tab) => tab.tab === 'dados')
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
        {/* Pré-cadastro (ALT-4, 26/10/2026): a regra do regularizado é
            automática e do servidor; a faixa diz o que falta */}
        {data?.status === 'PROSPECT' && missingForRegular(data).length > 0 && (
          <AlertBanner
            variant="info"
            icon={IconInfoCircle}
            className="rounded-lg border"
            title="Pré-cadastro"
            description={`Para o cadastro ficar regularizado falta: ${missingForRegular(data).join(', ')}. Dá para vender e orçar mesmo assim; a nota fiscal e a venda a prazo pedem o cadastro completo.`}
          />
        )}
        {/* Bloqueado no limite de crédito (decisão de 24/10/2026): o aviso
            fica em toda aba do cliente */}
        {data?.creditLimit?.blockClient && (
          <AlertBanner
            variant="error"
            icon={IconAlertTriangle}
            className="rounded-lg border"
            title="Cliente bloqueado"
            description="Dá para montar orçamento para este cliente, mas nenhum orçamento é aprovado, vira ordem de serviço nem gera cobrança enquanto ele estiver bloqueado. O desbloqueio é na aba Limite de crédito do cadastro."
          />
        )}
        {/* Pagamento antecipado (PA-1, 12/11/2026): o aviso fica em toda aba */}
        {!data?.creditLimit?.blockClient &&
          data?.creditLimit?.requirePrepayment && (
            <AlertBanner
              variant="warning"
              icon={IconAlertTriangle}
              className="rounded-lg border"
              title="Exige pagamento antecipado"
              description="As vendas deste cliente só viram ordem de serviço depois de pagas: aprovadas, ficam na aba ⚠️ Pendente de Orçamentos até o financeiro baixar o título. A opção fica na aba Limite de crédito do cadastro."
            />
          )}
        <Tabs value={activeTab} defaultValue="dados" variant="pill">
          {tabs.length > 1 && (
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.tab} asChild>
                  <Link href={`/cadastros/clientes/${params.id}/${tab.tab}`}>
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
