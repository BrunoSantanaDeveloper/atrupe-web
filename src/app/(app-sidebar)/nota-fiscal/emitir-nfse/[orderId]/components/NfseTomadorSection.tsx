import { useState, useEffect } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconUserCog, IconAlertTriangle } from '@tabler/icons-react'

// Hooks
import { useClientAddresses } from '@/hooks/queries/useClientAddresses'

interface AddressItem {
  id?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipcode?: string
}

interface ClientData {
  id?: string
  name: string
  corporateName?: string
  cnpj?: string
  cpf?: string
  email?: string
  phone?: string
  mobile?: string
  address?: AddressItem[]
}

interface NfseTomadorSectionProps {
  client?: ClientData
  servicesTotal: string
  clientId?: string
  onAddressChange?: (address: AddressItem) => void
}

export function NfseTomadorSection({
  client,
  servicesTotal,
  clientId,
  onAddressChange,
}: NfseTomadorSectionProps) {
  const { data: addresses } = useClientAddresses({ clientId: clientId || '' })
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  )

  useEffect(() => {
    const firstAddr = client?.address?.[0]
    if (addresses && firstAddr) {
      const matchingAddr = addresses.find(
        (a) =>
          a.zipcode === firstAddr.zipcode &&
          a.street === firstAddr.street &&
          a.number === firstAddr.number,
      )
      if (matchingAddr) {
        setSelectedAddressId(matchingAddr.id)
      } else {
        setSelectedAddressId(null)
      }
    }
  }, [addresses, client])

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <Accordion type="single" collapsible defaultValue="tomador">
        <AccordionItem value="tomador" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconUserCog} />
              <CardTitle className="text-gray-700 font-semibold text-base">
                Tomador do Serviço
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
            <CardContent className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Razão Social
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {client?.corporateName || client?.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    CNPJ/CPF
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {client?.cnpj || client?.cpf || 'N/D'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    E-mail
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {client?.email || 'N/D'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Valor Total
                  </p>
                  <p className="text-sm font-semibold text-brand-600">
                    {servicesTotal}
                  </p>
                </div>
              </div>

              {client?.address?.[0] && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  {clientId && addresses && addresses.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        📍 Endereço Selecionado:
                      </span>
                      <select
                        value={selectedAddressId || ''}
                        className="flex h-9 w-full max-w-xl rounded-md border border-input bg-white px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        onChange={(e) => {
                          const selectedId = e.target.value
                          if (!selectedId) {
                            setSelectedAddressId(null)
                            return
                          }

                          const addr = addresses.find(
                            (a) => a.id === selectedId,
                          )
                          if (addr && onAddressChange) {
                            onAddressChange(addr)
                          }
                        }}
                      >
                        <option value="">
                          -- Usar endereço principal / personalizado --
                        </option>
                        {addresses.map((addr) => (
                          <option key={addr.id} value={addr.id}>
                            {addr.type || 'Principal'} — {addr.street},{' '}
                            {addr.number} - {addr.city}/{addr.state}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">
                      Endereço
                    </p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1 lg:col-span-2">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Logradouro
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {client.address[0].street || 'N/D'}
                        {client.address[0].number
                          ? `, ${client.address[0].number}`
                          : ''}
                        {client.address[0].complement
                          ? ` - ${client.address[0].complement}`
                          : ''}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Bairro
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {client.address[0].neighborhood || 'N/D'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Cidade/UF
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {client.address[0].city || 'N/D'}
                        {client.address[0].state
                          ? `/${client.address[0].state}`
                          : ''}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        CEP
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {client.address[0].zipcode || 'N/D'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Telefone
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {client?.phone || client?.mobile || 'N/D'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!client?.address?.[0] && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-warning-600">
                    <IconAlertTriangle size={16} />
                    <p className="text-sm">
                      Tomador sem endereço cadastrado. O endereço pode ser
                      exigido pela prefeitura.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
