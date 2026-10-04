'use client'

// React / Next
import Link from 'next/link'
import { useState } from 'react'

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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { EditPriceModal } from './EditPriceModal'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import {
  FilteredDataEmpty,
  ListDataTotalEmpty,
} from '@/components/common/TableEmptyState'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { PricingGroup, PricingItem } from '../types'

// Actions
import { getPricingItems } from '@/actions/pricing'

// Hooks / Store / Consts
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import {
  priceRuleObj,
  pricingStatusObj,
  pricingGroupObj,
} from '@/consts/pricing'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconCurrencyReal, IconExternalLink } from '@tabler/icons-react'

interface Props extends SearchParamsType {
  group: PricingGroup
  itemLabel: string
  description: string
  originLabel: string
}

const statusTabs = [
  { tab: 'todos', label: 'Todos' },
  { tab: 'PRICED', label: 'Com preço' },
  { tab: 'PENDING', label: 'Pendentes' },
  { tab: 'BELOW_COST', label: 'Abaixo do custo' },
  { tab: 'NO_COST', label: 'Sem custo' },
]

// Sem custo ou sem preço mostra `-`, nunca R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

const formatDate = (date: string | null) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR') : '-'

export function PricingList({
  group,
  itemLabel,
  description,
  originLabel,
  searchParams,
}: Props) {
  const [editing, setEditing] = useState<PricingItem>()
  const status = (searchParams?.status as string) || 'todos'

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['pricing-items', group, searchParams],
    queryFn: () => getPricingItems({ group, filters: searchParams }),
  })

  const items = data?.data || []

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>{pricingGroupObj[group]}</CardTitle>
          <CardDescription>{description}</CardDescription>
          <Tabs value={status} className="overflow-x-auto pt-4">
            <TabsList>
              {statusTabs.map((tab) => (
                <TabsTrigger key={tab.tab} value={tab.tab} asChild>
                  <Link href={`?status=${tab.tab}`}>{tab.label}</Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton cols={8} rows={6} />
        ) : !items.length ? (
          status === 'todos' ? (
            <ListDataTotalEmpty
              icon={IconCurrencyReal}
              title={`Nenhum ${itemLabel} para precificar`}
              description={`O custo vem de ${originLabel}.`}
            />
          ) : (
            <FilteredDataEmpty description="Nenhum item nesta situação." />
          )
        ) : (
          <>
            <CardContent>
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[24%] min-w-[200px]">
                      {itemLabel === 'setor' ? 'Setor' : 'Item'}
                    </TableHead>
                    <TableHead className="w-[12%]">Unidade</TableHead>
                    <TableHead className="w-[12%] text-right">
                      Custo atual
                    </TableHead>
                    <TableHead className="w-[12%]">
                      Custo atualizado em
                    </TableHead>
                    <TableHead className="w-[10%]">Tipo de preço</TableHead>
                    <TableHead className="w-[12%] text-right">
                      Preço praticado
                    </TableHead>
                    <TableHead className="w-[10%] text-right">
                      Margem atual
                    </TableHead>
                    <TableHead className="w-[14%]">Status</TableHead>
                    <TableHead className="w-[6%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray">
                          {item.code} · {item.sector}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{item.unit}</TableCell>
                      <TableCell className="text-right">
                        {formatValue(item.cost)}
                      </TableCell>
                      <TableCell className="text-sm text-gray">
                        {formatDate(item.costUpdatedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={priceRuleObj[item.rule].variant}>
                          {priceRuleObj[item.rule].text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatValue(item.price)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          item.margin !== null &&
                            item.margin < 0 &&
                            'text-error-700',
                        )}
                      >
                        {item.margin === null
                          ? '-'
                          : `${item.margin.toString().replace('.', ',')}%`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          status
                          variant={pricingStatusObj[item.status].variant}
                        >
                          {pricingStatusObj[item.status].text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <ActionButton
                            Icon={IconExternalLink}
                            tooltip={`Ver origem do custo — ${item.name}`}
                          />
                          <PermissionGate permissions={['cost:pricing:edit']}>
                            <ActionButton
                              Icon={IconCurrencyReal}
                              tooltip={`Precificar ${item.name}`}
                              onClick={() => setEditing(item)}
                            />
                          </PermissionGate>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-gray">
                O custo vem de {originLabel} e não é editado aqui. Preço
                praticado é livre: a margem mostra o resultado.
              </p>
            </CardFooter>
          </>
        )}
      </Card>
      <EditPriceModal
        group={group}
        item={editing}
        open={!!editing}
        onOpenChange={() => setEditing(undefined)}
      />
    </TooltipProvider>
  )
}
