'use client'

// React
import { useState } from 'react'

// Next
import Image from 'next/image'
import Link from 'next/link'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { TablePagination } from '@/components/common/TablePagination'
import { FilteredDataEmpty } from '@/components/common/TableEmptyState'
import { EditClientDialog } from '../EditClientDialog'
import { ChangeStatusDialog } from '../ChangeStatusDialog'
import { DeleteAccountDialog } from '../DeleteAccountDialog'
import { ModulesDialog } from '../ModulesDialog'
import { ChangePlanDialog } from '../ChangePlanDialog'
import { ManualPlanDialog } from '../ManualPlanDialog'
import { ClientHistoryDialog } from '../ClientHistoryDialog'
import { SyncAsaasDialog } from '../SyncAsaasDialog'
import { SyncAddressDialog } from '../SyncAddressDialog'
import { ResetPasswordDialog } from '../ResetPasswordDialog'

// UI
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

// Types
import { SearchParamsType } from '@/types/coreTypes'
import type { TabNavType } from '@/components/common/Topbar'
import type { AccountItem } from '../types'

// Actions
import { getData } from '@/actions/_cruds'

// Libs
import { cn, formatCurrencyToBrl, maskCpfCnpj } from '@/lib/utils'
import { formatToCalendarDate } from '@/lib/formatDate'
import {
  additionalUsersLabel,
  billingLabel,
  cycleLabel,
  isOverUserLimit,
  usersInUseLabel,
  valueSuffix,
} from '../billing'

// Third-party
import { useQuery, keepPreviousData } from '@tanstack/react-query'

// Icons
import {
  IconTrash,
  IconPencil,
  IconStack2,
  IconHistory,
  IconSettings,
  IconBuildingStore,
  IconRefresh,
  IconKey,
  IconMapPin,
  IconArrowsExchange,
  IconGift,
} from '@tabler/icons-react'

export type { AccountItem } from '../types'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  searchDescription?: string
}

export const planVariants = {
  TRIAL: 'neutralLight',
  START: 'default',
  LITE: 'neutral',
  PRO: 'orange',
  ELITE: 'purple',
  FULL: 'blue',
} as const

