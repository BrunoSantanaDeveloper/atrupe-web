'use client'

// React
import { Fragment, useState } from 'react'

// Components
import { NewItemDialog } from './NewItem'
import { Topbar } from '@/components/common/Topbar'
import { DeleteAlertDialog } from './Actions/Delete'
import { UserPermissionsDialog } from './Actions/Permissions'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { TablePagination } from '@/components/common/TablePagination'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { PermissionGate } from '@/components/common/PermissionGate'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { RoleType, ListRoleDataType } from '@/types/settings/role'

// Icons
import {
  IconTrash,
  IconPencil,
  IconSearch,
  IconShieldLock,
} from '@tabler/icons-react'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery, keepPreviousData } from '@tanstack/react-query'

interface Props extends SearchParamsType {}

export function Main({ searchParams }: Props) {
  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<RoleType>()

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Filtro, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['role-list', searchParams],
    queryFn: () => getDataOld({ route: 'roleRoute', filters: searchParams }),
  })

  const rolesArray: ListRoleDataType[] = data?.data || []
  const hasData = rolesArray.length

  return (
    <PermissionGate permissions={['company_settings:roles:view']}>
      <div className="space-y-5">
        <Topbar
          title="Cargos"
          previousPage="/configuracoes/empresa-e-sistema/colaboradores-e-usuarios"
          primaryCta={
            <PermissionGate permissions={['company_settings:roles:create']}>
              <NewItemDialog searchParams={searchParams} />
            </PermissionGate>
          }
        />
        <div className="space-y-2">
          <Card>
            {!isLoading && !hasData ? (
              <ListDataTotalEmpty
                icon={IconSearch}
                title="Nenhum cargo cadastrado"
                description="Crie o primeiro cargo"
                cta={
                  <PermissionGate
                    permissions={['company_settings:roles:create']}
                  >
                    <NewItemDialog searchParams={searchParams} />
                  </PermissionGate>
                }
              />
            ) : (
              <>
                <TableFiltersHeader searchParams={searchParams}>
                  {/* <RoleFilter searchParams={searchParams} /> */}
                </TableFiltersHeader>
                <CardContent>
                  <FetchingRegion isFetching={isPlaceholderData}>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Cargo</TableHead>
                          <TableHead>Colaboradores</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableSkeletonRows cols={3} />
                        ) : (
                          rolesArray.map((group) => (
                            <Fragment key={group.sector.id}>
                              <TableRow className="bg-gray-100">
                                <TableCell
                                  colSpan={6}
                                  className="text-gray font-medium text-xs "
                                >
                                  {group?.sector?.name}
                                </TableCell>
                              </TableRow>
                              {group?.roles?.length
                                ? group?.roles.map((item) => {
                                    return (
                                      <TableRow key={item?.id}>
                                        <TableCell className="font-medium">
                                          {item?.name}
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                          {item?.employees?.length || '0'}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex justify-end gap-1">
                                            <TooltipProvider>
                                              <PermissionGate
                                                permissions={[
                                                  'company_settings:roles:edit',
                                                ]}
                                              >
                                                <ActionButton
                                                  Icon={IconPencil}
                                                  tooltip="Editar"
                                                  onClick={() => {
                                                    setRowData(item)
                                                    setOpenDialog('edit')
                                                  }}
                                                  disabled={item?.isAdmin}
                                                />
                                              </PermissionGate>
                                              <PermissionGate
                                                permissions={[
                                                  'company_settings:roles:edit',
                                                ]}
                                              >
                                                <ActionButton
                                                  Icon={IconShieldLock}
                                                  tooltip="Permissões do cargo"
                                                  onClick={() => {
                                                    setRowData(item)
                                                    setOpenDialog('permissions')
                                                  }}
                                                  disabled={item?.isAdmin}
                                                />
                                              </PermissionGate>
                                              <PermissionGate
                                                permissions={[
                                                  'company_settings:roles:delete',
                                                ]}
                                              >
                                                <ActionButton
                                                  Icon={IconTrash}
                                                  tooltip="Excluir"
                                                  onClick={() => {
                                                    setRowData(item)
                                                    setOpenDialog('delete')
                                                  }}
                                                  disabled={item?.isAdmin}
                                                />
                                              </PermissionGate>
                                            </TooltipProvider>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    )
                                  })
                                : null}
                            </Fragment>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </FetchingRegion>
                </CardContent>
                {isLoading || hasData ? (
                  <CardFooter>
                    <TablePagination
                      searchParams={searchParams}
                      lastPage={data?.lastPage}
                      isLoading={isLoading}
                    />
                  </CardFooter>
                ) : null}
                <DeleteAlertDialog
                  open={openDialog === 'delete'}
                  setOpen={setOpenDialog}
                  rowData={rowData}
                  searchParams={searchParams}
                />
                <NewItemDialog
                  open={openDialog === 'edit'}
                  setOpen={setOpenDialog}
                  rowData={rowData}
                  searchParams={searchParams}
                  editMode={true}
                />
                <UserPermissionsDialog
                  open={openDialog === 'permissions'}
                  setOpen={setOpenDialog}
                  rowData={rowData}
                  searchParams={searchParams}
                />
              </>
            )}
          </Card>
        </div>
      </div>
    </PermissionGate>
  )
}
