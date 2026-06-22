'use client'

import { useState } from 'react'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Badge } from '@/components/ui/badge'

// Icons
import {
  IconPencil,
  IconSettings,
  IconLayoutGrid,
  IconTrash,
} from '@tabler/icons-react'
import { Checkbox } from '@/components/ui/checkbox'

import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

// Components
import { InvoiceItemEditDialog } from './InvoiceItemEditDialog'
import { ProductSelector } from '@/app/(app-sidebar)/nota-fiscal/components/ProductSelector'

// Types
import type {
  NfePrepareResponse,
  NfePrepareItem,
} from '@/types/fiscal/nfe-prepare'

interface Props {
  data: NfePrepareResponse
  onUpdate: (data: NfePrepareResponse) => void
  /** Quando fornecido, exibe o ProductSelector para adicionar itens */
  onAddProduct?: (item: NfePrepareItem) => void
  /** Quando fornecido, exibe botão de remover por linha */
  onRemoveItem?: (itemNumber: number) => void
}

export function InvoiceItems({
  data,
  onUpdate,
  onAddProduct,
  onRemoveItem,
}: Props) {
  const [editItem, setEditItem] = useState<{
    item: NfePrepareItem
    initialTab: 'valores' | 'fiscal'
  } | null>(null)

  // Filter out services for NF-e
  const filteredItems = data.items.filter((item) => !item.isService)

  const handleUpdateItem = (updatedItem: NfePrepareItem) => {
    const newItems = data.items.map((item) =>
      item.itemNumber === updatedItem.itemNumber ? updatedItem : item,
    )
    onUpdate({
      ...data,
      items: newItems,
    })
    setEditItem(null)
  }

  // Format currency
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00'
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const showAddRemove = !!onAddProduct || !!onRemoveItem

  return (
    <>
      <Card className="border-none shadow-sm overflow-hidden">
        <Accordion type="single" collapsible defaultValue="items">
          <AccordionItem value="items" className="border-0">
            <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
              <div className="flex gap-3 items-center">
                <FeaturedIcon variant="neutralOutline" Icon={IconLayoutGrid} />
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Itens
                </CardTitle>
                {filteredItems.length > 0 && (
                  <Badge variant="neutralLight" className="text-xs">
                    {filteredItems.length}
                  </Badge>
                )}
              </div>
              <div>
                <AccordionTrigger
                  className={cn(
                    buttonVariants({
                      variant: 'neutralLight',
                      size: 'icon',
                    }),
                    'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                  )}
                />
              </div>
            </CardHeader>
            <AccordionContent>
              <CardContent className="p-0">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <IconLayoutGrid size={32} className="mb-3 opacity-40" />
                    <p className="text-sm font-medium">
                      Nenhum item adicionado
                    </p>
                    <p className="text-xs mt-1">
                      Use o botão abaixo para adicionar produtos à NF
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 border-y border-gray-100">
                          <TableHead className="w-[40px] px-4">
                            <Checkbox id="selectAll" />
                          </TableHead>
                          <TableHead className="px-6 py-3 font-medium text-gray-500 text-xs w-[35%]">
                            Referência
                          </TableHead>
                          <TableHead className="px-4 py-3 font-medium text-gray-500 text-xs w-[20%]">
                            CST
                          </TableHead>
                          <TableHead className="px-4 py-3 font-medium text-gray-500 text-xs text-right">
                            Frete
                          </TableHead>
                          <TableHead className="px-4 py-3 font-medium text-gray-500 text-xs text-right">
                            Seguro
                          </TableHead>
                          <TableHead className="px-4 py-3 font-medium text-gray-500 text-xs text-right">
                            Desconto
                          </TableHead>
                          <TableHead className="px-4 py-3 font-medium text-gray-500 text-xs text-right">
                            Valor unitário
                          </TableHead>
                          <TableHead className="px-4 py-3 font-medium text-gray-500 text-xs text-center">
                            Qtd.
                          </TableHead>
                          <TableHead className="px-4 py-3 font-medium text-gray-500 text-xs text-right">
                            Valor final
                          </TableHead>
                          <TableHead className="px-6 py-3 w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow
                            key={item.itemNumber}
                            className="group hover:bg-gray-50/50 transition-colors"
                          >
                            <TableCell className="px-4 align-top py-4">
                              <Checkbox id={`check-${item.itemNumber}`} />
                            </TableCell>
                            {/* Referência */}
                            <TableCell className="px-6 py-4 align-top">
                              <div className="space-y-1">
                                <p className="font-medium text-gray-900 line-clamp-2">
                                  {item.itemNumber} - {item.description}
                                </p>
                                <div className="text-xs text-gray-500 font-mono mt-1 space-y-0.5">
                                  <div>CÓD: {item.productCode || 'N/D'}</div>
                                  <div>NCM: {item.ncm || 'N/D'}</div>
                                  <div>CFOP: {item.cfop || 'N/D'}</div>
                                </div>
                                {item.needsConfiguration && (
                                  <p className="mt-1.5 text-xs text-error-600 font-medium bg-error-50 inline-block px-2 py-0.5 rounded">
                                    Este item ainda não foi configurado.
                                  </p>
                                )}
                              </div>
                            </TableCell>

                            {/* CST / Configurar */}
                            <TableCell className="px-4 py-4 align-top">
                              {item.needsConfiguration ? (
                                <Button
                                  variant="default"
                                  size="sm"
                                  LeftIcon={IconSettings}
                                  className="font-medium"
                                  onClick={() =>
                                    setEditItem({ item, initialTab: 'fiscal' })
                                  }
                                >
                                  Configurar
                                </Button>
                              ) : (
                                <div className="text-[13px] text-gray-500 space-y-0.5 mt-0.5">
                                  <div>ICMS: {item.cstIcms || '-'}</div>
                                  <div>COFINS: {item.cstCofins || '-'}</div>
                                  <div>PIS: {item.cstPis || '-'}</div>
                                  <div>
                                    IPI: {item.cstIpi || 'Sem enquadramento'}
                                  </div>
                                </div>
                              )}
                            </TableCell>

                            {/* Valores e Quantidade */}
                            <TableCell className="px-4 py-4 text-right text-gray-600 text-sm align-top font-medium tabular-nums">
                              {item.freight > 0
                                ? formatCurrency(item.freight)
                                : '-'}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right text-gray-600 text-sm align-top font-medium tabular-nums">
                              {item.insurance > 0
                                ? formatCurrency(item.insurance)
                                : '-'}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right text-gray-600 text-sm align-top font-medium tabular-nums text-error-600">
                              {item.discount > 0
                                ? `- ${formatCurrency(item.discount)}`
                                : '-'}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right text-gray-900 text-sm align-top font-medium tabular-nums">
                              {formatCurrency(item.unitValue)}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-center text-gray-900 text-sm align-top font-medium whitespace-nowrap">
                              {item.quantity}{' '}
                              <span className="text-xs text-gray-500">
                                {item.unit || item.uCom || 'UN'}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-4 text-right text-gray-900 font-bold text-sm align-top tabular-nums">
                              {formatCurrency(item.totalValue)}
                            </TableCell>

                            {/* Ações */}
                            <TableCell className="px-4 py-4 text-right align-top">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="neutralGhost"
                                  size="iconSm"
                                  aria-label="Editar item"
                                  className="text-gray-400 hover:text-gray-600"
                                  onClick={() =>
                                    setEditItem({ item, initialTab: 'valores' })
                                  }
                                >
                                  <IconPencil size={16} />
                                </Button>
                                {onRemoveItem && (
                                  <Button
                                    variant="neutralGhost"
                                    size="iconSm"
                                    aria-label="Remover item"
                                    className="text-gray-300 hover:text-error-500 hover:bg-error-50"
                                    onClick={() =>
                                      onRemoveItem(item.itemNumber)
                                    }
                                  >
                                    <IconTrash size={16} />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Rodapé: Add/Remove */}
                {showAddRemove && (
                  <div className="flex flex-wrap items-center gap-2 p-4 border-t border-gray-100 bg-gray-50/50">
                    {onAddProduct && (
                      <ProductSelector
                        onAddProduct={onAddProduct}
                        nextItemNumber={data.items.length + 1}
                        defaultCfop={data.defaultCfop || '5101'}
                        preferDefaultCfop={[2, 4].includes(
                          data.emissao.finalidade,
                        )}
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Dialog unificado (Valores + Dados Fiscais) */}
      {editItem && (
        <InvoiceItemEditDialog
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          item={editItem.item}
          onSave={handleUpdateItem}
          productId={editItem.item.productId}
          initialTab={editItem.initialTab}
        />
      )}
    </>
  )
}
