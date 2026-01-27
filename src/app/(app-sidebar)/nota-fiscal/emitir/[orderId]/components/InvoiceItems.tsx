'use client'

import { useState } from 'react'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'

// Icons
import { IconPencil, IconSettings, IconLayoutGrid } from '@tabler/icons-react'

import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

// Components
import { InvoiceItemConfigDialog } from './InvoiceItemConfigDialog'
import { InvoiceItemEditDialog } from './InvoiceItemEditDialog'

// Types
import type {
  NfePrepareResponse,
  NfePrepareItem,
} from '@/types/fiscal/nfe-prepare'

interface Props {
  data: NfePrepareResponse
  onUpdate: (data: NfePrepareResponse) => void
}

export function InvoiceItems({ data, onUpdate }: Props) {
  const [configItem, setConfigItem] = useState<NfePrepareItem | null>(null)
  const [editItem, setEditItem] = useState<NfePrepareItem | null>(null)

  const handleUpdateItem = (updatedItem: NfePrepareItem) => {
    const newItems = data.items.map((item) =>
      item.itemNumber === updatedItem.itemNumber ? updatedItem : item,
    )
    onUpdate({
      ...data,
      items: newItems,
    })
  }

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <>
      <Card className="border-none shadow-sm overflow-hidden">
        <Accordion type="single" collapsible defaultValue="items">
          <AccordionItem value="items" className="border-0">
            <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
              <div className="flex gap-3 items-center">
                <FeaturedIcon variant="neutralOutline" Icon={IconLayoutGrid} />
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Itens ({data.items.length})
                </CardTitle>
              </div>
              <div className="flex gap-3">
                {data.items.some((i) => i.needsConfiguration) && (
                  <Button
                    variant="success"
                    size="sm"
                    className="bg-[#32BCAD] border-[#32BCAD] hover:bg-[#2da89b]"
                    LeftIcon={IconSettings}
                    onClick={() => {
                      /* Just open first for now or let user handle per row */
                      const firstIncomplete = data.items.find(
                        (i) => i.needsConfiguration,
                      )
                      if (firstIncomplete) setConfigItem(firstIncomplete)
                    }}
                  >
                    Configurar
                  </Button>
                )}
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-gray-50 border-y border-gray-100">
                      <tr>
                        <th className="px-6 py-3 font-medium text-gray-500 uppercase text-xs tracking-wider w-[35%]">
                          Referência
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs tracking-wider w-[20%]">
                          CST
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs tracking-wider text-right">
                          Frete
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs tracking-wider text-right">
                          Seguro
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs tracking-wider text-right">
                          Valor unitário
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs tracking-wider text-center">
                          Qtd.
                        </th>
                        <th className="px-4 py-3 font-medium text-gray-500 uppercase text-xs tracking-wider text-right">
                          Valor final
                        </th>
                        <th className="px-6 py-3 w-[50px]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.items.map((item) => (
                        <tr
                          key={item.itemNumber}
                          className="group hover:bg-gray-50/50 transition-colors"
                        >
                          {/* Referência */}
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-900 line-clamp-2">
                                {item.itemNumber} - {item.description}
                              </p>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 font-mono mt-1">
                                <span>COD: {item.productCode || 'N/D'}</span>
                                <span className="text-gray-300">|</span>
                                <span>NCM: {item.ncm || 'N/D'}</span>
                                <span className="text-gray-300">|</span>
                                <span>CFOP: {item.cfop || 'N/D'}</span>
                              </div>
                              {item.needsConfiguration && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge
                                    variant="error"
                                    className="text-[10px] h-5 px-1.5"
                                  >
                                    Incompleto
                                  </Badge>
                                  <p className="text-[11px] text-error-600 font-medium">
                                    Requer configuração fiscal
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* CST / Configurar */}
                          <td className="px-4 py-4 align-top">
                            {item.needsConfiguration ? (
                              <Button
                                variant="success"
                                size="sm"
                                LeftIcon={IconSettings}
                                className="font-medium"
                                onClick={() => setConfigItem(item)}
                              >
                                Configurar
                              </Button>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-semibold text-gray-600 w-12 text-right">
                                    ICMS:
                                  </span>
                                  <span className="text-gray-500 font-mono bg-gray-100 px-1 rounded">
                                    {item.cstIcms}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-semibold text-gray-600 w-12 text-right">
                                    PIS:
                                  </span>
                                  <span className="text-gray-500 font-mono bg-gray-100 px-1 rounded">
                                    {item.cstPis || '-'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-semibold text-gray-600 w-12 text-right">
                                    COFINS:
                                  </span>
                                  <span className="text-gray-500 font-mono bg-gray-100 px-1 rounded">
                                    {item.cstCofins || '-'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-semibold text-gray-600 w-12 text-right">
                                    IPI:
                                  </span>
                                  <span className="text-gray-500 font-mono bg-gray-100 px-1 rounded">
                                    {item.cstIpi || '-'}
                                  </span>
                                </div>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 text-[10px] text-blue-600 mt-1 hover:text-blue-700"
                                  onClick={() => setConfigItem(item)}
                                >
                                  Editar tributos
                                </Button>
                              </div>
                            )}
                          </td>

                          {/* Valores e Quantidade */}
                          <td className="px-4 py-4 text-right text-gray-600 text-sm align-top font-medium tabular-nums">
                            {item.freight > 0
                              ? formatCurrency(item.freight)
                              : '-'}
                          </td>
                          <td className="px-4 py-4 text-right text-gray-600 text-sm align-top font-medium tabular-nums">
                            {item.insurance > 0
                              ? formatCurrency(item.insurance)
                              : '-'}
                          </td>
                          <td className="px-4 py-4 text-right text-gray-900 text-sm align-top font-medium tabular-nums">
                            {formatCurrency(item.unitValue)}
                          </td>
                          <td className="px-4 py-4 text-center text-gray-900 text-sm align-top font-medium">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 text-right text-success-700 font-bold text-sm align-top tabular-nums">
                            {formatCurrency(item.totalValue)}
                          </td>

                          {/* Ações */}
                          <td className="px-6 py-4 text-right align-top">
                            <Button
                              variant="neutralGhost"
                              size="iconSm"
                              className="text-gray-400 group-hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => setEditItem(item)}
                            >
                              <IconPencil size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Dialogs */}
      {configItem && (
        <InvoiceItemConfigDialog
          open={!!configItem}
          onOpenChange={(open) => !open && setConfigItem(null)}
          item={configItem}
          onSave={handleUpdateItem}
        />
      )}

      {editItem && (
        <InvoiceItemEditDialog
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(null)}
          item={editItem}
          onSave={handleUpdateItem}
        />
      )}
    </>
  )
}
