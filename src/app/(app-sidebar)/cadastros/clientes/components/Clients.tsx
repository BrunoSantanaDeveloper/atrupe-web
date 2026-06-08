'use client'

// React
import { useState } from 'react'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'

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
import { ExportDataButton } from '@/components/common/ExportDataButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { ExportColumn } from '@/lib/export-excel'
import type { ListClientsDataType } from '../types'

// Actions
import { getData, getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconFolders, IconUserOff } from '@tabler/icons-react'

import {
  SearchClientModal,
  SearchClientTriggerButton,
} from './SearchClient/SearchClientModal'
import { clientStatusObj } from '@/consts/client'

const CLIENT_EXPORT_COLUMNS: ExportColumn<ListClientsDataType>[] = [
  {
    header: 'Nome',
    key: 'name',
  },
  {
    header: 'Razao social',
    key: 'corporateName',
  },
  {
    header: 'Tipo',
    getValue: (client) => (client.type === 'COMPANY' ? 'PJ' : 'PF'),
  },
  {
    header: 'CPF',
    key: 'cpf',
  },
  {
    header: 'CNPJ',
    key: 'cnpj',
  },
  {
    header: 'Inscricao estadual',
    key: 'stateRegistration',
  },
  {
    header: 'Email',
    key: 'email',
  },
  {
    header: 'Telefone',
    key: 'phoneNumber',
  },
  {
    header: 'Celular',
    key: 'mobilePhone',
  },
  {
    header: 'Grupo',
    getValue: (client) => client.categoryRelation?.name,
  },
  {
    header: 'Status',
    getValue: (client) => clientStatusObj[client.status]?.text || client.status,
  },
  {
    header: 'Criado em',
    key: 'createdAt',
    type: 'date',
  },
  {
    header: 'Observacoes',
    key: 'notes',
  },
  {
    header: 'Observacoes financeiras',
    key: 'financialNotes',
  },
]

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

  const getExportClients = async () => {
    const exportStatus =
      tabs.find((tab) => tab.tab === searchParams.status)?.value || ''
    const filters = { ...searchParams, status: exportStatus }
    const result = await getData({ route: '/client/export', filters })

    if (!result.success) {
      throw new Error(result.message)
    }

    return (result.data || []) as ListClientsDataType[]
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Clientes"
        tabs={tabs}
        activeTab={searchParams?.status || 'todos'}
        paramName="status"
        primaryCta={
          <TooltipProvider>
            <PermissionGate permissions={['register:client:export']}>
              <ExportDataButton
                columns={CLIENT_EXPORT_COLUMNS}
                fileName="clientes"
                getData={getExportClients}
                sheetName="Clientes"
                emptyMessage="Nenhum cliente disponivel para exportacao"
              />
            </PermissionGate>
            <PermissionGate permissions={['register:client:edit']}>
              <ActionButton
                tooltip="Grupos de clientes"
                size="iconMd"
                variant="neutralOutline"
                Icon={IconFolders}
                link="/cadastros/clientes/categorias"
              />
            </PermissionGate>
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
