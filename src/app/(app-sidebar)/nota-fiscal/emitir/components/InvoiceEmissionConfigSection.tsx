'use client'

import { useState, useEffect } from 'react'

// UI
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog'

// Icons
import {
  IconSettings,
  IconAlertTriangle,
  IconInfoCircle,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Libs
import { cn } from '@/lib/utils'

// Actions
import { getData } from '@/actions/_cruds'

// Types
import type {
  NfePrepareEmissao,
  NfePrepareResponse,
} from '@/types/fiscal/nfe-prepare'

interface OperationNature {
  id: string
  description: string
  type: 'ENTRADA' | 'SAIDA'
  isActive: boolean
}

interface Props {
  data: NfePrepareResponse
  onUpdate: (data: NfePrepareResponse, options?: { persist?: boolean }) => void
}

const finalityOptions = [
  { value: '1', label: '1 - NF-e normal' },
  { value: '2', label: '2 - NF-e complementar' },
  { value: '3', label: '3 - NF-e de ajuste' },
  { value: '4', label: '4 - Devolução/Retorno' },
]

const consumerPresenceOptions = [
  { value: '0', label: '0 - Não se aplica' },
  { value: '1', label: '1 - Operação presencial' },
  { value: '2', label: '2 - Operação não presencial, pela Internet' },
  { value: '3', label: '3 - Operação não presencial, Teleatendimento' },
  { value: '4', label: '4 - NFC-e com entrega a domicílio' },
  { value: '9', label: '9 - Operação não presencial, outros' },
]

const freightOptions = [
  { value: '0', label: '0 - Frete por conta do remetente (CIF)' },
  { value: '1', label: '1 - Frete por conta do destinatário (FOB)' },
  { value: '2', label: '2 - Frete por conta de terceiros' },
  { value: '3', label: '3 - Transporte próprio pelo remetente' },
  { value: '4', label: '4 - Transporte próprio pelo destinatário' },
  { value: '9', label: '9 - Sem ocorrência de transporte' },
]

function getDestinoLabel(destino: number) {
  if (destino === 1) return '1 - Operação interna'
  if (destino === 2) return '2 - Operação interestadual'
  return String(destino || '')
}

function toDateTimeLocal(value?: string) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const timezoneOffset = date.getTimezoneOffset() * 60000
  // 19 e nao 16: cortar nos minutos zerava os segundos e ja colocava a data de
  // saida ate 59s antes da emissao, o que a SEFAZ rejeita (505).
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 19)
}

function fromDateTimeLocal(value: string) {
  if (!value) return new Date().toISOString()
  return new Date(value).toISOString()
}

function cleanNfeKey(value?: string | null) {
  return (value || '').replace(/\D/g, '')
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="space-y-1">
      <p className="type-label">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value || '-'}</p>
    </div>
  )
}

const CUSTOM_VALUE = '__custom__'