export function Data({ searchParams, searchDescription }: Props) {
  const [rowData, setRowData] = useState<AccountItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isChangeStatusDialogOpen, setIsChangeStatusDialogOpen] =
    useState(false)
  const [isModulesDialogOpen, setIsModulesDialogOpen] = useState(false)
  const [isChangePlanDialogOpen, setIsChangePlanDialogOpen] = useState(false)
  const [isManualPlanDialogOpen, setIsManualPlanDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const [isSyncAddressDialogOpen, setIsSyncAddressDialogOpen] = useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false)

  // Lista corrida: o agrupamento por data desfazia a ordenação escolhida.
  const filters = { ...searchParams, groupBy: 'none' }
  const currentStatus = searchParams.status

  const { data, isLoading, isPlaceholderData } = useQuery({
    staleTime: Infinity,
    // Filtro, busca e página mantêm a lista anterior até a nova chegar
    placeholderData: keepPreviousData,
    queryKey: ['active-clients-list', searchParams],
    queryFn: () => getData({ route: '/subscriptions/active-clients', filters }),
  })

  const accounts: AccountItem[] = data?.data || []
  const hasData = accounts.length

  return (
    <>
      <CardContent>
        <FetchingRegion isFetching={isPlaceholderData}>
          {isLoading || hasData ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Conta</TableHead>
                  <TableHead>Titular</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Módulos</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeletonRows cols={8} />
                ) : (
                  accounts.map((item) => (
                    <TableRow key={item.id}>
                      {/* Conta */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                            {item.avatar ? (
                              <Image
                                src={item.avatar}
                                alt={item.companyName || 'Avatar'}
                                fill
                                className="object-cover p-1"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <IconBuildingStore
                                  size={24}
                                  className="text-gray-400"
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/admin/clientes/gerenciar-contas/${item.id}`}
                              className="font-medium text-sm text-gray-900 hover:underline"
                              title="Ver detalhes da conta"
                            >
                              {item.companyName}
                            </Link>
                            <p className="text-xs text-gray-600">
                              {`${item.code} - ${maskCpfCnpj(item.document)}`}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      {/* Titular */}
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-gray-700">
                            {item.owner?.name || item.userName || '-'}
                          </p>
                          <p className="text-gray-600">
                            {item.owner?.email || item.email}
                          </p>
                          <p className="text-gray-600">
                            {item.owner?.phone || item.phone}
                          </p>
                        </div>
                      </TableCell>
                      {/* Plano */}
                      <TableCell>
                        <Badge
                          variant={
                            planVariants[item.planType] ?? 'neutralLight'
                          }
                          className="text-xs font-medium capitalize"
                        >
                          {item.planType.toLowerCase()}
                        </Badge>
                        <p className="mt-1 text-xs text-gray-600">
                          {cycleLabel(item.cycle)}
                        </p>
                      </TableCell>
                      {/* Módulos */}
                      <TableCell>
                        {item.modules.length ? (
                          <div className="flex flex-wrap gap-1">
                            {item.modules.map((module) => (
                              <Badge
                                key={module.key}
                                variant="blueLight"
                                className="text-xs font-medium"
                              >
                                {module.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">-</p>
                        )}
                      </TableCell>
                      {/* Usuários */}
                      <TableCell>
                        <p
                          className={cn(
                            'text-sm whitespace-nowrap',
                            isOverUserLimit(item.users)
                              ? 'font-medium text-error-700'
                              : 'text-gray-700',
                          )}
                        >
                          {usersInUseLabel(item.users)}
                        </p>
                        {item.users.additional > 0 ? (
                          <p className="text-xs text-gray-600">
                            {additionalUsersLabel(item.users.additional)}
                          </p>
                        ) : null}
                      </TableCell>
                      {/* Valor */}
                      <TableCell>
                        <p className="text-sm text-gray-700 whitespace-nowrap">
                          {formatCurrencyToBrl(item.valueCents)}
                          <span className="text-xs text-gray-500">
                            {valueSuffix(item.cycle)}
                          </span>
                        </p>
                        <p
                          className={cn(
                            'text-xs',
                            item.billingMode === 'MANUAL'
                              ? 'font-medium text-warning-700'
                              : 'text-gray-600',
                          )}
                        >
                          {billingLabel(item)}
                        </p>
                      </TableCell>
                      {/* Vencimento */}
                      <TableCell>
                        <p className="text-sm text-gray-700 whitespace-nowrap">
                          {item.nextChargeDate
                            ? formatToCalendarDate(item.nextChargeDate)
                            : '-'}
                        </p>
                        {item.hasOverdueCharge ? (
                          <Badge variant="errorLight" className="mt-1 text-xs">
                            Cobrança vencida
                          </Badge>
                        ) : null}
                      </TableCell>
                      {/* Ações */}
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <TooltipProvider>
                            <ActionButton
                              Icon={IconPencil}
                              tooltip="Editar"
                              onClick={() => {
                                setRowData(item)
                                setIsEditDialogOpen(true)
                              }}
                            />
                            <ActionButton
                              Icon={IconSettings}
                              tooltip="Configurações"
                              onClick={() => {
                                setRowData(item)
                                setIsChangeStatusDialogOpen(true)
                              }}
                            />
                            <ActionButton
                              Icon={IconStack2}
                              tooltip="Recursos da conta"
                              onClick={() => {
                                setRowData(item)
                                setIsModulesDialogOpen(true)
                              }}
                            />
                            <ActionButton
                              Icon={IconArrowsExchange}
                              tooltip="Trocar plano"
                              onClick={() => {
                                setRowData(item)
                                setIsChangePlanDialogOpen(true)
                              }}
                            />
                            {/* Plano manual para qualquer conta (PO, 14/10/2026):
                                o servidor recusa a do anual parcelado com
                                parcela a receber */}
                            <ActionButton
                              Icon={IconGift}
                              tooltip="Plano manual, sem cobrança"
                              onClick={() => {
                                setRowData(item)
                                setIsManualPlanDialogOpen(true)
                              }}
                            />
                            <ActionButton
                              Icon={IconRefresh}
                              tooltip="Verificar Asaas"
                              onClick={() => {
                                setRowData(item)
                                setIsSyncDialogOpen(true)
                              }}
                            />
                            <ActionButton
                              Icon={IconMapPin}
                              tooltip="Endereço Asaas"
                              onClick={() => {
                                setRowData(item)
                                setIsSyncAddressDialogOpen(true)
                              }}
                            />
                            <ActionButton
                              Icon={IconKey}
                              tooltip="Redefinir senha"
                              onClick={() => {
                                setRowData(item)
                                setIsResetPasswordDialogOpen(true)
                              }}
                              disabled={!item.userId}
                            />
                            <ActionButton
                              Icon={IconHistory}
                              tooltip="Histórico"
                              onClick={() => {
                                setRowData(item)
                                setIsHistoryDialogOpen(true)
                              }}
                            />
                            {currentStatus !== 'ativas' && (
                              <ActionButton
                                Icon={IconTrash}
                                tooltip="Excluir conta"
                                onClick={() => {
                                  setRowData(item)
                                  setIsDeleteDialogOpen(true)
                                }}
                              />
                            )}
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <FilteredDataEmpty
              title="Resultado não encontrado"
              description={
                searchDescription ||
                'Sua busca não encontrou nenhum resultado. Tente novamente ou crie um novo item'
              }
              cta={undefined}
            />
          )}
        </FetchingRegion>
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.lastPage || 1}
            isLoading={isLoading}
          />
        </CardFooter>
      ) : null}

      <EditClientDialog
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        rowData={rowData}
      />

      <ChangeStatusDialog
        open={isChangeStatusDialogOpen}
        setOpen={setIsChangeStatusDialogOpen}
        rowData={rowData}
      />

      <ModulesDialog
        open={isModulesDialogOpen}
        setOpen={setIsModulesDialogOpen}
        rowData={rowData}
      />

      <ChangePlanDialog
        open={isChangePlanDialogOpen}
        setOpen={setIsChangePlanDialogOpen}
        rowData={rowData}
      />

      <ManualPlanDialog
        open={isManualPlanDialogOpen}
        setOpen={setIsManualPlanDialogOpen}
        rowData={rowData}
      />

      <ClientHistoryDialog
        open={isHistoryDialogOpen}
        setOpen={setIsHistoryDialogOpen}
        rowData={rowData}
      />

      <DeleteAccountDialog
        open={isDeleteDialogOpen}
        setOpen={setIsDeleteDialogOpen}
        rowData={rowData}
      />

      <SyncAsaasDialog
        open={isSyncDialogOpen}
        setOpen={setIsSyncDialogOpen}
        rowData={rowData}
      />

      <SyncAddressDialog
        open={isSyncAddressDialogOpen}
        setOpen={setIsSyncAddressDialogOpen}
        rowData={rowData}
      />

      <ResetPasswordDialog
        open={isResetPasswordDialogOpen}
        setOpen={setIsResetPasswordDialogOpen}
        rowData={rowData}
      />
    </>
  )
}
