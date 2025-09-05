'use client'

import { Fragment, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CardContent, CardFooter } from '@/components/ui/card'
import { TablePagination } from '@/components/common/TablePagination'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'

import { TooltipProvider } from '@/components/ui/tooltip'

import {
  NewProductGroup,
  NewProductGroupTriggerButton,
} from './NewProductGroup'
import { getDataOld } from '@/actions/_cruds'
import { PermissionGate } from '@/components/common/PermissionGate'

type Props = {
  searchParams: {
    page?: string
    search?: string
    status?: string
  }
  tabs?: {
    tab: string
    value: string
  }[]
}

type ProductGroupType = {
  data: {
    sector: string
    groups: {
      id: string
      name: string
    }[]
  }[]
}

export function ProductsGroupData({ searchParams, tabs }: Props) {
  const [openDialog, setOpenDialog] = useState<string>('')
  const [groupId, setGroupId] = useState<string>('')
  const status =
    tabs?.find((tab) => tab.tab === searchParams.status)?.value || 'ACTIVE'

  const filters = { ...searchParams, status, kind: 'PRODUCT' }

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['product-group-list', searchParams],
    queryFn: () =>
      getDataOld({ route: 'productGroupTotalsRouteBySector', filters }),
  })

  const productGroups = (data?.data || []) as ProductGroupType['data']
  const hasData = productGroups.length

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : hasData ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Nome</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productGroups?.map((group) => (
                <Fragment key={group.sector}>
                  <TableRow className="bg-gray-100">
                    <TableCell colSpan={2}>{group.sector}</TableCell>
                  </TableRow>
                  {group?.groups?.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell>
                        <p className="font-medium">{g.name}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            <PermissionGate
                              permissions={[
                                'product_settings:materials_products:edit',
                              ]}
                            >
                              <NewProductGroupTriggerButton
                                editMode
                                onOpenChange={() => {
                                  setOpenDialog('edit-group')
                                  setGroupId(g.id)
                                }}
                              />
                            </PermissionGate>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        ) : (
          <FilteredDataEmpty
            title="Grupo de produtos não encontrado"
            description="Sua busca não encontrou nenhum resultado. Tente novamente ou cadastre um novo grupo de produtos"
          />
        )}
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage}
          />
        </CardFooter>
      ) : null}
      <NewProductGroup
        editMode
        open={openDialog === 'edit-group'}
        groupId={groupId}
        onOpenChange={() => setOpenDialog('')}
      />
    </>
  )
}
