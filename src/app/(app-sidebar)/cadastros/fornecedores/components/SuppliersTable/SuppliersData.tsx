'use client'

// React Imports
import { useState, useEffect, Fragment } from 'react'

// Component Imports
import { NewSupplier, NewSupplierTriggerButton } from '../NewSupplier'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'

// UI component Imports
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent } from '@/components/ui/card'

// Type Imports
import { SearchParamsType } from '@/types/coreTypes'
import type { ListSuppliersDataType } from '../../types'
import type { TabNavType } from '@/components/common/Topbar'

// Action Imports
import { getDataOld } from '@/actions/_cruds'

// Third-party Imports
import { useQuery } from '@tanstack/react-query'

// Icon Imports
import { IconSearch } from '@tabler/icons-react'
import { supplierStatusObj } from '@/consts/supplier'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
}

export function SuppliersData({ searchParams, tabs }: Props) {
  const [lastPage, setLastPage] = useState(1)
  const [openDialog, setOpenDialog] = useState('')
  const [supplierId, setSupplierId] = useState<string>('')

  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || ''
  const filters = { ...searchParams, status }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['supplier-list', searchParams],
    queryFn: () => getDataOld({ route: 'supplierRoute', filters }),
  })

  useEffect(() => {
    if (data?.total) {
      setLastPage(Math.ceil(data.total / 10))
    }
  }, [data])

  const suppliers: ListSuppliersDataType[] = data?.data || []
  const hasData = suppliers.length

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : hasData ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[50%] min-w-[250px]">Nome</TableHead>
                <TableHead className="w-[15%]">Grupo</TableHead>
                <TableHead className="w-[13%]">Status</TableHead>
                <TableHead className="w-[12%]">Contato</TableHead>
                <TableHead className="w-[10%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier?.id}>
                  <TableCell>
                    <p className="font-medium">{supplier?.name}</p>
                    <p className="text-gray">{supplier?.kind}</p>
                  </TableCell>
                  <TableCell>
                    {supplier?.categoryRelation?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      status
                      variant={supplierStatusObj[supplier?.status]?.variant}
                    >
                      {supplierStatusObj[supplier?.status]?.text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-gray">{supplier?.phoneNumber || '-'}</p>
                    <p className="text-gray">{supplier?.email || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <TooltipProvider>
                        <PermissionGate
                          permissions={['register:supplier:view']}
                        >
                          <ActionButton
                            link={`/cadastros/fornecedores/${supplier?.id}/dados`}
                            Icon={IconSearch}
                            tooltip="Ver"
                          />
                        </PermissionGate>
                        <PermissionGate
                          permissions={['register:supplier:edit']}
                        >
                          <NewSupplierTriggerButton
                            editMode
                            onOpenChange={() => {
                              setSupplierId(supplier?.id)
                              setOpenDialog('edit-supplier')
                            }}
                          />
                        </PermissionGate>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <FilteredDataEmpty
            title="Fornecedor não encontrado"
            description="Sua busca não encontrou nenhum resultado. Tente novamente ou crie um novo fornecedor"
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
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination searchParams={searchParams} lastPage={lastPage} />
        </CardFooter>
      ) : null}
      <NewSupplier
        open={openDialog === 'new-supplier'}
        onOpenChange={() => setOpenDialog('')}
      />
      <NewSupplier
        editMode
        supplierId={supplierId}
        open={openDialog === 'edit-supplier'}
        onOpenChange={() => setOpenDialog('')}
      />
    </>
  )
}
