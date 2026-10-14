'use client'

// React
import { Fragment, useState } from 'react'

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
import { Card, CardFooter, CardContent } from '@/components/ui/card'

// Components
import { NewItemDialog } from './NewItem'
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { usePermissions } from '@/hooks/usePermissions'
import { AddSellerDialog } from './Actions/AddSeller'
import { DeleteSellerDialog } from './Actions/DeleteSeller'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { ConfigureProfileDialog } from './Actions/ConfigureProfile'
import { TablePagination } from '@/components/common/TablePagination'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type {
  SellerProfileType,
  ListSellerProfileDataType,
  SellerProfileEmployeesType,
} from '@/types/settings/sellerProfile'
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import {
  IconTrash,
  IconUserPlus,
  IconSettings,
  IconUserCircle,
} from '@tabler/icons-react'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { UserInfo } from '@/components/common/UserInfo'
import { DeleteProfileDialog } from './Actions/DeleteProfile'

export function Main({ searchParams }: SearchParamsType) {
  // EC-26: o valor mínimo de venda é valor — respeita a permissão
  const { hasAllPermissions } = usePermissions()
  const canSeeValues = hasAllPermissions(['values:values:view'])

  const [openDialog, setOpenDialog] = useState('')
  const [rowData, setRowData] = useState<SellerProfileType>()
  const [employeeData, setEmployeeData] = useState<SellerProfileEmployeesType>()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['seller-profile-list', searchParams],
    queryFn: () => getDataOld({ route: 'sellerProfileRoute' }),
  })

  const profiles: ListSellerProfileDataType[] = data?.profiles || []
  const hasData = profiles.length

  return (
    <div className="space-y-5">
      <Topbar
        title="Perfil de vendedor"
        previousPage="/configuracoes/vendas"
        primaryCta={
          <PermissionGate
            permissions={['sales_settings:seller_profile:create']}
          >
            <NewItemDialog />
          </PermissionGate>
        }
      />
      <div className="space-y-2">
        <Card>
          {isLoading ? (
            <TableSkeleton cols={5} />
          ) : !hasData ? (
            <ListDataTotalEmpty
              icon={IconUserCircle}
              title="Nenhum perfil cadastrado"
              description="Crie o primeiro perfil"
              cta={
                <PermissionGate
                  permissions={['sales_settings:seller_profile:create']}
                >
                  <NewItemDialog />
                </PermissionGate>
              }
            />
          ) : (
            <>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Perfil</TableHead>
                      <TableHead numeric>Desconto máximo</TableHead>
                      <TableHead numeric>Valor mínimo de venda</TableHead>
                      <TableHead numeric>Comissão</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((group) => (
                      <Fragment key={group.profile?.id}>
                        {/* O perfil é a entidade principal: linha de dado, não
                            cabeçalho de grupo. Os vendedores vêm abaixo. */}
                        <TableRow>
                          <TableCell className="type-body-strong">
                            {group?.profile?.name}
                          </TableCell>
                          <TableCell numeric>
                            {group?.profile?.maxDiscount} %
                          </TableCell>
                          <TableCell numeric>
                            {canSeeValues
                              ? formatCurrencyToBrl(group?.profile?.minValue)
                              : '••••••'}
                          </TableCell>
                          <TableCell numeric>
                            {group?.profile?.commission} %
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <TooltipProvider>
                                <PermissionGate
                                  permissions={[
                                    'sales_settings:seller_profile:edit',
                                  ]}
                                >
                                  <ActionButton
                                    Icon={IconUserPlus}
                                    tooltip="Adicionar vendedor"
                                    onClick={() => {
                                      setOpenDialog('addSeller')
                                      setRowData(group?.profile)
                                    }}
                                  />
                                  <ActionButton
                                    Icon={IconSettings}
                                    tooltip="Configurar perfil do vendedor"
                                    onClick={() => {
                                      setOpenDialog('configure')
                                      setRowData(group?.profile)
                                    }}
                                  />
                                </PermissionGate>
                                <PermissionGate
                                  permissions={[
                                    'sales_settings:seller_profile:delete',
                                  ]}
                                >
                                  <ActionButton
                                    Icon={IconTrash}
                                    tooltip="Remover perfil"
                                    onClick={() => {
                                      setOpenDialog('removeProfile')
                                      setRowData(group?.profile)
                                    }}
                                  />
                                </PermissionGate>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                        </TableRow>
                        {group?.employees?.length ? (
                          group?.employees.map((item) => {
                            return (
                              <TableRow key={item?.id}>
                                <TableCell colSpan={4} className="pl-12">
                                  <UserInfo
                                    name={item?.name}
                                    description={item?.role}
                                    imageUrl={item?.avatar}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-end gap-1">
                                    <TooltipProvider>
                                      <PermissionGate
                                        permissions={[
                                          'sales_settings:seller_profile:edit',
                                        ]}
                                      >
                                        <ActionButton
                                          Icon={IconTrash}
                                          tooltip="Remover vendedor"
                                          onClick={() => {
                                            setOpenDialog('removeSeller')
                                            setEmployeeData(item)
                                          }}
                                        />
                                      </PermissionGate>
                                    </TooltipProvider>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-gray-600">
                              Sem vendedor
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              {isLoading || hasData ? (
                <CardFooter>
                  <TablePagination
                    searchParams={searchParams}
                    lastPage={data?.lastPage}
                  />
                </CardFooter>
              ) : null}
              <DeleteSellerDialog
                open={openDialog === 'removeSeller'}
                setOpen={setOpenDialog}
                rowData={employeeData}
                searchParams={searchParams}
              />
              <AddSellerDialog
                open={openDialog === 'addSeller'}
                setOpen={setOpenDialog}
                rowData={rowData}
                searchParams={searchParams}
              />
              <ConfigureProfileDialog
                open={openDialog === 'configure'}
                setOpen={setOpenDialog}
                rowData={rowData}
                searchParams={searchParams}
              />
              <DeleteProfileDialog
                open={openDialog === 'removeProfile'}
                setOpen={setOpenDialog}
                rowData={rowData}
                searchParams={searchParams}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
