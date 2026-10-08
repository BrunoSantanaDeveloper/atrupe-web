'use client'

// React
import { Fragment, useState } from 'react'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
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

// Actions
import { getData } from '@/actions/_cruds'

// Libs
import { maskCpfCnpj } from '@/lib/utils'
import { formatToLocaleDate, formatToWeekDate } from '@/lib/formatDate'

// Third-party
import { useQuery } from '@tanstack/react-query'

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
import { ICON_SIZE, ICON_STROKE } from '@/components/ui/icon'
import Image from 'next/image'

interface Props extends SearchParamsType {
  tabs?: TabNavType[]
  searchDescription?: string
}

export interface AccountItem {
  id: string // ID da company (usado para edição)
  avatar?: string
  companyName: string
  code: string
  document: string
  userId: string
  userName: string
  userDocument: string
  phone: string
  email: string
  createdAt: string
  plan: string
  planType: 'START' | 'LITE' | 'PRO'
  status: 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'CANCELED'
  state: { id: string; name: string }
  city: { id: string; name: string }
}

interface GroupedData {
  date: string
  data: AccountItem[]
}

const planVariants = {
  START: 'default',
  LITE: 'neutral',
  PRO: 'orange',
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

  const filters = { ...searchParams }
  const currentStatus = searchParams.status

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['active-clients-list', searchParams],
    queryFn: () => getData({ route: '/subscriptions/active-clients', filters }),
  })

  const dataArray: GroupedData[] = data?.data || []
  const hasData = dataArray.length

  return (
    <>
      <CardContent>
        {isLoading ? (
          <TableSkeleton cols={6} />
        ) : hasData ? (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Conta</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Criação</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataArray.map((group) => (
                  <Fragment key={group.date}>
                    <TableRow className="bg-gray-100">
                      <TableCell
                        colSpan={6}
                        className="text-gray font-medium text-xs py-3"
                      >
                        {formatToWeekDate(group?.date)}
                      </TableCell>
                    </TableRow>
                    {group?.data?.length
                      ? group?.data.map((item, index) => {
                          return (
                            <TableRow key={item.id + index}>
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
                                          size={ICON_SIZE.lg}
                                          stroke={ICON_STROKE.lg}
                                          className="text-gray-400"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {item.companyName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {`${item.code} - ${maskCpfCnpj(item.document)}`}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              {/* Usuário */}
                              <TableCell>
                                <p className="text-sm text-gray-700">
                                  {item.userName}
                                </p>
                              </TableCell>
                              {/* Contato */}
                              <TableCell>
                                <div className="text-sm">
                                  <p className="text-gray-700">{item.phone}</p>
                                  <p className="text-gray-600">{item.email}</p>
                                </div>
                              </TableCell>
                              {/* Criação */}
                              <TableCell>
                                <p className="text-sm text-gray-700">
                                  {formatToLocaleDate(item.createdAt)}
                                </p>
                              </TableCell>
                              {/* Plano */}
                              <TableCell>
                                <Badge
                                  variant={planVariants[item.planType]}
                                  className="text-xs font-medium capitalize"
                                >
                                  {item.planType.toLowerCase()}
                                </Badge>
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
                                      tooltip="Módulos"
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
                          )
                        })
                      : null}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </>
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
      </CardContent>
      {isLoading || hasData ? (
        <CardFooter>
          <TablePagination
            searchParams={searchParams}
            lastPage={data?.total ? Math.ceil(data.total / 10) : 1}
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
