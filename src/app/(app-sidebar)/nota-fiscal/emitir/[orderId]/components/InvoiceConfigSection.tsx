// UI
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Icons
import { IconSettings } from '@tabler/icons-react'

// Types
import type { NfePrepareResponse } from '@/types/fiscal/nfe-prepare'

interface InvoiceConfigSectionProps {
  data: NfePrepareResponse
}

function getDestinoLabel(destino: number) {
  if (destino === 1) return '1 - Operação interna'
  return '2 - Operação interestadual'
}

export function InvoiceConfigSection({ data }: InvoiceConfigSectionProps) {
  const rows = [
    [
      { label: 'Emissor', value: data.emissao.emissor },
      { label: 'CNPJ', value: data.emissao.emissorCnpj },
      { label: 'Natureza da operação', value: data.emissao.operationNature },
      { label: 'Tipo', value: `${data.emissao.tipo} - Saída` },
    ],
    [
      {
        label: 'Finalidade',
        value: `${data.emissao.finalidade} - NF-e normal`,
      },
      {
        label: 'Destino operação',
        value: getDestinoLabel(data.emissao.destinoOperacao),
      },
      { label: 'Próximo documento', value: data.emissao.proximoDocumento },
      {
        label: 'Data de saída',
        value: new Date(data.emissao.dataSaida).toLocaleString('pt-BR'),
      },
    ],
    [
      {
        label: 'Consumidor final',
        value: data.emissao.consumidorFinal === 1 ? '1 - Sim' : '0 - Não',
      },
      {
        label: 'Presença do consumidor',
        value: `${data.emissao.presencaConsumidor} - Operação presencial`,
      },
      {
        label: 'Modalidade de frete',
        value:
          data.emissao.modalidadeFrete !== undefined
            ? data.emissao.modalidadeFrete
            : '9 - Sem ocorrência de transporte',
      },
      {
        label: 'NF-e referenciada',
        value: data.emissao.nfeReferenciada || 'Sem referência',
      },
    ],
  ]

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <Accordion type="single" collapsible defaultValue="config">
        <AccordionItem value="config" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconSettings} />
              <CardTitle className="text-gray-700 font-semibold text-base">
                Configuração de emissão
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
