'use client'

// React
import { useState } from 'react'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { NewClientModal, NewClientTriggerButton } from './NewClient'
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { ClientsData } from './ClientsTable/ClientsData'
import { ClientsFilter } from './ClientsTable/ClientsFilter'
import { ActionButton } from '@/components/common/ActionButton'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableFiltersHeader } from '@/components/common/TableHeader'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconFolders, IconUserOff } from '@tabler/icons-react'

import {
  SearchClientModal,
  SearchClientTriggerButton,
} from './SearchClient/SearchClientModal'
import { TooltipProvider } from '@radix-ui/react-tooltip'

export function Clients({ searchParams }: SearchParamsType) {
  const [openDialog, setOpenDialog] = useState('')

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['clients-totals'],
    queryFn: () => getDataOld({ route: 'clientTotalsRoute' }),
  })

  const totals: { [key: string]: number } = {
    preCadastros: data?.PROSPECT,
    regularizados: data?.ACTIVE,
    inativos: data?.INACTIVE,
    todos: data?.TOTAL,
  }

  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const tabs: TabNavType[] = [
    {
      value: 'PROSPECT',
      tab: 'preCadastros',
      label: 'Pré-Cadastros',
      count: totals?.preCadastros,
    },
    {
      value: 'ACTIVE',
      tab: 'regularizados',
      label: 'Regularizados',
      count: totals?.regularizados,
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
        title="Clientes"
        tabs={tabs}
        activeTab={searchParams?.status || 'todos'}
        paramName="status"
        primaryCta={
          <TooltipProvider>
            <ActionButton
              tooltip="Categorias de clientes"
              size="iconMd"
              variant="neutralOutline"
              Icon={IconFolders}
              className="bg-transparent"
              link="/cadastros/clientes/categorias"
            />
            <PermissionGate permissions={['register:client:create']}>
              <SearchClientTriggerButton
                onOpenChange={() => {
                  setOpenDialog('search-client')
                }}
              />
              <NewClientTriggerButton
                onOpenChange={() => {
                  setOpenDialog('new-client')
                }}
              />
            </PermissionGate>
          </TooltipProvider>
        }
      />
      <PermissionGate
        permissions={['register:client:view']}
        fallback={
          <div className="text-center p-4">
            Você não tem permissão para visualizar clientes
          </div>
        }
      >
        <div>
          <Card>
            {isLoading ? (
              <Skeleton className="h-[calc(100vh-150px)]" />
            ) : totals?.todos && totals?.todos > 0 ? (
              statusEmpty ? (
                <ListDataStatusEmpty
                  title={`Nenhum cliente para o status: ${statusLabel}`}
                  icon={IconUserOff}
                />
              ) : (
                <>
                  <TableFiltersHeader searchParams={searchParams}>
                    <ClientsFilter searchParams={searchParams} />
                  </TableFiltersHeader>
                  <ClientsData searchParams={searchParams} tabs={tabs} />
                </>
              )
            ) : (
              <ListDataTotalEmpty
                icon={IconUserOff}
                title="Nenhum cliente criado"
                description="Crie seu primeiro cliente"
                cta={
                  <PermissionGate permissions={['register:client:create']}>
                    <NewClientTriggerButton
                      onOpenChange={() => {
                        setOpenDialog('new-client')
                      }}
                    />
                  </PermissionGate>
                }
              />
            )}
          </Card>
        </div>
      </PermissionGate>
      <NewClientModal
        open={openDialog === 'new-client'}
        onOpenChange={() => setOpenDialog('')}
      />
      <SearchClientModal
        open={openDialog === 'search-client'}
        onOpenChange={() => setOpenDialog('')}
      />
    </div>
  )
}
