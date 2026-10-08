'use client'

import { useState } from 'react'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'

// Icons
import { IconCopy, IconPlus, IconTrash } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Types
import type {
  NfePrepareResponse,
  NfePrepareDuplicata,
} from '@/types/fiscal/nfe-prepare'

interface Props {
  data: NfePrepareResponse
  onUpdate: (data: NfePrepareResponse) => void
}

export function InvoiceDuplicates({ data, onUpdate }: Props) {
  const [newDueDate, setNewDueDate] = useState('')
  const [newValue, setNewValue] = useState('')

  const addDuplicate = () => {
    // Basic validation
    if (!newDueDate || !newValue) return

    // Auto-generate number based on current count
    const num = String((data.duplicatas?.length || 0) + 1).padStart(3, '0')

    const newDup: NfePrepareDuplicata = {
      numero: num,
      dataVencimento: newDueDate,
      valor: Number(newValue),
    }

    onUpdate({
      ...data,
      duplicatas: [...(data.duplicatas || []), newDup],
    })

    // Reset fields
    setNewDueDate('')
    setNewValue('')
  }

  const removeDuplicate = (index: number) => {
    const newDuplicatas = [...data.duplicatas]
    newDuplicatas.splice(index, 1)
    onUpdate({
      ...data,
      duplicatas: newDuplicatas,
    })
  }

  const updateDuplicate = (
    index: number,
    field: keyof NfePrepareDuplicata,
    value: string | number,
  ) => {
    const newDuplicatas = [...data.duplicatas]
    newDuplicatas[index] = {
      ...newDuplicatas[index],
      [field]: value,
    }
    onUpdate({
      ...data,
      duplicatas: newDuplicatas,
    })
  }

  const totalDuplicatas =
    data.duplicatas?.reduce((acc, d) => acc + (d.valor || 0), 0) || 0

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <Accordion type="single" collapsible defaultValue="duplicates">
        <AccordionItem value="duplicates" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconCopy} />
              <div className="flex flex-col">
                <CardTitle>Duplicatas / Fatura</CardTitle>
                <span className="text-xs text-gray-500">
                  Total: {formatCurrency(totalDuplicatas)}
                </span>
              </div>
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
            <CardContent className="p-6 space-y-4">
              {/* Add form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="space-y-2">
                  <Label>Vencimento</Label>
                  <Input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <Button
                  variant="neutralOutline"
                  className="w-full md:w-auto"
                  LeftIcon={IconPlus}
                  onClick={addDuplicate}
                  disabled={!newDueDate || !newValue}
                >
                  Adicionar
                </Button>
              </div>

              {/* List */}
              <div className="space-y-2">
                {!data.duplicatas || data.duplicatas.length === 0 ? (
                  <EmptyState
                    iconType="search"
                    title="Nenhuma duplicata adicionada"
                    description="Insira as duplicatas pelo formulário acima."
                  />
                ) : (
                  data.duplicatas.map((dup, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-3 border rounded-lg bg-white"
                    >
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full shrink-0">
                        <span className="font-semibold text-gray-600">
                          #{dup.numero}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div>
                          <Label className="text-xs text-gray-500">
                            Vencimento
                          </Label>
                          <Input
                            type="date"
                            value={dup.dataVencimento}
                            onChange={(e) =>
                              updateDuplicate(
                                idx,
                                'dataVencimento',
                                e.target.value,
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Valor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={dup.valor}
                            onChange={(e) =>
                              updateDuplicate(
                                idx,
                                'valor',
                                Number(e.target.value),
                              )
                            }
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="iconSm"
                        className="text-gray-400 hover:text-error-600"
                        onClick={() => removeDuplicate(idx)}
                        aria-label="Remover duplicata"
                      >
                        <IconTrash size={ICON_SIZE.sm} />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
