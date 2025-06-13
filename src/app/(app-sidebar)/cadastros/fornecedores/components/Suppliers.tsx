'use client'

// React
import { useState } from 'react'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { NewSupplier, NewSupplierTriggerButton } from './NewSupplier'
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { SuppliersData } from './SuppliersTable/SuppliersData'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconBuildingCommunity } from '@tabler/icons-react'

type TotalsType = {
  todos: number
  ativos: number
  inativos: number
}

async function getTotals(): Promise<TotalsType | undefined> {
  try {
    const promises = [
      getDataOld({ route: 'supplierRoute' }),
      getDataOld({ route: 'supplierRoute', filters: { status: 'ACTIVE' } }),
      getDataOld({ route: 'supplierRoute', filters: { status: 'INACTIVE' } }),
    ]
    const [todos, ativos, inativos] = await Promise.all(promises)

    return {
      todos: todos.total,
      ativos: ativos.total,
      inativos: inativos.total,
    }
  } catch (error) {
    console.error(error)
  }
}

export function Suppliers({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState('')

  const { data: totals, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['suppliers-totals'],
    queryFn: () => getTotals(),
  })

  const status = searchParams.status as keyof TotalsType
  const statusEmpty = totals?.[status] === 0

  const tabs: TabNavType[] = [
    {
      value: 'ACTIVE',
      tab: 'ativos',
      label: 'Ativos',
      count: totals?.ativos,
    },
    {
      value: 'INACTIVE',
      tab: 'inativos',
      label: 'Inativos',
      count: totals?.inativos,
    },
    {
      value: '',
      tab: 'todos',
      label: 'Todos',
      count: totals?.todos,
    },
  ]

  const statusLabel =
    tabs?.find((tab) => tab.tab === searchParams.status)?.label || ''

  return (
    <div className="space-y-5">
      <Topbar
        title="Fornecedores"
        tabs={tabs}
        activeTab={searchParams?.status || 'todos'}
        paramName="status"
        primaryCta={
          <PermissionGate permissions={['register:supplier:create']}>
            <NewSupplierTriggerButton
              onOpenChange={() => {
                setOpenDialog('new-supplier')
              }}
            />
          </PermissionGate>
        }
      />
      <div>
        <Card>
          {isLoading ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : totals?.todos && totals?.todos > 0 ? (
            statusEmpty ? (
              <ListDataStatusEmpty
                title={`Nenhum fornecedor para o status: ${statusLabel}`}
                icon={IconBuildingCommunity}
              />
            ) : (
              <>
                <SuppliersData searchParams={searchParams} tabs={tabs} />
              </>
            )
          ) : (
            <ListDataTotalEmpty
              icon={IconBuildingCommunity}
              title="Sem fornecedores cadastrados"
              description="Cadastre seu primeiro fornecedor"
              cta={
                <PermissionGate permissions={['register:supplier:create']}>
                  <NewSupplierTriggerButton
                    onOpenChange={() => {
                      setOpenDialog('new-supplier')
                    }}
                  />
                </PermissionGate>
              }
            />
          )}
        </Card>
      </div>
      <NewSupplier
        open={openDialog === 'new-supplier'}
        onOpenChange={() => setOpenDialog('')}
      />
    </div>
  )
}
