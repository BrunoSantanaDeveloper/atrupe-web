import { useState, useEffect } from 'react'

// UI
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

// Icons
import { IconPencil, IconUserCog, IconUserSearch } from '@tabler/icons-react'

// Hooks
import { useClientAddresses } from '@/hooks/queries/useClientAddresses'

// Types
import type { NfePrepareDestinatario } from '@/types/fiscal/nfe-prepare'

interface ClientAddressItem {
  id: string
  label?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipcode?: string
}

interface InvoiceRecipientSectionProps {
  destinatario: NfePrepareDestinatario
  onEditClick: () => void
  /** Callback para abrir o seletor de outro cliente */
  onChangeClientClick?: () => void
  clientId?: string
  onAddressChange?: (address: ClientAddressItem) => void
}

export function InvoiceRecipientSection({
  destinatario,
  onEditClick,
  onChangeClientClick,
  clientId,
  onAddressChange,
}: InvoiceRecipientSectionProps) {
  const isForeign = destinatario.pais && destinatario.pais !== 'Brasil'

  const { data: addresses } = useClientAddresses({ clientId: clientId || '' })
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (addresses && destinatario) {
      const matchingAddr = addresses.find(
        (a) =>
          a.zipcode === destinatario.cep &&
          a.street === destinatario.endereco &&
          a.number === destinatario.numero,
      )
      if (matchingAddr) {
        setSelectedAddressId(matchingAddr.id)
      } else {
        setSelectedAddressId(null)
      }
    }
  }, [addresses, destinatario])

  const rows = [
    [
      { label: 'Razão Social', value: destinatario.razaoSocial },
      isForeign
        ? {
            label: 'ID Estrangeiro',
            value: destinatario.idEstrangeiro || 'N/D',
          }
        : { label: 'CNPJ/CPF', value: destinatario.cnpjCpf },
      isForeign
        ? { label: 'País', value: destinatario.pais }
        : { label: 'I.E.', value: destinatario.ie || 'N/D' },
    ],
    [
      {
        label: 'Rua',
        value: `${destinatario.endereco}, ${destinatario.numero}`,
      },
      ...(!isForeign
        ? [
            { label: 'Bairro', value: destinatario.bairro },
            { label: 'CEP', value: destinatario.cep },
          ]
        : []),
    ],
    [
      { label: 'Cidade', value: destinatario.cidade },
      { label: 'Estado', value: destinatario.estado },
      { label: 'Telefone', value: destinatario.telefone || 'N/D' },
      { label: 'E-mail', value: destinatario.email || 'N/D' },
    ],
  ]

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <Accordion type="single" collapsible defaultValue="recipient">
        <AccordionItem value="recipient" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconUserCog} />
              <CardTitle className="text-gray-700 font-semibold text-base">
                Destinatário / Tomador
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {/* Botão trocar cliente */}
              {onChangeClientClick && (
                <Button
                  variant="neutralLight"
                  size="icon"
                  RightIcon={IconUserSearch}
                  onClick={onChangeClientClick}
                  aria-label="Trocar cliente"
                  title="Trocar cliente"
                />
              )}
              {/* Botão editar dados */}
              <Button
                variant="neutralLight"
                size="icon"
                RightIcon={IconPencil}
                onClick={onEditClick}
                aria-label="Editar destinatário"
                title="Editar dados do destinatário"
              />
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
              {clientId && addresses && addresses.length > 0 && (
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 bg-gray-50/50">
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-1.5">
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

                      const addr = addresses.find((a) => a.id === selectedId)
                      if (addr && onAddressChange) {
                        onAddressChange(addr)
                      }
                    }}
                  >
                    <option value="">
                      -- Usar endereço personalizado / Digitado --
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
              <div className="flex flex-col">
                {rows.map((row, rowIdx) => (
                  <div
                    key={rowIdx}
                    className={cn(
                      'grid grid-cols-2 lg:grid-cols-4 gap-6 p-6',
                      rowIdx < rows.length - 1 && 'border-b border-gray-100',
                    )}
                  >
                    {row.map((field, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          {field.label}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {field.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
