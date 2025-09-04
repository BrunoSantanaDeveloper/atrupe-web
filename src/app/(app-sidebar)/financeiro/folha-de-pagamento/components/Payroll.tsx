'use client'

// React
import { useState } from 'react'

// Components
import { PayrollFilter } from './PayrollFilter'
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { TablePagination } from '@/components/common/TablePagination'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

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
import { Checkbox } from '@/components/ui/checkbox'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CardFooter, CardContent, Card } from '@/components/ui/card'

// Actions
import { createItemNew, getData } from '@/actions/_cruds'
import { toast } from 'sonner'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { payrollStatusObj } from '@/consts/payroll'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconPencil, IconBusinessplan } from '@tabler/icons-react'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { PayrollListType } from '@/types/financial/payroll'

const EMPTY_STATUS = 'EMPTY'

export function Payroll({ searchParams }: SearchParamsType) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState<string[]>([])

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['payroll-list', searchParams],
    queryFn: () =>
      getData({ route: '/financial/salary-sheets', filters: searchParams }),
  })

  const payrollList: PayrollListType[] = data?.data || []
  const hasData = payrollList.length

  const selectableItems = payrollList.filter(
    (item) => item.status === EMPTY_STATUS,
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const selectableIds = selectableItems.map((item) => item.employee.id)
      setSelectedIds(selectableIds)
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectItem = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, employeeId])
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== employeeId))
    }
  }

  const getHeaderCheckboxState = () => {
    if (selectableItems.length === 0) return false
    if (selectedIds.length === selectableItems.length) return true
    if (selectedIds.length > 0) return 'indeterminate'
    return false
  }

  const handleGenerateTransaction = async (
    employeeIds: string[],
  ): Promise<boolean> => {
    setIsGenerating(employeeIds)
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const month = searchParams.month ? Number(searchParams.month) : currentMonth
    const year = searchParams.year ? Number(searchParams.year) : currentYear

    const data = {
      list: employeeIds,
      month,
      year,
    }

    const res = await createItemNew({
      route: '/financial/salary-sheets',
      data,
    })

    if (!res.success) {
      toast.error(res.message)
      return false
    }

    const { data: resData } = res
    const { success, skipped = 0, errors = [] } = resData || {}
    const totalWithIssues = (skipped || 0) + errors.length

    if (totalWithIssues === 0) {
      toast.success('Todas as folhas foram lançadas com sucesso')
    } else {
      const successCount = success || 0
      if (successCount > 0) {
        toast.warning(
          `${successCount} folhas lançadas, ${totalWithIssues} não foram lançadas`,
        )
      } else {
        if (errors.length > 0) {
          toast.error(
            'Erro ao lançar folha. Verifique se colaborador possui configurações de salário definidas',
          )
        } else if (skipped > 0) {
          toast.warning(
            'Já existe uma folha de pagamento lançada para o colaborador',
          )
        }
      }
    }

    queryClient.invalidateQueries()

    await new Promise((resolve) => setTimeout(resolve, 600))

    setIsGenerating([])

    return res.success
  }

  return (
    <div className="space-y-5">
      <Topbar title="Folha de pagamento" />
      <div className="space-y-2">
        <Card>
          <TableFiltersHeader searchParams={searchParams}>
            <PayrollFilter
              searchParams={searchParams}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              generateTransaction={handleGenerateTransaction}
            />
          </TableFiltersHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton cols={6} />
            ) : hasData ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={getHeaderCheckboxState()}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Salário total</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollList?.map((item, index) => {
                    const isSelected = selectedIds.includes(item.employee.id)
                    const isDisabled = item.status !== EMPTY_STATUS

                    return (
                      <TableRow key={item?.id + item?.employee?.id + index}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            disabled={isDisabled}
                            onCheckedChange={(checked) => {
                              if (isDisabled) return
                              handleSelectItem(
                                item.employee.id,
                                checked as boolean,
                              )
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {item?.employee?.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item?.employee?.role}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-gray-600">
                            {item?.totalSalary
                              ? formatCurrencyToBrl(item?.totalSalary)
                              : '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {item?.balance
                              ? formatCurrencyToBrl(item?.balance)
                              : '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          {item?.status ? (
                            <Badge
                              status
                              variant={payrollStatusObj[item?.status]?.variant}
                            >
                              {payrollStatusObj[item?.status]?.text}
                            </Badge>
                          ) : (
                            <Badge status variant="neutralLight">
                              Sem lançamento
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <TooltipProvider>
                              {item?.status !== EMPTY_STATUS ? (
                                <ActionButton
                                  Icon={IconPencil}
                                  tooltip="Editar"
                                  link={`/financeiro/folha-de-pagamento/${item?.id}`}
                                />
                              ) : (
                                <ActionButton
                                  Icon={IconPlus}
                                  tooltip="Lançar"
                                  isLoading={isGenerating?.includes(
                                    item?.employee?.id,
                                  )}
                                  onClick={() =>
                                    handleGenerateTransaction([
                                      item?.employee?.id,
                                    ])
                                  }
                                />
                              )}
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <ListDataTotalEmpty
                title="Sem folha de pagamento cadastrada"
                icon={IconBusinessplan}
                description=""
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
        </Card>
      </div>
    </div>
  )
}
