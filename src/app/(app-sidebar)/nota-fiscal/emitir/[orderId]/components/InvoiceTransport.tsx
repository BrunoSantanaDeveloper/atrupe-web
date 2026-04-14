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

// Icons
import {
  IconBox,
  IconPlus,
  IconTrash,
  IconPackage,
  IconTruckDelivery,
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
  NfePrepareVolume,
} from '@/types/fiscal/nfe-prepare'

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

  const updateEmission = (field: string, value: number) => {
    onUpdate({
      ...data,
      emissao: {
        ...data.emissao,
        [field]: value,
      },
    })
  }

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
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Transportadora
                </CardTitle>
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
                    <Label>Modalidade do frete</Label>
                    <Select
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
                          className="uppercase"
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

      {/* Volumes */}
      <Card className="w-full">
        <Accordion type="single" collapsible defaultValue="volumes">
          <AccordionItem value="volumes" className="border-0">
            <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
              <div className="flex gap-3 items-center">
                <FeaturedIcon variant="neutralOutline" Icon={IconBox} />
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Volumes transportados
                </CardTitle>
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
              <CardContent className="space-y-4 p-6">
                {(!data.volumes || data.volumes.length === 0) && (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <IconPackage
                      className="mx-auto text-gray-300 mb-2"
                      size={32}
                    />
                    <p>Nenhum volume adicionado</p>
                    <Button
                      variant="link"
                      className="text-success-600"
                      onClick={addVolume}
                    >
                      Adicionar o primeiro volume
                    </Button>
                  </div>
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
                        <IconTrash size={16} />
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
    </div>
  )
}
