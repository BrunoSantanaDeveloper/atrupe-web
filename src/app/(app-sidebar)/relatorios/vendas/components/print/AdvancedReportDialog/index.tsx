'use client'

import { useMemo, useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
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
import { ClientSelector } from '@/components/common/form/global-inputs/ClientAsyncSelect'

// Icons
import {
  IconFilter,
  IconArrowRight,
  IconFileTypePdf,
  IconFileSpreadsheet,
} from '@tabler/icons-react'

// Schema
import {
  advancedSalesReportSchema,
  type AdvancedSalesReportFormType,
} from './schema'

// Actions
import { getSellers } from '@/actions/sales-report'
import { getSalesReportPdfData } from '@/actions/sales-report-pdf'

// Hooks
import { useSerie } from '@/hooks/queries/useSerie'
import { usePermissions } from '@/hooks/usePermissions'
import { useContactSources } from '@/hooks/queries/useContactSources'

// PDF & Excel
import { SalesReportPdf } from '../SalesReportPdf'
import { generateSalesExcel } from '../generateSalesExcel'

// Lib
import { formatDateToISO } from '@/lib/filter-utils'

const groupByOptions = [
  { value: 'client', label: 'Cliente' },
  { value: 'seller', label: 'Vendedor' },
  { value: 'none', label: 'Sem agrupamento' },
]

const orderByOptions = [
  { value: 'approvedDate', label: 'Data de aprovação' },
  { value: 'deliveryDate', label: 'Data de entrega' },
  { value: 'valueDesc', label: 'Maior valor' },
  { value: 'valueAsc', label: 'Menor valor' },
]

const periodByOptions = [
  { value: 'approvedAt', label: 'Data de aprovação' },
  { value: 'deliveryDate', label: 'Data de entrega' },
]

export function AdvancedReportDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { data: contactSources = [] } = useContactSources()
  const { data: seriesData } = useSerie(true)
  const { hasAnyPermission } = usePermissions()
  // Cargos legados usam 'sale:other_sellers'; os salvos pela tela de cargos
  // usam 'sale:other_quotation'. Aceitar as duas chaves.
  const canSeeOtherSellers = hasAnyPermission([
    'sale:other_quotation:view',
    'sale:other_sellers:view',
  ])

  const { data: sellers = [] } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => getSellers(),
    enabled: canSeeOtherSellers,
  })

  const form = useForm<AdvancedSalesReportFormType>({
    resolver: zodResolver(advancedSalesReportSchema),
    defaultValues: {
      format: 'pdf',
      sellerId: 'all',
      originId: 'all',
      serieId: 'all',
      clientId: null,
      groupBy: 'client',
      orderBy: 'approvedDate',
      periodBy: 'approvedAt',
    },
  })

  const sellerOptions = useMemo(
    () => [
      { value: 'all', label: 'Todos' },
      ...sellers.map((s) => ({ value: s.id, label: s.name })),
    ],
    [sellers],
  )

  const originOptions = useMemo(
    () => [
      { value: 'all', label: 'Todas' },
      ...contactSources.map((s) => ({ value: s.id, label: s.name })),
    ],
    [contactSources],
  )

  const serieOptions = useMemo(
    () => [
      { value: 'all', label: 'Todas' },
      ...(seriesData?.data || []).map((serie) => ({
        value: serie.id,
        label: `${serie.code} - ${serie.description}`,
      })),
    ],
    [seriesData],
  )

  const onSubmit = async (data: AdvancedSalesReportFormType) => {
    setIsLoading(true)
    try {
      const filters = {
        sellerId: data.sellerId === 'all' ? undefined : data.sellerId,
        originId: data.originId === 'all' ? undefined : data.originId,
        serieId: data.serieId === 'all' ? undefined : data.serieId,
        clientId: data.clientId || undefined,
        groupBy: data.groupBy,
        orderBy: data.orderBy,
        periodBy: data.periodBy,
        startDate: data.dateRange?.from
          ? formatDateToISO(data.dateRange.from)
          : undefined,
        endDate: data.dateRange?.to
          ? formatDateToISO(data.dateRange.to)
          : undefined,
      }

      const reportData = await getSalesReportPdfData(filters)

      if (!reportData) {
        throw new Error('Erro ao buscar dados do relatório')
      }

      if (data.format === 'pdf') {
        const blob = await pdf(
          <SalesReportPdf data={reportData} groupBy={data.groupBy} />,
        ).toBlob()
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      } else {
        generateSalesExcel(reportData, data.groupBy)
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
            <DialogTitle>Relatório avançado de vendas</DialogTitle>
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
                {canSeeOtherSellers && (
                  <FormSelect
                    name="sellerId"
                    label="Vendedor"
                    options={sellerOptions}
                    width="w-full"
                  />
                )}

                <FormSelect
                  name="originId"
                  label="Origem"
                  options={originOptions}
                  width="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="serieId"
                  label="Série"
                  options={serieOptions}
                  width="w-full"
                />

                <ClientSelector
                  name="clientId"
                  label="Cliente"
                  placeholder="Todos os clientes"
                  width="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormDateRangePickerInput
                  name="dateRange"
                  label="Período"
                  placeholder="Selecione o período"
                  width="w-full"
                />

                <FormSelect
                  name="periodBy"
                  label="Filtrar período por"
                  options={periodByOptions}
                  width="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  name="groupBy"
                  label="Agrupamento"
                  options={
                    canSeeOtherSellers
                      ? groupByOptions
                      : groupByOptions.filter((opt) => opt.value !== 'seller')
                  }
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
