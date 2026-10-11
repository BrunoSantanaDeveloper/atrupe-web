'use client'

// React
import { useState } from 'react'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SuppliersData } from './SuppliersTable/SuppliersData'
import { SuppliersFilter } from './SuppliersTable/SuppliersFilter'
import { ActionButton } from '@/components/common/ActionButton'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { NewSupplier, NewSupplierTriggerButton } from './NewSupplier'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { ExportDataButton } from '@/components/common/ExportDataButton'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { ExportColumn } from '@/lib/export-excel'
import type { ListSuppliersDataType } from '../types'

// Actions
import { getData, getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconBuildingCommunity, IconFolders } from '@tabler/icons-react'

// Consts
import { supplierStatusObj } from '@/consts/supplier'

const SUPPLIER_EXPORT_COLUMNS: ExportColumn<ListSuppliersDataType>[] = [
  {
    header: 'Nome',
    key: 'name',
  },
  {
    header: 'Razão social',
    key: 'corporateName',
  },
  {
    header: 'Tipo',
    getValue: (supplier) => (supplier.type === 'COMPANY' ? 'PJ' : 'PF'),
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
    header: 'Inscrição estadual',
    key: 'stateRegistration',
  },
  {
    header: 'E-mail',
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
    getValue: (supplier) => supplier.categoryRelation?.name,
  },
  {
    header: 'Status',
    getValue: (supplier) =>
      supplierStatusObj[supplier.status]?.text || supplier.status,
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

  const statusLabel = tabs?.find((tab) => tab.tab === status)?.label

  const getExportSuppliers = async () => {
    const exportStatus = tabs.find((tab) => tab.tab === status)?.value || ''
    const filters = { ...searchParams, status: exportStatus }
    const result = await getData({ route: '/supplier/export', filters })

    if (!result.success) {
      throw new Error(result.message)
    }

    return (result.data || []) as ListSuppliersDataType[]
  }

  return (
    <div className="space-y-5">
      <Topbar
        title="Fornecedores"
        tabs={tabs}
        activeTab={searchParams?.status || 'todos'}
        paramName="status"
        primaryCta={
          <TooltipProvider>
            <PermissionGate permissions={['register:supplier:export']}>
              <ExportDataButton
                columns={SUPPLIER_EXPORT_COLUMNS}
                fileName="fornecedores"
                getData={getExportSuppliers}
                sheetName="Fornecedores"
                emptyMessage="Nenhum fornecedor disponível para exportação"
              />
            </PermissionGate>
            {/* O grupo faz parte do cadastro de fornecedor: mesma
                permissão, como já era em Clientes */}
            <PermissionGate permissions={['register:supplier:edit']}>
              <ActionButton
                tooltip="Grupos de fornecedores"
                size="iconMd"
                variant="neutralOutline"
                Icon={IconFolders}
                className="bg-transparent"
                link="/cadastros/fornecedores/categorias"
              />
            </PermissionGate>
            <PermissionGate permissions={['register:supplier:create']}>
              <NewSupplierTriggerButton
                onOpenChange={() => {
                  setOpenDialog('new-supplier')
                }}
              />
            </PermissionGate>
          </TooltipProvider>
        }
      />
      <div>
        <Card>
          {isLoading ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : totals?.todos && totals?.todos > 0 ? (
            statusEmpty ? (
              <ListDataStatusEmpty
                title={`Nenhum fornecedor para o status ${statusLabel ? `: ${statusLabel}` : 'selecionado'}`}
                icon={IconBuildingCommunity}
              />
            ) : (
              <>
                <TableFiltersHeader searchParams={searchParams}>
                  <SuppliersFilter searchParams={searchParams} />
                </TableFiltersHeader>
                <SuppliersData searchParams={searchParams} tabs={tabs} />
              </>
            )
          ) : (
            <ListDataTotalEmpty
              icon={IconBuildingCommunity}
              title="Nenhum fornecedor cadastrado"
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
