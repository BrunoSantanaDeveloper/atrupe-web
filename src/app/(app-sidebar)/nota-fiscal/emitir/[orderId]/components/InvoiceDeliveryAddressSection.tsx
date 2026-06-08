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

interface InvoiceDeliveryAddressSectionProps {
  entrega: NfePrepareEntrega | null
  clientId?: string
  selectedAddressId?: string | null
  onEntregaToggle: (enabled: boolean) => void
  onAddressSelect: (address: ClientAddressItem | null) => void
  onEntregaChange: (updatedEntrega: NfePrepareEntrega) => void
}

export function InvoiceDeliveryAddressSection({
  entrega,
  clientId,
  selectedAddressId,
  onEntregaToggle,
  onAddressSelect,
  onEntregaChange,
}: InvoiceDeliveryAddressSectionProps) {
  const isEnabled = entrega !== null
  const { data: addresses } = useClientAddresses({ clientId: clientId || '' })
  const [isEditing, setIsEditing] = useState(false)

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
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Local de Entrega
                </CardTitle>
                <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => onEntregaToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
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
                <div className="p-6 text-center text-sm text-gray-500 bg-gray-50/50">
                  Entrega será realizada no mesmo endereço cadastrado do
                  destinatário.
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Select address from registered */}
                  {clientId && addresses && addresses.length > 0 && (
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50/50">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-1.5">
                        📍 Escolher Endereço Cadastrado:
                      </span>
                      <select
                        value={selectedAddressId || ''}
                        className="flex h-9 w-full max-w-xl rounded-md border border-input bg-white px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={(e) => {
                          const selectedId = e.target.value
                          if (!selectedId) {
                            onAddressSelect(null)
                            return
                          }
                          const addr = addresses.find(
                            (a) => a.id === selectedId,
                          )
                          if (addr) {
                            onAddressSelect(addr)
                            setIsEditing(false)
                          }
                        }}
                      >
                        <option value="">
                          -- Digitar endereço personalizado --
                        </option>
                        {addresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.type || 'Sem Título'} — {addr.street},{' '}
                            {addr.number} - {addr.city}/{addr.state}
                          </option>
                        ))}
                      </select>
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
                  )}

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium uppercase">
                          CEP
                        </label>
                        <input
                          type="text"
                          value={localCep}
                          onChange={(e) => {
                            setLocalCep(e.target.value)
                            handleFieldChange('cep', e.target.value)
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-gray-500 font-medium uppercase">
                          Endereço / Logradouro
                        </label>
                        <input
                          type="text"
                          value={localEndereco}
                          onChange={(e) => {
                            setLocalEndereco(e.target.value)
                            handleFieldChange('endereco', e.target.value)
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium uppercase">
                          Número
                        </label>
                        <input
                          type="text"
                          value={localNumero}
                          onChange={(e) => {
                            setLocalNumero(e.target.value)
                            handleFieldChange('numero', e.target.value)
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium uppercase">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={localComplemento}
                          onChange={(e) => {
                            setLocalComplemento(e.target.value)
                            handleFieldChange('complemento', e.target.value)
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium uppercase">
                          Bairro
                        </label>
                        <input
                          type="text"
                          value={localBairro}
                          onChange={(e) => {
                            setLocalBairro(e.target.value)
                            handleFieldChange('bairro', e.target.value)
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-gray-500 font-medium uppercase">
                          Cidade
                        </label>
                        <input
                          type="text"
                          value={localCidade}
                          onChange={(e) => {
                            setLocalCidade(e.target.value)
                            handleFieldChange('cidade', e.target.value)
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-gray-500 font-medium uppercase">
                          Estado (UF)
                        </label>
                        <input
                          type="text"
                          value={localEstado}
                          onChange={(e) => {
                            setLocalEstado(e.target.value)
                            handleFieldChange('estado', e.target.value)
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b border-gray-100">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Rua
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.endereco
                              ? `${entrega.endereco}, ${entrega.numero}`
                              : 'N/D'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Complemento
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.complemento || 'N/D'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Bairro
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.bairro || 'N/D'}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            CEP
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.cep || 'N/D'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Cidade
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.cidade || 'N/D'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Estado
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {entrega.estado || 'N/D'}
                          </p>
                        </div>
                        {entrega.cnpjCpf && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                              CPF/CNPJ do local
                            </p>
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
