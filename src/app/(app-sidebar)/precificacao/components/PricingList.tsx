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
import { TablePagination } from '@/components/common/TablePagination'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import {
  FilteredDataEmpty,
  ListDataTotalEmpty,
} from '@/components/common/TableEmptyState'
import { LoadError } from '@/app/(app-sidebar)/base-de-custos/components/LoadError'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { PriceRule, PricingGroup, PricingItem } from '../types'

// Actions
import { getPricingItems } from '@/actions/pricing'
import { updateMaterialPrice } from '@/actions/materials'

// Hooks / Store / Consts
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import {
  priceRuleObj,
  pricingStatusObj,
  pricingGroupObj,
} from '@/consts/pricing'
import { formatReferenceMonth } from '@/app/(app-sidebar)/base-de-custos/reference-month'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCurrencyReal } from '@tabler/icons-react'

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

// Margem em % com uma casa, como a API manda
const formatMargin = (margin: number | null) =>
  margin === null ? '-' : `${margin.toFixed(1).replace('.', ',')}%`

export function PricingList({
  group,
  itemLabel,
  description,
  originLabel,
  searchParams,
}: Props) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<PricingItem>()
  const status = (searchParams?.status as string) || 'todos'
  const search = searchParams?.search || ''

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['pricing-items', group, searchParams],
    queryFn: () => getPricingItems({ group, filters: searchParams }),
  })

  const items = data?.data?.items || []
  const lastPage = data?.data?.lastPage ?? 1
  // O custo de mão de obra e de máquinas é o do mês de referência da base de
  // custos; o de material e o de produto têm a data de cada um
  const referenceMonth =
    group === 'labor' || group === 'machines'
      ? formatReferenceMonth(data?.data?.referenceMonth)
      : ''

  // Trocar de situação mantém a busca e volta à primeira página
  const statusLink = (next: string) => {
    const params = new URLSearchParams({ status: next })
    if (search) params.set('search', search)

    return `?${params.toString()}`
  }

  // O preço do material é gravado no cadastro (DC-6), no material ou na
  // variação: o id do item é "mat:<material>[:<variação>]"
  const saveMaterialPrice = async (values: {
    rule: PriceRule
    price: number
    desiredMargin?: number
  }) => {
    const [, materialId, variationId] = (editing?.id || '').split(':')
    const response = await updateMaterialPrice({
      materialId: materialId || '',
      ...(variationId ? { variationId } : {}),
      ...values,
    })
    // O cadastro de materiais mostra o mesmo preço
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    }

    return response
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>{pricingGroupObj[group]}</CardTitle>
          <CardDescription>
            {description}
            {referenceMonth ? ` Mês de referência: ${referenceMonth}.` : ''}
          </CardDescription>
        </CardHeader>
        <TableFiltersHeader searchParams={searchParams}>
          <Tabs value={status} className="overflow-x-auto">
            <TabsList>
              {statusTabs.map((tab) => (
                <TabsTrigger key={tab.tab} value={tab.tab} asChild>
                  <Link href={statusLink(tab.tab)}>{tab.label}</Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </TableFiltersHeader>
        {isLoading ? (
          <TableSkeleton cols={8} rows={6} />
        ) : data && !data.success ? (
          <LoadError message={data.message} />
        ) : !items.length ? (
          status === 'todos' && !search ? (
            <ListDataTotalEmpty
              icon={IconCurrencyReal}
              title={`Nenhum ${itemLabel} para precificar`}
              description={`O custo vem ${originLabel}.`}
            />
          ) : (
            <FilteredDataEmpty description="Nenhum item atende à situação e à busca escolhidas." />
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
                    <TableHead numeric className="w-[12%]">
                      Custo atual
                    </TableHead>
                    <TableHead className="w-[12%]">
                      Custo atualizado em
                    </TableHead>
                    <TableHead className="w-[10%]">Tipo de preço</TableHead>
                    <TableHead numeric className="w-[12%]">
                      Preço praticado
                    </TableHead>
                    <TableHead numeric className="w-[10%]">
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
                        {/* Código e setor podem vir nulos (o grupo de bens
                            não tem código) */}
                        <p className="text-sm text-gray">
                          {[item.code, item.sector]
                            .filter(Boolean)
                            .join(' · ') || '-'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.unit || '-'}
                      </TableCell>
                      <TableCell numeric>{formatValue(item.cost)}</TableCell>
                      <TableCell className="text-sm text-gray">
                        {formatDate(item.costUpdatedAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={priceRuleObj[item.rule].variant}>
                          {priceRuleObj[item.rule].text}
                        </Badge>
                      </TableCell>
                      <TableCell numeric>{formatValue(item.price)}</TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          item.margin !== null &&
                            item.margin < 0 &&
                            'text-error-700',
                        )}
                      >
                        {formatMargin(item.margin)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          status
                          variant={pricingStatusObj[item.status]?.variant}
                        >
                          {pricingStatusObj[item.status]?.text || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <PermissionGate permissions={['cost:pricing:edit']}>
                            {group === 'products' ? (
                              // Só leitura nesta etapa. Não é `disabled`
                              // porque o botão desabilitado não mostra a dica
                              <ActionButton
                                Icon={IconCurrencyReal}
                                tooltip="O preço do produto é definido no cadastro do produto"
                                aria-disabled
                                className="cursor-not-allowed opacity-40"
                              />
                            ) : (
                              <ActionButton
                                Icon={IconCurrencyReal}
                                tooltip={`Precificar ${item.name}`}
                                onClick={() => setEditing(item)}
                              />
                            )}
                          </PermissionGate>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
              <p className="text-sm text-gray">
                O custo vem {originLabel} e não é editado aqui.{' '}
                {group === 'products'
                  ? 'O preço é o do cadastro do produto: a margem mostra o resultado.'
                  : 'Preço praticado é livre: a margem mostra o resultado.'}
              </p>
              {lastPage > 1 ? (
                <TablePagination
                  searchParams={searchParams}
                  lastPage={lastPage}
                />
              ) : null}
            </CardFooter>
          </>
        )}
      </Card>
      <EditPriceModal
        group={group}
        item={editing}
        open={!!editing}
        onSave={group === 'materials' ? saveMaterialPrice : undefined}
        onOpenChange={() => setEditing(undefined)}
      />
    </TooltipProvider>
  )
}
