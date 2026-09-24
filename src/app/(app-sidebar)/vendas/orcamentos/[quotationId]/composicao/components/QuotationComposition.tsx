'use client'

// React / Next
import Link from 'next/link'
import { Fragment, useState } from 'react'

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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardFooter, CardContent } from '@/components/ui/card'

// Components
import { AddPanel } from './AddPanel'
import { ItemForm, type ItemFormValues } from './ItemForm'
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { AddOption, QuotationItem } from '../types'

// Actions
import {
  getQuotation,
  getItemOptions,
  addQuotationItem,
  addQuotationLine,
  removeQuotationItem,
  removeQuotationLine,
  updateQuotationItem,
  getQuotationProducts,
} from '@/actions/quotation-composition'

// Hooks / Store / Consts
import { FEATURES } from '@/consts/features'
import { formatMoney } from '@/lib/utils'
import { itemTotal, itemUnitPrice, quotationTotal } from '@/lib/quotation-calc'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconPlus,
  IconPencil,
  IconTrash,
  IconChevronDown,
  IconChevronRight,
  IconShoppingCartPlus,
} from '@tabler/icons-react'

interface Props {
  quotationId: string
}

const measure = (item: QuotationItem) =>
  item.width && item.height
    ? `${item.width} x ${item.height}`.replace(/\./g, ',')
    : ''

