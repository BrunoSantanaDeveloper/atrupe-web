'use client'

import { useState } from 'react'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'

// Icons
import {
  IconCoin,
  IconPlus,
  IconTrash,
  IconReceipt,
  IconCalculator,
  IconRefresh,
  IconAlertTriangle,
} from '@tabler/icons-react'

import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

// Types
import type {
  NfePrepareResponse,
  NfePrepareDuplicata,
} from '@/types/fiscal/nfe-prepare'

interface Props {
  data: NfePrepareResponse
  onUpdate: (data: NfePrepareResponse) => void
  /** Valor total da nota calculado em tempo real a partir dos itens editados */
  computedValorNota?: number
}

/** Formata valor monetário para exibição */
function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function InvoicePayment({ data, onUpdate, computedValorNota }: Props) {
  const [installmentCount, setInstallmentCount] = useState(1)

  // O valor da NF vigente: usa o computado (com edições de itens) quando disponível
  const currentTotal =
    computedValorNota !== undefined ? computedValorNota : data.totais.valorNota

  // Detecta divergência entre o valor de pagamento declarado e o total real da NF
  const paymentValue = data.pagamento?.valor ?? 0
  const hasDivergence =
    Math.abs(paymentValue - currentTotal) > 0.01 && currentTotal > 0

  const updatePayment = (field: string, value: string | number) => {
    onUpdate({
      ...data,
      pagamento: {
        ...data.pagamento,
        [field]: value,
      },
    })
  }

  /** Sincroniza o valor do pagamento com o total atual da NF */
  const syncPaymentValue = () => {
    updatePayment('valor', Number(currentTotal.toFixed(2)))
  }

  const addDuplicata = () => {
    const nextNum = (data.duplicatas?.length || 0) + 1
    const newDup: NfePrepareDuplicata = {
      numero: nextNum.toString().padStart(3, '0'),
      dataVencimento: new Date().toISOString().split('T')[0],
      valor: 0,
    }
    onUpdate({
      ...data,
      duplicatas: [...(data.duplicatas || []), newDup],
    })
  }

  const removeDuplicata = (index: number) => {
    const newDups = [...data.duplicatas]
    newDups.splice(index, 1)
    onUpdate({
      ...data,
      duplicatas: newDups,
    })
  }

  const updateDuplicata = (
    index: number,
    field: keyof NfePrepareDuplicata,
    value: string | number,
  ) => {
    const newDups = [...data.duplicatas]
    newDups[index] = {
      ...newDups[index],
      [field]: value,
    }
    onUpdate({
      ...data,
      duplicatas: newDups,
    })
  }

  /**
   * Gera parcelas usando o total ATUAL da NF (computedValorNota),
   * garantindo que edições nos itens sejam refletidas.
   */
  const generateInstallments = () => {
    if (installmentCount < 1 || currentTotal <= 0) return

    const installmentValue = Number(
      (currentTotal / installmentCount).toFixed(2),
    )
    const remainder = Number(
      (currentTotal - installmentValue * installmentCount).toFixed(2),
    )

    const newDups: NfePrepareDuplicata[] = []
    const today = new Date()

    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date(today)
      dueDate.setDate(dueDate.getDate() + 30 * (i + 1))

      newDups.push({
        numero: (i + 1).toString().padStart(3, '0'),
        dataVencimento: dueDate.toISOString().split('T')[0],
        valor:
          i === installmentCount - 1
            ? Number((installmentValue + remainder).toFixed(2))
            : installmentValue,
      })
    }

    // Sincroniza também o valor do pagamento ao gerar as parcelas
    onUpdate({
      ...data,
      pagamento: {
        ...data.pagamento,
        valor: Number(currentTotal.toFixed(2)),
      },
      duplicatas: newDups,
    })
  }

  return (
    <div className="space-y-4">
      {/* Pagamento */}
      <Card className="w-full">
        <Accordion type="single" collapsible defaultValue="payment">
          <AccordionItem value="payment" className="border-0">
            <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
              <div className="flex gap-3 items-center">
                <FeaturedIcon variant="neutralOutline" Icon={IconCoin} />
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Pagamento
                </CardTitle>
                {hasDivergence && (
                  <Badge
                    variant="warning"
                    className="text-xs flex items-center gap-1"
                  >
                    <IconAlertTriangle size={12} />
                    Valor diverge do total da NF
                  </Badge>
                )}
              </div>
              <AccordionTrigger
                className={cn(
                  buttonVariants({
                    variant: 'neutralLight',
                    size: 'icon',
                  }),
                  'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                )}
              />
            </CardHeader>
            <AccordionContent>
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Meio de Pagamento</Label>
                    <Select
                      value={data.pagamento.forma}
                      onValueChange={(val) => updatePayment('forma', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01">01 - Dinheiro</SelectItem>
                        <SelectItem value="02">02 - Cheque</SelectItem>
                        <SelectItem value="03">
                          03 - Cartão de Crédito
                        </SelectItem>
                        <SelectItem value="04">
                          04 - Cartão de Débito
                        </SelectItem>
                        <SelectItem value="05">05 - Crédito Loja</SelectItem>
                        <SelectItem value="10">
                          10 - Vale Alimentação
                        </SelectItem>
                        <SelectItem value="11">11 - Vale Refeição</SelectItem>
                        <SelectItem value="12">12 - Vale Presente</SelectItem>
                        <SelectItem value="13">
                          13 - Vale Combustível
                        </SelectItem>
                        <SelectItem value="14">
                          14 - Duplicata Mercantil
                        </SelectItem>
                        <SelectItem value="15">15 - Boleto Bancário</SelectItem>
                        <SelectItem value="16">
                          16 - Depósito Bancário
                        </SelectItem>
                        <SelectItem value="17">
                          17 - Pagamento Instantâneo (PIX)
                        </SelectItem>
                        <SelectItem value="18">
                          18 - Transferência Bancária
                        </SelectItem>
                        <SelectItem value="90">90 - Sem pagamento</SelectItem>
                        <SelectItem value="99">99 - Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Valor do Pagamento</Label>
                      {hasDivergence && (
                        <button
                          type="button"
                          onClick={syncPaymentValue}
                          className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 transition-colors"
                          title={`Sincronizar com total da NF (${formatCurrency(currentTotal)})`}
                        >
                          <IconRefresh size={12} />
                          Sincronizar ({formatCurrency(currentTotal)})
                        </button>
                      )}
                    </div>
                    <Input
                      type="number"
                      value={data.pagamento.valor}
                      onChange={(e) =>
                        updatePayment('valor', Number(e.target.value))
                      }
                      className={cn(
                        hasDivergence &&
                          'border-warning-400 focus-visible:ring-warning-300',
                      )}
                    />
                    {hasDivergence && (
                      <p className="text-xs text-warning-600">
                        Total da NF:{' '}
                        <strong>{formatCurrency(currentTotal)}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Duplicatas */}
      <Card className="w-full">
        <Accordion type="single" collapsible defaultValue="duplicates">
          <AccordionItem value="duplicates" className="border-0">
            <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
              <div className="flex gap-3 items-center">
                <FeaturedIcon variant="neutralOutline" Icon={IconReceipt} />
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Duplicatas
                </CardTitle>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="neutralOutline"
                  size="sm"
                  LeftIcon={IconPlus}
                  onClick={addDuplicata}
                >
                  Adicionar
                </Button>
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
              </div>
            </CardHeader>
            <AccordionContent>
              <CardContent className="space-y-6 p-6">
                {/* Gerador de Parcelas */}
                <div className="bg-gray-50/50 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-end border border-gray-100">
                  <div className="w-full md:w-auto flex-1 space-y-1">
                    <Label className="text-xs">
                      Gerar parcelas automáticas
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={installmentCount}
                        onChange={(e) =>
                          setInstallmentCount(Number(e.target.value))
                        }
                        placeholder="Qtd."
                        className="w-20"
                      />
                      <Button variant="neutral" onClick={generateInstallments}>
                        <IconCalculator size={16} className="mr-2" />
                        Gerar
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 pb-2">
                    Divide{' '}
                    <strong className="text-gray-700">
                      {formatCurrency(currentTotal)}
                    </strong>{' '}
                    em parcelas mensais (30 dias).
                  </div>
                </div>

                {/* Lista de Duplicatas */}
                {(!data.duplicatas || data.duplicatas.length === 0) && (
                  <EmptyState
                    iconType="search"
                    title="Nenhuma duplicata informada"
                    description="Adicione duplicatas ou gere parcelas automáticas."
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.duplicatas?.map((dup, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg relative hover:border-brand-200 transition-colors bg-white shadow-sm"
                    >
                      <button
                        onClick={() => removeDuplicata(index)}
                        className="absolute right-2 top-2 text-gray-400 hover:text-error-600 p-1"
                        aria-label="Remover duplicata"
                      >
                        <IconTrash size={14} />
                      </button>

                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-gray-500">
                              Número
                            </Label>
                            <Input
                              className="h-8 text-sm"
                              value={dup.numero}
                              onChange={(e) =>
                                updateDuplicata(index, 'numero', e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-gray-500">
                              Vencimento
                            </Label>
                            <Input
                              type="date"
                              className="h-8 text-sm"
                              value={dup.dataVencimento}
                              onChange={(e) =>
                                updateDuplicata(
                                  index,
                                  'dataVencimento',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase text-gray-500">
                            Valor
                          </Label>
                          <Input
                            type="number"
                            className="h-8 text-sm font-medium"
                            value={dup.valor}
                            onChange={(e) =>
                              updateDuplicata(
                                index,
                                'valor',
                                Number(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  )
}
