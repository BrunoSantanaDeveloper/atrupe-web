'use client'

// React / Next
import { useEffect, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import {
  RateInput,
  parseDecimal,
  formatPercent,
  parseCentsInput,
  formatCentsInput,
  formatHoursLabel,
} from '@/components/common/RateInput'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'

// Types
import type { AllocationCriterion, SectorAllocation } from '../../types'

// Actions
import { updateSectorAllocation } from '@/actions/sector-allocation'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { allocationCriteria } from '@/consts/cost-base'

// Third-party
import { toast } from 'sonner'
import { FormProvider, useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconArrowsSplit2 } from '@tabler/icons-react'

interface Props {
  allocation?: SectorAllocation
  open: boolean
  onOpenChange: () => void
}

// Percentual digitado fica com duas casas (design.md §6.8)
const parsePercent = (text: string) => {
  const value = parseDecimal(text)

  return value === null ? null : Math.round(value * 100) / 100
}

const formatShare = (value: number | null) =>
  value === null ? '-' : `${formatPercent(value)}%`

export function SectorAllocationDialog({
  allocation,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()
  const form = useForm<{ criterion: AllocationCriterion }>({
    defaultValues: { criterion: 'ACQUISITION_VALUE' },
  })
  const [manual, setManual] = useState<Record<string, number>>({})

  const criterion = form.watch('criterion')
  const equipment = allocation?.equipment || []
  const pool = allocation?.pool || 0

  // Ao abrir, o critério salvo; os percentuais manuais nascem com a
  // distribuição que estava em uso, para a empresa só ajustar (BC-3.1)
  useEffect(() => {
    if (!allocation || !open) return

    form.reset({ criterion: allocation.criterion })
    setManual(
      Object.fromEntries(
        allocation.equipment.map((item) => [item.id, item.share]),
      ),
    )
  }, [allocation, open, form])

  const shareOf = (id: string) => {
    if (criterion === 'MANUAL') return manual[id] ?? 0

    const item = equipment.find((row) => row.id === id)
    const share = item?.shares[criterion] ?? null

    // Tempo de atividade sem nenhum tempo informado cai na regra base (ORG-33)
    return share ?? item?.shares.ACQUISITION_VALUE ?? 0
  }

  const receivedBy = (id: string) => Math.round((pool * shareOf(id)) / 100)

  // O fechamento é conferido pelo valor, com tolerância de 1 centavo
  // (design.md §6.8, BC-9)
  const totalPercentage = equipment.reduce(
    (sum, item) => sum + (manual[item.id] ?? 0),
    0,
  )
  const difference =
    pool - equipment.reduce((sum, item) => sum + receivedBy(item.id), 0)
  const exceeded = pool ? difference < -1 : totalPercentage > 100.005
  const closed = pool
    ? Math.abs(difference) <= 1
    : Math.abs(totalPercentage - 100) < 0.005

  const percentLabel = (value: number) => `${formatPercent(Math.abs(value))}%`
  const statusLabel = exceeded
    ? `Passou ${percentLabel(totalPercentage - 100)}${pool ? ` · ${formatCurrencyToBrl(-difference)}` : ''}`
    : closed
      ? '100% distribuído'
      : `Faltam ${percentLabel(100 - totalPercentage)}${pool ? ` · ${formatCurrencyToBrl(difference)}` : ''}`

  const handleChange = (id: string, percentage: number) =>
    setManual((current) => ({
      ...current,
      [id]: Math.min(Math.max(percentage || 0, 0), 100),
    }))

  // O valor digitado vira o percentual exato, para o equipamento receber o
  // que foi arredondado à mão (design.md §6.8)
  const handleValue = (id: string, cents: number) =>
    handleChange(id, pool ? (cents / pool) * 100 : 0)

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateSectorAllocation({
        sectorId: allocation?.sectorId || '',
        criterion,
        percentages:
          criterion === 'MANUAL'
            ? equipment.map((item) => ({
                id: item.id,
                percentage: manual[item.id] ?? 0,
              }))
            : undefined,
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Rateio do setor salvo')
      // O custo da máquina muda também na Precificação, na composição e no
      // patrimônio: tudo o que foi lido fica velho
      queryClient.invalidateQueries()
      onOpenChange()
    },
    onError: () => toast.error('Erro ao salvar o rateio do setor'),
  })

  const missingTime =
    criterion === 'ACTIVITY_TIME' && allocation?.missingTime.length
      ? allocation.missingTime
      : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[960px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconArrowsSplit2} />
            <div>
              <DialogTitle>Rateio entre os equipamentos</DialogTitle>
              <DialogDescription>{allocation?.sectorName}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <p className="text-sm text-gray">
            O custo do setor que não é de um equipamento, de{' '}
            <span className="font-medium text-gray-900">
              {pool ? `${formatCurrencyToBrl(pool)} por mês` : 'R$ 0,00'}
            </span>{' '}
            (bens simplificados, lançamentos diretos e o administrativo
            recebido), é repartido entre os equipamentos detalhados. Cada um
            soma a sua parte ao próprio custo, e é daí que sai o custo-hora e o
            custo por unidade de cada configuração.
          </p>
          <FormProvider {...form}>
            <FormToggleCard
              name="criterion"
              options={allocationCriteria.map((item) => ({ ...item }))}
              groupClassName="flex-col gap-2"
            />
          </FormProvider>
          {missingTime.length ? (
            <p className="text-sm text-gray">
              Sem tempo de atividade informado:{' '}
              <span className="font-medium text-gray-900">
                {missingTime.join(', ')}
              </span>
              . Esse equipamento não recebe nada por este critério; sem nenhum
              tempo informado no setor, vale o valor de aquisição.
            </p>
          ) : null}
          <div className="overflow-x-auto">
            <Table className="min-w-[880px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[20%]">Equipamento</TableHead>
                  <TableHead className="w-[10%] text-right">
                    Por valor de aquisição
                  </TableHead>
                  <TableHead className="w-[10%] text-right">
                    Por tempo de atividade
                  </TableHead>
                  <TableHead className="w-[34%]">
                    {criterion === 'MANUAL' ? 'Quanto recebe' : 'Em uso'}
                  </TableHead>
                  <TableHead className="w-[13%] text-right">
                    Custo no mês
                  </TableHead>
                  <TableHead className="w-[13%] text-right">
                    Custo-hora
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map((item) => {
                  const monthlyCost = item.ownCost + receivedBy(item.id)
                  const hourCost = item.activityHours
                    ? Math.round(monthlyCost / item.activityHours)
                    : null

                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray">
                          {item.activityHours
                            ? `${formatHoursLabel(item.activityHours)} de atividade por mês`
                            : 'Sem tempo de atividade'}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatShare(item.shares.ACQUISITION_VALUE)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatShare(item.shares.ACTIVITY_TIME)}
                      </TableCell>
                      <TableCell>
                        {criterion === 'MANUAL' ? (
                          <div className="flex items-center gap-3">
                            <Slider
                              className="w-full max-w-[120px]"
                              min={0}
                              max={100}
                              step={1}
                              value={[manual[item.id] ?? 0]}
                              aria-label={`Quanto recebe — ${item.name}`}
                              onValueChange={([value]) =>
                                handleChange(item.id, value)
                              }
                            />
                            <RateInput
                              className="h-10 w-[96px] shrink-0"
                              value={manual[item.id] ?? 0}
                              format={formatPercent}
                              parse={parsePercent}
                              onCommit={(value) => handleChange(item.id, value)}
                              endAdornment={<span className="text-sm">%</span>}
                              aria-label={`Quanto recebe em porcentagem — ${item.name}`}
                            />
                            <RateInput
                              className="h-10 w-[136px] shrink-0"
                              value={receivedBy(item.id)}
                              format={formatCentsInput}
                              parse={parseCentsInput}
                              onCommit={(cents) => handleValue(item.id, cents)}
                              disabled={!pool}
                              startAdornment={
                                <span className="text-sm">R$</span>
                              }
                              aria-label={`Quanto recebe em reais — ${item.name}`}
                            />
                          </div>
                        ) : (
                          <span className="font-medium">
                            {formatShare(shareOf(item.id))} ·{' '}
                            {formatCurrencyToBrl(receivedBy(item.id))}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrencyToBrl(monthlyCost)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {hourCost === null
                          ? '-'
                          : formatCurrencyToBrl(hourCost)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </DialogBody>
        <DialogFooter className="flex-wrap items-center gap-3 sm:justify-between">
          <div className="flex items-center gap-2">
            {criterion === 'MANUAL' ? (
              <Badge
                variant={
                  exceeded
                    ? 'errorLight'
                    : closed
                      ? 'successLight'
                      : 'neutralLight'
                }
              >
                {statusLabel}
              </Badge>
            ) : null}
          </div>
          <div className="flex gap-3">
            <DialogClose asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogClose>
            <PermissionGate permissions={['cost:base:edit']}>
              <Button
                disabled={criterion === 'MANUAL' && !closed}
                isLoading={isPending}
                onClick={() => mutate()}
              >
                {isPending ? 'Salvando...' : 'Salvar rateio'}
              </Button>
            </PermissionGate>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
