'use client'

// Next
import Link from 'next/link'

// UI
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { ClientActions } from '../../clientes/[id]/components/ClientActions'

// Consts
import { supplierStatusObj } from '@/consts/client'

// UI
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

// Hooks
import { useSupplierById } from '@/hooks/queries/useSupplierById'

interface Props {
  params: {
    id: string
    tab: string
  }
  children: React.ReactNode
}

export default function SupplierDetailLayout({ children, params }: Props) {
  const { data, isLoading } = useSupplierById({ id: params.id })

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
        previousPage="/cadastros/fornecedores"
        badge={supplierStatusObj[data?.status]}
        primaryCta={
          <ClientActions params={params} data={data} entityType="supplier" />
        }
      />
      <Tabs value={params.tab} defaultValue="cadastro">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.tab} asChild>
              <Link href={`/cadastros/fornecedores/${params.id}/${tab.tab}`}>
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