export function InvoiceEmissionConfigSection({ data, onUpdate }: Props) {
  const referencedKey = cleanNfeKey(data.emissao.nfeReferenciada)
  const hasInvalidReferencedKey =
    referencedKey.length > 0 && referencedKey.length !== 44

  const [naturezas, setNaturezas] = useState<OperationNature[]>([])
  const [customModalOpen, setCustomModalOpen] = useState(false)
  const [customDraft, setCustomDraft] = useState('')

  useEffect(() => {
    getData({ route: '/fiscal/naturezas' })
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setNaturezas(res.data.filter((n: OperationNature) => n.isActive))
        }
      })
      .catch(() => {})
  }, [])

  // Determina se o valor atual está na lista de naturezas cadastradas
  const currentNature = data.emissao.operationNature || ''
  const isInList = naturezas.some((n) => n.description === currentNature)
  // Quando não está na lista e não é vazio, é modo custom
  const isCustomMode = currentNature !== '' && !isInList
  const selectValue = currentNature

  const updateEmission = <K extends keyof NfePrepareEmissao>(
    field: K,
    value: NfePrepareEmissao[K],
    persist = true,
  ) => {
    onUpdate(
      {
        ...data,
        emissao: {
          ...data.emissao,
          [field]: value,
        },
      },
      { persist },
    )
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <Accordion type="single" collapsible defaultValue="config">
        <AccordionItem value="config" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconSettings} />
              <CardTitle>Configuracao de emissao</CardTitle>
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
            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-6 border-b border-gray-100 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <ReadOnlyField label="Emissor" value={data.emissao.emissor} />
                <ReadOnlyField label="CNPJ" value={data.emissao.emissorCnpj} />
                <ReadOnlyField
                  label="Proximo documento"
                  value={data.emissao.proximoDocumento}
                />
                <ReadOnlyField
                  label="Ambiente"
                  value={
                    data.emissao.ambiente === 'HOMOLOGACAO'
                      ? 'Homologacao'
                      : 'Producao'
                  }
                />
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label>Data de saida/entrada</Label>
                  <Input
                    type="datetime-local"
                    // step=1 faz o navegador exibir e preservar os segundos.
                    step="1"
                    value={toDateTimeLocal(data.emissao.dataSaida)}
                    onChange={(event) =>
                      updateEmission(
                        'dataSaida',
                        fromDateTimeLocal(event.target.value),
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={String(data.emissao.tipo)}
                    onValueChange={(value) =>
                      updateEmission('tipo', Number(value) as 0 | 1)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Saida</SelectItem>
                      <SelectItem value="0">0 - Entrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Natureza da operacao</Label>
                  <Select
                    value={selectValue}
                    onValueChange={(value) => {
                      if (value === CUSTOM_VALUE) {
                        // Abre modal para digitar texto livre
                        setCustomDraft(isCustomMode ? currentNature : '')
                        setCustomModalOpen(true)
                      } else {
                        updateEmission('operationNature', value)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a natureza da operação" />
                    </SelectTrigger>
                    <SelectContent>
                      {naturezas.map((n) => (
                        <SelectItem key={n.id} value={n.description}>
                          {n.description}
                        </SelectItem>
                      ))}
                      {isCustomMode && (
                        <SelectItem value={currentNature}>
                          {currentNature} (Personalizado)
                        </SelectItem>
                      )}
                      {naturezas.length === 0 && !isCustomMode && (
                        <SelectItem value="__empty__" disabled>
                          Nenhuma natureza cadastrada
                        </SelectItem>
                      )}
                      <SelectItem value={CUSTOM_VALUE}>
                        + Inserir texto livre
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Modal de texto livre para Natureza da Operação */}
                  <Dialog
                    open={customModalOpen}
                    onOpenChange={setCustomModalOpen}
                  >
                    <DialogContent className="sm:max-w-[420px]">
                      <DialogHeader>
                        <DialogTitle>
                          Natureza da Operação (texto livre)
                        </DialogTitle>
                        <DialogDescription>
                          Digite a natureza da operação conforme necessário para
                          esta NF-e.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogBody>
                        <div className="py-2">
                          <Input
                            autoFocus
                            value={customDraft}
                            onChange={(e) => setCustomDraft(e.target.value)}
                            placeholder="Ex: Venda de mercadoria"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customDraft.trim()) {
                                updateEmission(
                                  'operationNature',
                                  customDraft.trim(),
                                )
                                setCustomModalOpen(false)
                              }
                            }}
                          />
                        </div>
                      </DialogBody>
                      <DialogFooter>
                        <Button
                          variant="neutralOutline"
                          onClick={() => setCustomModalOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={() => {
                            if (customDraft.trim()) {
                              updateEmission(
                                'operationNature',
                                customDraft.trim(),
                              )
                            }
                            setCustomModalOpen(false)
                          }}
                          disabled={!customDraft.trim()}
                        >
                          Confirmar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2">
                  <Label>Finalidade da emissao</Label>
                  <Select
                    value={String(data.emissao.finalidade)}
                    onValueChange={(value) =>
                      updateEmission('finalidade', Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {finalityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {data.emissao.finalidade === 4 &&
                    !data.emissao.nfeReferenciada && (
                      <p className="text-xs text-warning-600 flex items-center gap-1 mt-1">
                        <IconAlertTriangle size={ICON_SIZE.sm} />
                        NF-e de devolução requer a chave da NF-e original.
                      </p>
                    )}
                  {data.emissao.finalidade === 4 && data.emissao.tipo !== 0 && (
                    <p className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                      <IconInfoCircle size={ICON_SIZE.sm} />
                      Para devolução de venda, o tipo deve ser &quot;0 -
                      Entrada&quot;.
                    </p>
                  )}
                  {data.emissao.finalidade === 2 &&
                    !data.emissao.nfeReferenciada && (
                      <p className="text-xs text-warning-600 flex items-center gap-1 mt-1">
                        <IconAlertTriangle size={ICON_SIZE.sm} />
                        NF-e complementar requer a chave da NF-e original.
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label>Consumidor final</Label>
                  <Select
                    value={String(data.emissao.consumidorFinal)}
                    onValueChange={(value) =>
                      updateEmission('consumidorFinal', Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - Nao</SelectItem>
                      <SelectItem value="1">1 - Sim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Presenca do consumidor</Label>
                  <Select
                    value={String(data.emissao.presencaConsumidor)}
                    onValueChange={(value) =>
                      updateEmission('presencaConsumidor', Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {consumerPresenceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Modalidade de frete</Label>
                  <Select
                    value={String(data.emissao.modalidadeFrete)}
                    onValueChange={(value) =>
                      updateEmission('modalidadeFrete', Number(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {freightOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2 xl:col-span-3">
                  <Label>NF-e referenciada</Label>
                  <Input
                    value={data.emissao.nfeReferenciada || ''}
                    onChange={(event) =>
                      updateEmission(
                        'nfeReferenciada',
                        cleanNfeKey(event.target.value),
                        false,
                      )
                    }
                    onBlur={(event) =>
                      updateEmission(
                        'nfeReferenciada',
                        cleanNfeKey(event.target.value) || null,
                      )
                    }
                    maxLength={44}
                    placeholder="Chave de acesso com 44 digitos"
                    className={cn(
                      hasInvalidReferencedKey &&
                        'border-error focus-visible:border-error focus-visible:ring-error',
                    )}
                  />
                  {hasInvalidReferencedKey && (
                    <p className="text-xs text-error-600">
                      Informe uma chave de acesso com 44 digitos.
                    </p>
                  )}
                </div>

                <div className="space-y-1 self-end">
                  <p className="type-label">Destino da operação</p>
                  <p className="min-h-10 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm font-semibold text-gray-700">
                    {getDestinoLabel(data.emissao.destinoOperacao)}
                  </p>
                </div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
