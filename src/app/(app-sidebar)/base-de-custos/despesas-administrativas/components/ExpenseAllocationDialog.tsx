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
} from '@/components/common/RateInput'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableSkeleton } from '@/components/common/TableSkeleton'

// Types
import type { AdminExpenseAccount } from '../../types'

// Actions
import {
  getExpenseAllocation,
  updateExpenseAllocation,
} from '@/actions/cost-base'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconArrowsSplit2 } from '@tabler/icons-react'

interface Props {
  account?: AdminExpenseAccount
  open: boolean
  onOpenChange: () => void
}

// Percentual digitado fica com duas casas (design.md §6.8)
const parsePercent = (text: string) => {
  const value = parseDecimal(text)

  return value === null ? null : Math.round(value * 100) / 100
}

// Sem custo mostra `-`; valor não calculado nunca vira R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

// Ratear uma despesa administrativa entre os setores produtivos que a
// consomem (BC-8): a parte rateada vira custo próprio do setor; o que sobra
// continua no total administrativo. Mesmo desenho do rateio entre
// equipamentos: barra, percentual e valor por linha (BC-9)
export function ExpenseAllocationDialog({
  account,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()
  const [manual, setManual] = useState<Record<string, number>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['expense-allocation', account?.id],
    queryFn: () => getExpenseAllocation({ id: account?.id || '' }),
    enabled: open && !!account,
  })
  const allocation = data?.data
  const rows = allocation?.sectors || []
  const reference = allocation?.referenceValue || 0

  // Ao abrir, os percentuais salvos
  useEffect(() => {
    if (!allocation || !open) return

    setManual(Object.fromEntries(rows.map((row) => [row.id, row.percentage])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocation, open])

  const shareOf = (id: string) => manual[id] ?? 0
  const receivedBy = (id: string) => Math.round((reference * shareOf(id)) / 100)

  // A soma pode ficar abaixo de 100%: a sobra volta ao administrativo. Só
  // não pode passar. Conferido pelo valor, com tolerância de 1 centavo
  // (design.md §6.8, BC-9)
  const totalPercentage = rows.reduce((sum, row) => sum + shareOf(row.id), 0)
  const allocated = rows.reduce((sum, row) => sum + receivedBy(row.id), 0)
  const remainder = reference - allocated
  const exceeded = reference ? remainder < -1 : totalPercentage > 100.005
  const nothing = totalPercentage === 0

  const percentLabel = (value: number) => `${formatPercent(Math.abs(value))}%`
  const statusLabel = exceeded
    ? `Passou ${percentLabel(totalPercentage - 100)} · ${formatCurrencyToBrl(-remainder)}`
    : nothing
      ? 'Sem rateio: tudo fica no administrativo'
      : `${percentLabel(totalPercentage)} rateado · ${formatCurrencyToBrl(allocated)}`

  const handleChange = (id: string, percentage: number) =>
    setManual((current) => ({
      ...current,
      [id]: Math.min(Math.max(percentage || 0, 0), 100),
    }))

  // O valor digitado vira o percentual exato, para o setor receber o que foi
  // arredondado à mão (design.md §6.8)
  const handleValue = (id: string, cents: number) =>
    handleChange(id, reference ? (cents / reference) * 100 : 0)

  // O custo próprio do setor sem a parte desta despesa, para mostrar de onde
  // ele sai e aonde chega
  const ownWithout = (row: (typeof rows)[number]) =>
    (row.ownCost || 0) - Math.round((reference * row.percentage) / 100)

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateExpenseAllocation({
        id: account?.id || '',
        percentages: rows.map((row) => ({
          sectorId: row.id,
          percentage: shareOf(row.id),
        })),
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Rateio salvo')
      // O custo do setor muda também na Distribuição, no Por setor, no Resumo
      // e no custo-hora das máquinas: tudo o que foi lido fica velho
      queryClient.invalidateQueries()
      onOpenChange()
    },
    onError: () => toast.error('Erro ao salvar o rateio'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconArrowsSplit2} />
            <div>
              <DialogTitle>Ratear entre os setores</DialogTitle>
              <DialogDescription>{account?.name}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-6">
          <p className="text-sm text-gray">
            O custo mensal de referência de{' '}
            <span className="font-medium text-gray-900">{account?.name}</span>,{' '}
            <span className="font-medium text-gray-900">
              {formatCurrencyToBrl(reference)}
            </span>
            , pode ser repartido entre os setores produtivos que o consomem,
            como o espaço que cada um ocupa. A parte rateada passa a ser custo
            próprio do setor; o que sobrar continua no total administrativo.
          </p>
          {isLoading ? (
            <TableSkeleton cols={4} rows={5} />
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[820px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[22%]">Setor produtivo</TableHead>
                    <TableHead className="w-[44%]">Quanto recebe</TableHead>
                    <TableHead className="w-[17%] text-right">
                      Custo próprio hoje
                    </TableHead>
                    <TableHead className="w-[17%] text-right">
                      Com o rateio
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => {
                    const after = ownWithout(row) + receivedBy(row.id)

                    return (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Slider
                              className="w-full max-w-[120px]"
                              min={0}
                              max={100}
                              step={1}
                              value={[shareOf(row.id)]}
                              aria-label={`Quanto recebe — ${row.name}`}
                              onValueChange={([value]) =>
                                handleChange(row.id, value)
                              }
                            />
                            <RateInput
                              className="h-10 w-[96px] shrink-0"
                              value={shareOf(row.id)}
                              format={formatPercent}
                              parse={parsePercent}
                              onCommit={(value) => handleChange(row.id, value)}
                              endAdornment={<span className="text-sm">%</span>}
                              aria-label={`Quanto recebe em porcentagem — ${row.name}`}
                            />
                            <RateInput
                              className="h-10 w-[136px] shrink-0"
                              value={receivedBy(row.id)}
                              format={formatCentsInput}
                              parse={parseCentsInput}
                              onCommit={(cents) => handleValue(row.id, cents)}
                              disabled={!reference}
                              startAdornment={
                                <span className="text-sm">R$</span>
                              }
                              aria-label={`Quanto recebe em reais — ${row.name}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatValue(row.ownCost)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {after || row.ownCost !== null
                            ? formatCurrencyToBrl(after)
                            : '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="flex-wrap items-center gap-3 sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                exceeded
                  ? 'errorLight'
                  : nothing
                    ? 'neutralLight'
                    : 'successLight'
              }
            >
              {statusLabel}
            </Badge>
            {!exceeded && !nothing ? (
              <span className="text-sm text-gray">
                {formatCurrencyToBrl(remainder)} fica no administrativo
              </span>
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
                disabled={exceeded || isLoading}
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