// Tela completa da composição no orçamento (ORC-1 a ORC-6). A versão do LITE
// é um recorte desta: sem processos, sem partes e sem campos do produto.
//
// O CUSTO NÃO APARECE AQUI (ORC-7). A tela do orçamento mostra preço; custo e
// margem ficam nas telas de método, com permissão própria (SEG-6).
export function QuotationComposition({ quotationId }: Props) {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState<string[]>([])
  const [addingToQuotation, setAddingToQuotation] = useState(false)
  const [addingToItem, setAddingToItem] = useState('')
  // Produto escolhido, aguardando os dados do item; e item em edição. Os dois
  // usam o mesmo formulário (ORC-4)
  const [picked, setPicked] = useState<AddOption | null>(null)
  const [editing, setEditing] = useState('')

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['quotation-composition', quotationId],
    queryFn: () => getQuotation({ id: quotationId }),
  })

  const { data: productsData } = useQuery({
    staleTime: Infinity,
    queryKey: ['quotation-products'],
    queryFn: () => getQuotationProducts(),
  })

  const { data: itemOptionsData } = useQuery({
    staleTime: Infinity,
    queryKey: ['quotation-item-options'],
    queryFn: () => getItemOptions(),
  })

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ['quotation-composition', quotationId],
    })

  const onError = () => toast.error('Não foi possível concluir')

  const { mutate: addItem } = useMutation({
    mutationFn: ({
      option,
      values,
    }: {
      option: AddOption
      values: ItemFormValues
    }) => addQuotationItem({ quotationId, option, ...values }),
    onSuccess: () => {
      toast.success('Item acrescentado')
      setAddingToQuotation(false)
      setPicked(null)
      invalidate()
    },
    onError,
  })

  const { mutate: addLine } = useMutation({
    mutationFn: ({ itemId, option }: { itemId: string; option: AddOption }) =>
      addQuotationLine({
        quotationId,
        itemId,
        line: {
          kind: option.releasedForSale === false ? 'PART' : 'PROCESS',
          name: option.name,
          sector: option.sector,
          tags: [],
          // O custo é gravado para o resultado e a produção, mas não é
          // exibido nesta tela (ORC-7)
          cost: Math.round(option.price * 0.6),
          price: option.price,
          // Retrato do cálculo no momento da venda (ORC-10)
          resolvedAt: new Date().toISOString(),
          resolved: [
            {
              id: `res-${option.id}`,
              kind: 'MATERIAL',
              name: option.name,
              unit: option.unit,
              quantity: 1,
              unitCost: Math.round(option.price * 0.6),
              cost: Math.round(option.price * 0.6),
              actualQuantity: null,
              actualCost: null,
            },
          ],
        },
      }),
    onSuccess: () => {
      toast.success('Acrescentado ao item')
      invalidate()
    },
    onError,
  })

  const { mutate: addLoose } = useMutation({
    mutationFn: ({
      itemId,
      supplier,
      description,
      price,
    }: {
      itemId: string
      supplier: string
      description: string
      price: number
    }) =>
      addQuotationLine({
        quotationId,
        itemId,
        line: {
          kind: 'LOOSE',
          name: description,
          sector: supplier ? `Terceirizado · ${supplier}` : 'Terceirizado',
          tags: ['avulso'],
          cost: Math.round(price * 0.6),
          price,
          resolvedAt: new Date().toISOString(),
          resolved: [
            {
              id: `res-loose-${Date.now()}`,
              kind: 'OUTSOURCED',
              name: supplier ? `${description} · ${supplier}` : description,
              unit: 'un',
              quantity: 1,
              unitCost: Math.round(price * 0.6),
              cost: Math.round(price * 0.6),
              actualQuantity: null,
              actualCost: null,
            },
          ],
        },
      }),
    onSuccess: () => {
      toast.success('Terceirizado acrescentado')
      invalidate()
    },
    onError,
  })

  const { mutate: removeLine } = useMutation({
    mutationFn: ({ itemId, lineId }: { itemId: string; lineId: string }) =>
      removeQuotationLine({ quotationId, itemId, lineId }),
    onSuccess: () => {
      toast.success('Linha removida')
      invalidate()
    },
    onError,
  })

  const { mutate: removeItem } = useMutation({
    mutationFn: (itemId: string) =>
      removeQuotationItem({ quotationId, itemId }),
    onSuccess: () => {
      toast.success('Item removido')
      invalidate()
    },
    onError,
  })

  const { mutate: updateItem } = useMutation({
    mutationFn: ({ itemId, ...values }: ItemFormValues & { itemId: string }) =>
      updateQuotationItem({ quotationId, itemId, ...values }),
    onSuccess: () => {
      toast.success('Item atualizado')
      setEditing('')
      invalidate()
    },
    onError,
  })

  const quotation = data?.data
  const products = productsData?.data || []
  const itemOptions = itemOptionsData?.data

  const toggle = (id: string) =>
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  if (!quotation) return <div className="p-4">Orçamento não encontrado.</div>

  const options = [
    ...(itemOptions?.processes || []),
    ...(itemOptions?.parts || []),
  ]

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title={`Itens do orçamento ${quotation.reference}`}
          previousPage="/vendas/orcamentos"
          supportText={quotation.client}
          primaryCta={
            <div className="flex flex-wrap gap-2">
              {/* Tela de método: só aparece para quem tem a permissão (ORC-8) */}
              <PermissionGate
                requireAll
                permissions={['cost:pricing:view', 'values:values:view']}
              >
                <Button variant="neutralOutline" asChild>
                  <Link href={`/vendas/orcamentos/${quotationId}/resultado`}>
                    Resultado previsto
                  </Link>
                </Button>
              </PermissionGate>
              <PermissionGate permissions={['sale:quotation:edit']}>
                <Button
                  LeftIcon={IconShoppingCartPlus}
                  onClick={() => setAddingToQuotation((current) => !current)}
                >
                  Acrescentar item
                </Button>
              </PermissionGate>
            </div>
          }
        />

        {addingToQuotation &&
          (picked ? (
            <ItemForm
              option={picked}
              onCancel={() => setPicked(null)}
              onConfirm={(values) => addItem({ option: picked, values })}
            />
          ) : (
            <AddPanel
              context={`orçamento ${quotation.reference}`}
              options={products}
              onClose={() => setAddingToQuotation(false)}
              onPick={(option) => setPicked(option)}
            />
          ))}

        <Card>
          {!quotation.items.length ? (
            <ListDataTotalEmpty
              icon={IconShoppingCartPlus}
              title="Nenhum item no orçamento"
              description="Acrescente os produtos que a empresa vende. Se o produto não existir pronto, monte a composição."
            />
          ) : (
            <>
              <CardContent>
                <Table className="min-w-[980px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[5%]" />
                      <TableHead className="w-[33%] min-w-[220px]">
                        Referência
                      </TableHead>
                      <TableHead className="w-[16%]">Medidas</TableHead>
                      <TableHead className="w-[12%] text-right">
                        Valor unitário
                      </TableHead>
                      <TableHead className="w-[10%] text-right">
                        Desconto
                      </TableHead>
                      <TableHead className="w-[14%] text-right">
                        Valor final
                      </TableHead>
                      <TableHead className="w-[10%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.items.map((item) => {
                      const isExpanded = expanded.includes(item.id)

                      return (
                        <Fragment key={item.id}>
                          <TableRow>
                            <TableCell>
                              <ActionButton
                                Icon={
                                  isExpanded
                                    ? IconChevronDown
                                    : IconChevronRight
                                }
                                tooltip={
                                  isExpanded
                                    ? `Recolher ${item.name}`
                                    : `Ver a composição de ${item.name}`
                                }
                                onClick={() => toggle(item.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">
                                {item.name}
                                {item.variation ? (
                                  <Badge
                                    variant="neutralLight"
                                    className="ml-2 align-middle"
                                  >
                                    {item.variation}
                                  </Badge>
                                ) : null}
                              </p>
                              <p className="text-sm text-gray">
                                {item.sector}
                                {item.lines.length
                                  ? ` · ${item.lines.length} ${
                                      item.lines.length === 1
                                        ? 'linha'
                                        : 'linhas'
                                    }`
                                  : ''}
                              </p>
                            </TableCell>
                            <TableCell className="text-gray-600">
                              {item.quantity} un
                              {measure(item) ? ` · ${measure(item)}` : ''}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMoney(itemUnitPrice(item))}
                            </TableCell>
                            <TableCell className="text-right text-gray">
                              {item.discount
                                ? `- ${formatMoney(item.discount)}`
                                : '--'}
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatMoney(itemTotal(item))}
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-1">
                                <PermissionGate
                                  permissions={['sale:quotation:edit']}
                                >
                                  <ActionButton
                                    Icon={IconPencil}
                                    tooltip={`Editar ${item.name}`}
                                    onClick={() => {
                                      setEditing(item.id)

                                      if (!isExpanded) toggle(item.id)
                                    }}
                                  />
                                  <FeatureGate
                                    features={[FEATURES.COSTS.COST_BASE]}
                                  >
                                    <ActionButton
                                      Icon={IconPlus}
                                      tooltip={`Acrescentar a ${item.name}`}
                                      onClick={() => {
                                        setAddingToItem(item.id)

                                        if (!isExpanded) toggle(item.id)
                                      }}
                                    />
                                  </FeatureGate>
                                  <ActionButton
                                    Icon={IconTrash}
                                    tooltip={`Remover ${item.name}`}
                                    onClick={() => removeItem(item.id)}
                                  />
                                </PermissionGate>
                              </div>
                            </TableCell>
                          </TableRow>

                          {isExpanded && (
                            <TableRow className="bg-gray-50">
                              <TableCell />
                              <TableCell colSpan={6} className="py-4">
                                <div className="space-y-3">
                                  {item.fields.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {item.fields.map((field) => (
                                        <Badge
                                          key={field.name}
                                          variant="neutralLight"
                                        >
                                          {field.name}: {field.value}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}

                                  {item.lines.length ? (
                                    item.lines.map((line) => (
                                      <div
                                        key={line.id}
                                        className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
                                      >
                                        <Badge
                                          variant={
                                            line.kind === 'PART'
                                              ? 'blueLight'
                                              : line.kind === 'LOOSE'
                                                ? 'warningLight'
                                                : 'neutralLight'
                                          }
                                        >
                                          {line.name}
                                        </Badge>
                                        <span className="text-sm text-gray">
                                          {line.sector}
                                        </span>
                                        {line.tags.map((tag) => (
                                          <span
                                            key={tag}
                                            className="rounded-md bg-gray-100 px-2 py-0.5 text-sm text-gray-600"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                        <span className="ml-auto text-sm">
                                          {formatMoney(line.price)}
                                        </span>
                                        <PermissionGate
                                          permissions={['sale:quotation:edit']}
                                        >
                                          <ActionButton
                                            Icon={IconTrash}
                                            tooltip={`Remover ${line.name}`}
                                            onClick={() =>
                                              removeLine({
                                                itemId: item.id,
                                                lineId: line.id,
                                              })
                                            }
                                          />
                                        </PermissionGate>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray">
                                      Este item está sendo vendido pelo preço do
                                      cadastro. Acrescente processos ou partes
                                      para formar o preço pela composição.
                                    </p>
                                  )}

                                  {editing === item.id && (
                                    <ItemForm
                                      item={item}
                                      variations={
                                        products.find(
                                          (product) =>
                                            product.name === item.name,
                                        )?.variations
                                      }
                                      onCancel={() => setEditing('')}
                                      onConfirm={(values) =>
                                        updateItem({
                                          itemId: item.id,
                                          ...values,
                                        })
                                      }
                                    />
                                  )}

                                  {addingToItem === item.id && (
                                    <AddPanel
                                      allowLoose
                                      context={item.name}
                                      options={options}
                                      onClose={() => setAddingToItem('')}
                                      onPick={(option) =>
                                        addLine({ itemId: item.id, option })
                                      }
                                      onLoose={(values) =>
                                        addLoose({ itemId: item.id, ...values })
                                      }
                                    />
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-between flex-wrap gap-3">
                <p className="text-sm text-gray">
                  O que o cliente vê depende do nível de detalhamento escolhido
                  na impressão: só o nome e o preço, a lista sem valores ou a
                  lista com valores.
                </p>
                <p className="text-sm">
                  Total do orçamento:{' '}
                  <span className="text-lg font-semibold text-gray-900">
                    {formatMoney(quotationTotal(quotation.items))}
                  </span>
                </p>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </TooltipProvider>
  )
}
