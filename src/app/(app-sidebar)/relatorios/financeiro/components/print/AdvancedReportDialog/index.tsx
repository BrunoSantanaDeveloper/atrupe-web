'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

// UI
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Form Components
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'
import { FormDateRangePickerInput } from '@/components/common/form/FormDateRangePickerInput'
import { SelectNatureField } from '@/components/common/form/global-inputs/NatureSelectField'
import { InUseBankAccountsSelectField } from '@/components/common/form/global-inputs/InUseBankAccountsSelectField'
import { InUsePaymentConditionsSelectField } from '@/components/common/form/global-inputs/InUsePaymentConditionsSelectField'

// Icons
import {
  IconFilter,
  IconArrowRight,
  IconFileTypePdf,
  IconFileSpreadsheet,
} from '@tabler/icons-react'

// Schema
import { advancedReportSchema, type AdvancedReportFormType } from './schema'

// Actions
import { getAdvancedFinancialPdfData } from '@/actions/advanced-financial-report'

// Config
import {
  statusOptionsReceitas,
  statusOptionsDespesas,
  groupByOptionsReceitas,
  groupByOptionsDespesas,
  orderByOptionsReceitas,
  orderByOptionsDespesas,
} from '../../../config'

// PDF & Excel
import { FinancialReportPdf } from '../FinancialReportPdf'
import { generateFinancialExcel } from '../generateFinancialExcel'

// Lib
import { formatDateToISO } from '@/lib/filter-utils'

interface Props {
  activeTab: 'receitas' | 'despesas'
}

const periodTypeOptions = [
  { value: 'dueDate', label: 'Data de vencimento' },
  { value: 'emission', label: 'Data de emissão' },
  { value: 'payment', label: 'Data de pagamento' },
  { value: 'cancel', label: 'Data de cancelamento' },
]

const includeTransfersOptions = [
  { value: 'yes', label: 'Sim' },
  { value: 'no', label: 'Não' },
]

export function AdvancedReportDialog({ activeTab }: Props) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isReceitas = activeTab === 'receitas'
  const title = isReceitas
    ? 'Relatório avançado de receitas'
    : 'Relatório avançado de despesas'

  const statusOptions = [
    { value: 'all', label: 'Todas' },
    ...(isReceitas ? statusOptionsReceitas : statusOptionsDespesas),
  ]
  const groupByOptions = isReceitas
    ? groupByOptionsReceitas
    : groupByOptionsDespesas
  const orderByOptions = isReceitas
    ? orderByOptionsReceitas
    : orderByOptionsDespesas

  const form = useForm<AdvancedReportFormType>({
    resolver: zodResolver(advancedReportSchema),
    defaultValues: {
      format: 'pdf',
      status: 'all',
      includeTransfers: 'yes',
      periodType: 'dueDate',
      groupBy: 'client',
      orderBy: 'dueDate',
    },
  })

  const onSubmit = async (data: AdvancedReportFormType) => {
    setIsLoading(true)
    try {
      const filters: Record<string, string | undefined> = {
        tab: activeTab,
        status: data.status === 'all' ? undefined : data.status,
        natureId: data.natureId || undefined,
        bankAccountId: data.bankAccountId || undefined,
        paymentConditionId: data.paymentConditionId || undefined,
        clientId: data.clientId || undefined,
        includeTransfers: data.includeTransfers,
        periodType: data.periodType,
        groupBy: data.groupBy,
        orderBy: data.orderBy,
      }

      if (data.dateRange?.from) {
        filters.startDate = formatDateToISO(data.dateRange.from)
      }
      if (data.dateRange?.to) {
        filters.endDate = formatDateToISO(data.dateRange.to)
      }

      const reportData = await getAdvancedFinancialPdfData(filters)

      if (!reportData) {
        throw new Error('Erro ao buscar dados do relatório')
      }

      if (data.format === 'pdf') {
        const blob = await pdf(
          <FinancialReportPdf data={reportData} />,
        ).toBlob()
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      } else {
        generateFinancialExcel(reportData)
      }

      setOpen(false)
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      toast.error('Erro ao gerar relatório')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">Relatório avançado</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <FeaturedIcon Icon={IconFilter} variant="outline" />
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Configure os filtros para gerar o relatório
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogBody className="flex flex-col gap-4">
              <FormToggleCard
                name="format"
                options={[
                  {
                    value: 'pdf',
                    label: 'PDF',
                    description: 'Documento para visualização',
                    icon: IconFileTypePdf,
                  },
                  {
                    value: 'excel',
                    label: 'Excel',
                    description: 'Planilha para análise',
                    icon: IconFileSpreadsheet,
                  },
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="status"
                  label="Status"
                  options={statusOptions}
                  width="w-full"
                />

                <SelectNatureField
                  name="natureId"
                  label="Plano de conta"
                  placeholder="Todos"
                  width="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InUseBankAccountsSelectField
                  name="bankAccountId"
                  label="Conta"
                  placeholder="Todas"
                  width="w-full"
                />

                <InUsePaymentConditionsSelectField
                  name="paymentConditionId"
                  label="Forma de pagamento"
                  placeholder="Todas"
                  width="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="includeTransfers"
                  label="Incluir transferências"
                  options={includeTransfersOptions}
                  width="w-full"
                />

                <FormSelect
                  name="periodType"
                  label="Tipo de período"
                  options={periodTypeOptions}
                  width="w-full"
                />
              </div>

              <FormDateRangePickerInput
                name="dateRange"
                label="Período"
                placeholder="Selecione o período"
                width="w-full"
              />

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="groupBy"
                  label="Agrupamento"
                  options={groupByOptions}
                  width="w-full"
                />

                <FormSelect
                  name="orderBy"
                  label="Ordenação"
                  options={orderByOptions}
                  width="w-full"
                />
              </div>
            </DialogBody>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="neutralOutline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                isLoading={isLoading}
                RightIcon={IconArrowRight}
              >
                Gerar relatório
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
