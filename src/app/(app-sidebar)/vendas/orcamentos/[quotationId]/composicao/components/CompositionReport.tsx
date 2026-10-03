'use client'

// A composição completa do item vendido, como relatório de consulta (IP-36).
// O vendedor preenche só os campos editáveis; aqui ele confere tudo o que o
// produto leva, etapa por etapa, com as quantidades daquela venda. Sem custo
// e sem preço de recurso: isso é tela de método (ORC-7, ORC-8).

// UI
import {
  Dialog,
  DialogBody,
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
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Types
import type { QuotationItem } from '../types'

// Actions
import { getSaleComposition } from '@/actions/product-assembly'

// Hooks / Store / Consts
import { resourceKindObj } from '@/consts/processes'
import { ResourceKindLabel } from '@/components/common/ResourceKindIcon'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconSearch } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

const num = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

// Tempo em horas a partir de 60 min, como na composição (IP-33)
const amount = (value: number, unit: string) => {
  if (unit !== 'min' || value < 60) return `${num(value)} ${unit}`
  const hours = Math.floor(value / 60)
  const minutes = Math.round(value - hours * 60)
  return minutes ? `${hours}h${String(minutes).padStart(2, '0')}` : `${hours}h`
}

// O que o relatório precisa do item: serve ao item da tela de composição e
// ao item do orçamento do sistema
export type ReportTarget = Pick<
  QuotationItem,
  | 'id'
  | 'name'
  | 'productId'
  | 'quantity'
  | 'width'
  | 'height'
  | 'variation'
  | 'composition'
>

interface Props {
  item: ReportTarget | null
  onOpenChange: (open: boolean) => void
}

export function CompositionReport({ item, onOpenChange }: Props) {
  const { data, isLoading } = useQuery({
    enabled: !!item?.productId,
    queryKey: [
      'sale-composition',
      item?.id,
      item?.quantity,
      item?.width,
      item?.height,
      item?.variation,
      item?.composition,
    ],
    queryFn: () =>
      getSaleComposition({
        productId: item!.productId!,
        measure: {
          quantity: item!.quantity,
          // Produto vendido por unidade guarda a medida da composição
          width: item!.width || 1,
          height: item!.height || 1,
        },
        variationName: item!.variation,
        extras: item!.composition?.extras,
        times: item!.composition?.times,
        notes: item!.composition?.notes,
        choices: item!.composition?.choices,
        optionals: item!.composition?.optionals,
        lists: item!.composition?.lists,
      }),
  })

  const report = data?.data

  return (
    <Dialog open={!!item} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[855px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconSearch} />
            <div>
              <DialogTitle>Composição de {item?.name}</DialogTitle>
              <DialogDescription>
                {item
                  ? [
                      `${item.quantity} un`,
                      item.width && item.height
                        ? `${num(item.width)} × ${num(item.height)} m`
                        : null,
                      item.variation,
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  : ''}
                {' · '}o que o produto leva, com as quantidades desta venda
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="max-h-[65vh] space-y-5 overflow-y-auto">
          {isLoading && <Skeleton className="h-[240px] w-full" />}
          {!isLoading && !report && (
            <p className="text-sm text-gray">
              {data?.message || 'Composição indisponível.'}
            </p>
          )}
          {report?.blocks.map((block) => {
            const finishing = block.role === 'FINISHING'

            return (
              <section
                key={block.id}
                className={cn(
                  'space-y-2',
                  finishing && 'ml-4 border-l-4 border-l-brand-200 pl-4',
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-900">{block.name}</p>
                  <Badge variant="neutralLight">{block.sector}</Badge>
                  {finishing && block.baseName && (
                    <Badge variant="blueLight">
                      Acabamento de {block.baseName.toLowerCase()}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray">
                  {[
                    `${num(block.measure.quantity)} un`,
                    block.measure.width && block.measure.height
                      ? `${num(block.measure.width)} × ${num(block.measure.height)} m`
                      : null,
                    block.extra,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {block.note && (
                  <p className="rounded-lg bg-warning-50 px-3 py-2 text-sm text-warning-700">
                    Observação para a produção: {block.note}
                  </p>
                )}
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[30%]">Linha</TableHead>
                      <TableHead className="w-[45%]">Recurso</TableHead>
                      <TableHead className="w-[25%] text-right">
                        Quantidade
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {block.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>
                          <p className="text-sm font-medium text-gray-800">
                            {line.name}
                          </p>
                          <p className="text-xs text-gray">
                            <ResourceKindLabel
                              kind={line.kind}
                              label={resourceKindObj[line.kind]}
                            />
                          </p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {line.entries ? (
                            line.entries.length ? (
                              line.entries.map((entry) => (
                                <span key={entry.name} className="block">
                                  {entry.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray">
                                Nada informado nesta venda
                              </span>
                            )
                          ) : (
                            line.resource || '-'
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-sm">
                          {line.entries
                            ? line.entries.map((entry) => (
                                <span key={entry.name} className="block">
                                  {amount(entry.quantity, entry.unit)}
                                </span>
                              ))
                            : line.quantity === null
                              ? '-'
                              : amount(line.quantity, line.unit)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
            )
          })}
        </DialogBody>
        <DialogFooter className="flex-wrap justify-between gap-3">
          <p className="text-sm text-gray">
            Custo e margem ficam no Resultado previsto, para quem tem permissão.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
