'use client'

/**
 * RankingExpandedDialog
 *
 * Visão completa de um ranking do relatório de vendas.
 *
 * Existe por dois motivos: o botão de maximizar do card era decorativo (não
 * tinha onClick) e, no gráfico, nome longo é truncado e o valor sai compacto.
 * Aqui nome e valor aparecem por extenso, em tabela — que é também a leitura
 * acessível dos mesmos dados, sem depender de cor nem de hover.
 */

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
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

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { RankingItem } from './RankingBarChart'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconChartBar } from '@tabler/icons-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  nameLabel: string
  items: RankingItem[]
}

export function RankingExpandedDialog({
  open,
  onOpenChange,
  title,
  nameLabel,
  items,
}: Props) {
  const total = items.reduce((sum, item) => sum + (item.value || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconChartBar} />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {items.length} {items.length === 1 ? 'item' : 'itens'} no período
            selecionado
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="max-h-[65vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-10">#</TableHead>
                <TableHead>{nameLabel}</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-20 text-right">Part.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={`${item.name}-${index}`}>
                  <TableCell className="text-gray-500 tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrencyToBrl(item.value)}
                  </TableCell>
                  <TableCell className="text-right text-gray-500 tabular-nums">
                    {total > 0
                      ? `${((item.value / total) * 100).toFixed(1)}%`
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
