import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconUserCog, IconAlertTriangle, IconPencil } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Types

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
  onEditClick?: () => void
}

export function NfseTomadorSection({
  client,
  servicesTotal,
  onEditClick,
}: NfseTomadorSectionProps) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <Accordion type="single" collapsible defaultValue="tomador">
        <AccordionItem value="tomador" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon tone="neutral" Icon={IconUserCog} />
              <CardTitle>Tomador do Serviço</CardTitle>
            </div>
            <div className="flex gap-2">
              {onEditClick && (
                <Button
                  variant="neutralLight"
                  size="icon"
                  RightIcon={IconPencil}
                  onClick={onEditClick}
                  aria-label="Editar tomador"
                  title="Editar dados do tomador"
                />
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
            <CardContent className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="type-label">Razão social</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {client?.corporateName || client?.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="type-label">CNPJ/CPF</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {client?.cnpj || client?.cpf || 'N/D'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="type-label">E-mail</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {client?.email || 'N/D'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="type-label">Valor total</p>
                  <p className="text-sm font-semibold text-brand-600">
                    {servicesTotal}
                  </p>
                </div>
              </div>

              {client?.address?.[0] && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                  <div>
                    <p className="type-eyebrow mb-3">Endereço</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1 lg:col-span-2">
                      <p className="type-label">Logradouro</p>
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
                      <p className="type-label">Bairro</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {client.address[0].neighborhood || 'N/D'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="type-label">Cidade/UF</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {client.address[0].city || 'N/D'}
                        {client.address[0].state
                          ? `/${client.address[0].state}`
                          : ''}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="type-label">CEP</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {client.address[0].zipcode || 'N/D'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="type-label">Telefone</p>
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
                    <IconAlertTriangle aria-hidden size={ICON_SIZE.sm} />
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
