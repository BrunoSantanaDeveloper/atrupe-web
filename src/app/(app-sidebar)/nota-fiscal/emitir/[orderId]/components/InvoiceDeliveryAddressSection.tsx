'use client'

import { useState, useEffect } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useClientAddresses } from '@/hooks/queries/useClientAddresses'
import { IconMapPin, IconEdit } from '@tabler/icons-react'
import type { NfePrepareEntrega } from '@/types/fiscal/nfe-prepare'

export interface ClientAddressItem {
  id: string
  label?: string
  street?: string
  number?: string
  neighborhood?: string
  city?: string
  state?: string
  zipcode?: string
  complement?: string
  type?: string
}

interface DestinatarioAddress {
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
}

interface InvoiceDeliveryAddressSectionProps {
  entrega: NfePrepareEntrega | null
  clientId?: string
  selectedAddressId?: string | null
  pais?: string
  addresses?: ClientAddressItem[]
  sectionTitle?: string
  destinatarioAddress?: DestinatarioAddress
  onEntregaToggle: (enabled: boolean) => void
  onAddressSelect: (address: ClientAddressItem | null) => void
  onEntregaChange: (updatedEntrega: NfePrepareEntrega) => void
}

const BRAZIL_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

export function InvoiceDeliveryAddressSection({
  entrega,
  clientId,
  selectedAddressId,
  pais,
  addresses,
  sectionTitle = 'Local de Entrega',
  destinatarioAddress,
  onEntregaToggle,
  onAddressSelect,
  onEntregaChange,
}: InvoiceDeliveryAddressSectionProps) {
  const isEnabled = entrega !== null
  const { data: addressesFromHook } = useClientAddresses({
    clientId: addresses ? '' : clientId || '',
  })
  const addressesList = addresses || addressesFromHook || []
  const [isEditing, setIsEditing] = useState(false)

  const isBrazil =
    !pais || pais === 'Brasil' || pais === 'BRASIL' || pais === '1058'

  // Local state for manual edits when enabled
  const [localCep, setLocalCep] = useState(entrega?.cep || '')
  const [localEndereco, setLocalEndereco] = useState(entrega?.endereco || '')
  const [localNumero, setLocalNumero] = useState(entrega?.numero || '')
  const [localComplemento, setLocalComplemento] = useState(
    entrega?.complemento || '',
  )
  const [localBairro, setLocalBairro] = useState(entrega?.bairro || '')
  const [localCidade, setLocalCidade] = useState(entrega?.cidade || '')
  const [localEstado, setLocalEstado] = useState(entrega?.estado || '')

  useEffect(() => {
    if (entrega) {
      setLocalCep(entrega.cep || '')
      setLocalEndereco(entrega.endereco || '')
      setLocalNumero(entrega.numero || '')
      setLocalComplemento(entrega.complemento || '')
      setLocalBairro(entrega.bairro || '')
      setLocalCidade(entrega.cidade || '')
      setLocalEstado(entrega.estado || '')
    }
  }, [entrega])

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        const updatedEndereco = data.logradouro || ''
        const updatedBairro = data.bairro || ''
        const updatedCidade = data.localidade || ''
        const updatedEstado = data.uf || ''

        setLocalEndereco(updatedEndereco)
        setLocalBairro(updatedBairro)
        setLocalCidade(updatedCidade)
        setLocalEstado(updatedEstado)

        if (entrega) {
          onEntregaChange({
            ...entrega,
            endereco: updatedEndereco,
            bairro: updatedBairro,
            cidade: updatedCidade,
            estado: updatedEstado,
          })
        }
      }
    } catch {
      // Ignore CEP lookup errors
    }
  }

  const handleFieldChange = (field: keyof NfePrepareEntrega, value: string) => {
    if (!entrega) return
    const updated = {
      ...entrega,
      [field]: value,
    }
    onEntregaChange(updated)
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <Accordion type="single" collapsible defaultValue="delivery">
        <AccordionItem value="delivery" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconMapPin} />
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <CardTitle>{sectionTitle}</CardTitle>
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-gray-700 select-none">
                  <Checkbox
                    id="delivery-different-address"
                    checked={isEnabled}
                    onCheckedChange={(checked) => onEntregaToggle(!!checked)}
                  />
                  <span>Entrega em endereço diferente do destinatário</span>
                </label>
              </div>
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
              {!isEnabled ? (
                <div className="p-6 bg-gray-50/50">
                  {destinatarioAddress?.endereco ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <p className="type-label">Rua</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {destinatarioAddress.endereco}
                          {destinatarioAddress.numero
                            ? `, ${destinatarioAddress.numero}`
                            : ''}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="type-label">Complemento</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {destinatarioAddress.complemento || '—'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="type-label">Bairro</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {destinatarioAddress.bairro || '—'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="type-label">CEP</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {destinatarioAddress.cep || '—'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="type-label">Cidade</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {destinatarioAddress.cidade || '—'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="type-label">Estado</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {destinatarioAddress.estado || '—'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-gray-400">
                      Endereço do destinatário não informado.
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* O seletor só faz sentido com endereços cadastrados, mas o
                      botão de editar precisa existir sempre — senão clientes sem
                      endereço ficam com o local de prestação somente leitura. */}
                  <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50/50">
                    {addressesList.length > 0 && (
                      <>
                        <span className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-1.5">
                          📍 Escolher Endereço Cadastrado:
                        </span>
                        <Select
                          value={selectedAddressId || 'custom'}
                          onValueChange={(selectedId) => {
                            if (selectedId === 'custom') {
                              onAddressSelect(null)
                              return
                            }
                            const addr = addressesList.find(
                              (a) => a.id === selectedId,
                            )
                            if (addr) {
                              onAddressSelect(addr)
                              setIsEditing(false)
                            }
                          }}
                        >
                          <SelectTrigger
                            id="select-delivery-address"
                            className="w-full max-w-xl bg-white h-10"
                          >
                            <SelectValue placeholder="-- Digitar endereço personalizado --" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="custom">
                              -- Digitar endereço personalizado --
                            </SelectItem>
                            {addressesList.map((addr) => (
                              <SelectItem key={addr.id} value={addr.id}>
                                {addr.type || 'Sem Título'} — {addr.street},{' '}
                                {addr.number} - {addr.city}/{addr.state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    )}
                    <Button
                      type="button"
                      variant={isEditing ? 'neutralLight' : 'neutralOutline'}
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                      className="sm:ml-auto"
                    >
                      <IconEdit size={16} className="mr-2" />
                      {isEditing ? 'Ver Dados' : 'Editar Endereço'}
                    </Button>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                      <div className="space-y-2">
                        <Label htmlFor="delivery-cep">CEP</Label>
                        <Input
                          id="delivery-cep"
                          type="text"
                          value={localCep}
                          onChange={(e) => {
                            setLocalCep(e.target.value)
                            handleFieldChange('cep', e.target.value)
                          }}
                          onBlur={(e) => {
                            if (isBrazil) {
                              handleCepBlur(e.target.value)
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="delivery-endereco">
                          Endereço / Logradouro
                        </Label>
                        <Input
                          id="delivery-endereco"
                          type="text"
                          value={localEndereco}
                          onChange={(e) => {
                            setLocalEndereco(e.target.value)
                            handleFieldChange('endereco', e.target.value)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery-numero">Número</Label>
                        <Input
                          id="delivery-numero"
                          type="text"
                          value={localNumero}
                          onChange={(e) => {
                            setLocalNumero(e.target.value)
                            handleFieldChange('numero', e.target.value)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery-complemento">
                          Complemento
                        </Label>
                        <Input
                          id="delivery-complemento"
                          type="text"
                          value={localComplemento}
                          onChange={(e) => {
                            setLocalComplemento(e.target.value)
                            handleFieldChange('complemento', e.target.value)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery-bairro">Bairro</Label>
                        <Input
                          id="delivery-bairro"
                          type="text"
                          value={localBairro}
                          onChange={(e) => {
                            setLocalBairro(e.target.value)
                            handleFieldChange('bairro', e.target.value)
                          }}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="delivery-cidade">Cidade</Label>
                        <Input
                          id="delivery-cidade"
                          type="text"
                          value={localCidade}
                          onChange={(e) => {
                            setLocalCidade(e.target.value)
                            handleFieldChange('cidade', e.target.value)
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="delivery-estado">Estado (UF)</Label>
                        {isBrazil ? (
                          <Select
                            value={localEstado}
                            onValueChange={(value) => {
                              setLocalEstado(value)
                              handleFieldChange('estado', value)
                            }}
                          >
                            <SelectTrigger
                              id="delivery-estado"
                              className="bg-white h-10"
                            >
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {BRAZIL_STATES.map((uf) => (
                                <SelectItem key={uf} value={uf}>
                                  {uf}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="delivery-estado"
                            type="text"
                            value={localEstado}
                            onChange={(e) => {
                              setLocalEstado(e.target.value)
                              handleFieldChange('estado', e.target.value)
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b border-gray-100">
                        <div className="space-y-1">
                          <p className="type-label">Rua</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.endereco
                              ? `${entrega.endereco}, ${entrega.numero}`
                              : 'N/D'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="type-label">Complemento</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.complemento || 'N/D'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="type-label">Bairro</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.bairro || 'N/D'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                        <div className="space-y-1">
                          <p className="type-label">CEP</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.cep || 'N/D'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="type-label">Cidade</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.cidade || 'N/D'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="type-label">Estado</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.estado || 'N/D'}
                          </p>
                        </div>
                        {entrega.cnpjCpf && (
                          <div className="space-y-1">
                            <p className="type-label">CPF/CNPJ do local</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {entrega.cnpjCpf}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
