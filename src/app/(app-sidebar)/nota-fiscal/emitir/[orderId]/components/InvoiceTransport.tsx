'use client'

// UI
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button, buttonVariants } from '@/components/ui/button'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { EmptyState } from '@/components/ui/empty-state'

// Icons
import {
  IconBox,
  IconPlus,
  IconTrash,
  IconTruckDelivery,
  IconX,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

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
  NfePrepareVolume,
} from '@/types/fiscal/nfe-prepare'

// Components
import { SupplierSelect, type SupplierData } from './SupplierSelect'

interface Props {
  data: NfePrepareResponse
  onUpdate: (data: NfePrepareResponse) => void
}

export function InvoiceTransport({ data, onUpdate }: Props) {
  // Helpers to update nested state
  const updateTransport = (field: string, value: string) => {
    onUpdate({
      ...data,
      transportadora: {
        ...data.transportadora,
        [field]: value,
      },
    })
  }

  const updateEmission = (_field: string, _value: number) => {}

  /** Fill transportadora fields from a registered supplier */
  const handleSupplierSelect = (supplier: SupplierData | null) => {
    if (!supplier) {
      // Clear all fields
      onUpdate({
        ...data,
        transportadora: {
          cnpjCpf: '',
          razaoSocial: '',
          ie: '',
          endereco: '',
          cidade: '',
          uf: '',
        },
      })
      return
    }

    const enderecoCompleto = [supplier.address, supplier.addressNumber]
      .filter(Boolean)
      .join(', ')

    onUpdate({
      ...data,
      transportadora: {
        cnpjCpf: supplier.cnpjCpf || '',
        razaoSocial: supplier.name || '',
        ie: supplier.ie || '',
        endereco: enderecoCompleto,
        cidade: supplier.city || '',
        uf: supplier.state || '',
      },
    })
  }

  const hasTransportadoraData =
    data.transportadora.razaoSocial || data.transportadora.cnpjCpf

  const addVolume = () => {
    const newVolume: NfePrepareVolume = {
      quantidade: 1,
      especie: 'CX',
      marca: '',
      numeracao: '',
      pesoLiquido: 0,
      pesoBruto: 0,
    }
    onUpdate({
      ...data,
      volumes: [...(data.volumes || []), newVolume],
    })
  }

  const removeVolume = (index: number) => {
    const newVolumes = [...data.volumes]
    newVolumes.splice(index, 1)
    onUpdate({
      ...data,
      volumes: newVolumes,
    })
  }

  const updateVolume = (
    index: number,
    field: keyof NfePrepareVolume,
    value: string | number,
  ) => {
    const newVolumes = [...data.volumes]
    newVolumes[index] = {
      ...newVolumes[index],
      [field]: value,
    }
    onUpdate({
      ...data,
      volumes: newVolumes,
    })
  }

  return (
    <div className="space-y-4">
      {/* Transportadora */}
      <Card className="w-full">
        <Accordion type="single" collapsible defaultValue="transport">
          <AccordionItem value="transport" className="border-0">
            <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
              <div className="flex gap-3 items-center">
                <FeaturedIcon
                  variant="neutralOutline"
                  Icon={IconTruckDelivery}
                />
                <CardTitle>Transportadora</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {/* Supplier search */}
                <SupplierSelect onSelect={handleSupplierSelect} />

                {/* Clear button — only shown when there's data */}
                {hasTransportadoraData && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-400 hover:text-error-600 hover:bg-error-50 gap-1"
                    onClick={() => handleSupplierSelect(null)}
                    title="Limpar transportadora"
                  >
                    <IconX aria-hidden size={ICON_SIZE.sm} />
                    Limpar
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
              <CardContent className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Modalidade do frete</Label>
                    <Select
                      disabled
                      value={String(data.emissao.modalidadeFrete)}
                      onValueChange={(val) =>
                        updateEmission('modalidadeFrete', Number(val))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">
                          0 - Contratação do Frete por conta do Remetente (CIF)
                        </SelectItem>
                        <SelectItem value="1">
                          1 - Contratação do Frete por conta do Destinatário
                          (FOB)
                        </SelectItem>
                        <SelectItem value="2">
                          2 - Contratação do Frete por conta de Terceiros
                        </SelectItem>
                        <SelectItem value="3">
                          3 - Transporte Próprio por conta do Remetente
                        </SelectItem>
                        <SelectItem value="4">
                          4 - Transporte Próprio por conta do Destinatário
                        </SelectItem>
                        <SelectItem value="9">
                          9 - Sem Ocorrência de Transporte
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Ajuste este campo em Configuracao de emissao.
                    </p>
                  </div>
                </div>

                {data.emissao.modalidadeFrete !== 9 && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1 space-y-2">
                        <Label>CNPJ Transportadora</Label>
                        <Input
                          value={data.transportadora.cnpjCpf}
                          onChange={(e) =>
                            updateTransport('cnpjCpf', e.target.value)
                          }
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Razão Social</Label>
                        <Input
                          value={data.transportadora.razaoSocial}
                          onChange={(e) =>
                            updateTransport('razaoSocial', e.target.value)
                          }
                          placeholder="Nome da transportadora"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Inscrição Estadual</Label>
                        <Input
                          value={data.transportadora.ie}
                          onChange={(e) =>
                            updateTransport('ie', e.target.value)
                          }
                          placeholder="IE (apenas números)"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Endereço Completo</Label>
                        <Input
                          value={data.transportadora.endereco}
                          onChange={(e) =>
                            updateTransport('endereco', e.target.value)
                          }
                          placeholder="Rua, número, bairro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Cidade</Label>
                        <Input
                          value={data.transportadora.cidade}
                          onChange={(e) =>
                            updateTransport('cidade', e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>UF</Label>
                        <Input
                          value={data.transportadora.uf}
                          onChange={(e) =>
                            updateTransport('uf', e.target.value)
                          }
                          maxLength={2}
                          // eslint-disable-next-line no-restricted-syntax -- UF é digitada em maiúsculas
                          className="uppercase"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* When freight mode is 9 (no transport) but user wants to fill supplier anyway */}
                {data.emissao.modalidadeFrete === 9 &&
                  hasTransportadoraData && (
                    <>
                      <Separator />
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                        Modalidade de frete definida como &ldquo;Sem ocorrência
                        de transporte&rdquo;. Os dados de transportadora abaixo
                        serão ignorados na emissão.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50 pointer-events-none">
                        <div className="md:col-span-1 space-y-2">
                          <Label>CNPJ Transportadora</Label>
                          <Input value={data.transportadora.cnpjCpf} readOnly />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <Label>Razão Social</Label>
                          <Input
                            value={data.transportadora.razaoSocial}
                            readOnly
                          />
                        </div>
                      </div>
                    </>
                  )}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Volumes — only show when transport actually occurs */}
      {data.emissao.modalidadeFrete === 9 ? (
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center gap-3 py-4 bg-white">
            <FeaturedIcon variant="neutralOutline" Icon={IconBox} />
            <div>
              <CardTitle>Volumes transportados</CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                Não aplicável — modalidade de frete &ldquo;Sem ocorrência de
                transporte&rdquo;.
              </p>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <Card className="w-full">
          <Accordion type="single" collapsible defaultValue="volumes">
            <AccordionItem value="volumes" className="border-0">
              <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
                <div className="flex gap-3 items-center">
                  <FeaturedIcon variant="neutralOutline" Icon={IconBox} />
                  <CardTitle>Volumes transportados</CardTitle>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="neutralOutline"
                    size="sm"
                    LeftIcon={IconPlus}
                    onClick={addVolume}
                  >
                    Adicionar volume
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
                <CardContent className="space-y-4 p-6">
                  {(!data.volumes || data.volumes.length === 0) && (
                    <EmptyState
                      iconType="data"
                      title="Nenhum volume adicionado"
                      description="Adicione os volumes transportados para que sejam exibidos na nota fiscal."
                      action={
                        <Button variant="default" onClick={addVolume}>
                          Adicionar o primeiro volume
                        </Button>
                      }
                    />
                  )}

                  {data.volumes?.map((vol, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg relative border border-gray-100"
                    >
                      <div className="absolute right-2 top-2">
                        <Button
                          variant="ghost"
                          size="iconSm"
                          className="text-error-600 hover:text-error-700 hover:bg-error-50"
                          onClick={() => removeVolume(index)}
                          aria-label="Remover volume"
                        >
                          <IconTrash aria-hidden size={ICON_SIZE.sm} />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pr-8">
                        <div className="space-y-1">
                          <Label className="text-xs">Quantidade</Label>
                          <Input
                            type="number"
                            className="h-8 text-sm"
                            value={vol.quantidade}
                            onChange={(e) =>
                              updateVolume(
                                index,
                                'quantidade',
                                Number(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Espécie</Label>
                          <Input
                            className="h-8 text-sm"
                            value={vol.especie}
                            onChange={(e) =>
                              updateVolume(index, 'especie', e.target.value)
                            }
                            placeholder="CX, VOL, UN"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs">Marca</Label>
                          <Input
                            className="h-8 text-sm"
                            value={vol.marca}
                            onChange={(e) =>
                              updateVolume(index, 'marca', e.target.value)
                            }
                            placeholder="Marca volumes"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs">Numeração</Label>
                          <Input
                            className="h-8 text-sm"
                            value={vol.numeracao}
                            onChange={(e) =>
                              updateVolume(index, 'numeracao', e.target.value)
                            }
                            placeholder="Ex: 001/010"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Peso Líquido (kg)</Label>
                          <Input
                            type="number"
                            className="h-8 text-sm"
                            value={vol.pesoLiquido}
                            onChange={(e) =>
                              updateVolume(
                                index,
                                'pesoLiquido',
                                Number(e.target.value),
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Peso Bruto (kg)</Label>
                          <Input
                            type="number"
                            className="h-8 text-sm"
                            value={vol.pesoBruto}
                            onChange={(e) =>
                              updateVolume(
                                index,
                                'pesoBruto',
                                Number(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      )}
    </div>
  )
}
