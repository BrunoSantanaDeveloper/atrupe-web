'use client'

// Next
import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Components
import { ClientActions } from './components/ClientActions'
import { TabNavType, Topbar } from '@/components/common/Topbar'

// Consts
import { clientStatusObj } from '@/consts/client'

// Hooks
import { useClientById } from '@/hooks/queries/useClient'

interface Props {
  params: {
    id: string
    tab: string
  }
  children: React.ReactNode
}

export default function ClientDetailLayout({ children, params }: Props) {
  const { data, isLoading } = useClientById({ id: params.id })

  const totals: { [key: string]: number } = {
    orcamentos: data?.quotationsQuantity,
    ordens: data?.ordersQuantity,
  }

  const tabs: TabNavType[] = [
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

  return (
    <div className="space-y-5">
      <Topbar
        title={data?.general?.name}
        supportText={
          data?.type === 'PERSON' ? 'PF' : data?.type === 'COMPANY' ? 'PJ' : ''
        }
        previousPage="/cadastros/clientes"
        badge={clientStatusObj[data?.status]}
        primaryCta={
          <ClientActions params={params} data={data} entityType="client" />
        }
      />
      <Tabs value={params.tab} defaultValue="cadastro">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.tab} asChild>
              <Link href={`/cadastros/clientes/${params.id}/${tab.tab}`}>
                <span>{tab.label}</span>
                {tab?.count && tab?.count > 0 ? (
                  <Badge
                    variant={params.tab === tab.tab ? 'light' : 'neutralLight'}
                    className="ml-2"
                  >
                    {tab.count}
                  </Badge>
                ) : null}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div>
        {isLoading ? (
          <Skeleton className="h-[300px]" />
        ) : (
          <div className="space-y-3">{children}</div>
        )}
      </div>
    </div>
  )
}
