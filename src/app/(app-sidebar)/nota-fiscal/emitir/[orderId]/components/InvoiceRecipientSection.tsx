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
import { IconPencil, IconUserCog } from '@tabler/icons-react'

// Types
import type { NfePrepareDestinatario } from '@/types/fiscal/nfe-prepare'

interface InvoiceRecipientSectionProps {
  destinatario: NfePrepareDestinatario
  onEditClick: () => void
}

export function InvoiceRecipientSection({
  destinatario,
  onEditClick,
}: InvoiceRecipientSectionProps) {
  const rows = [
    [
      { label: 'Razão Social', value: destinatario.razaoSocial },
      { label: 'CNPJ/CPF', value: destinatario.cnpjCpf },
      { label: 'I.E.', value: destinatario.ie || 'N/D' },
    ],
    [
      {
        label: 'Rua',
        value: `${destinatario.endereco}, ${destinatario.numero}`,
      },
      { label: 'Bairro', value: destinatario.bairro },
      { label: 'CEP', value: destinatario.cep },
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
            <div className="flex gap-3">
              <Button
                variant="neutralLight"
                size="icon"
                RightIcon={IconPencil}
                onClick={onEditClick}
                aria-label="Editar destinatário"
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
