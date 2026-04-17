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
import { IconCalculator, IconAlertTriangle } from '@tabler/icons-react'

// Types
import type { NfePrepareResponse } from '@/types/fiscal/nfe-prepare'

interface InvoiceTotalsSectionProps {
  totais: NfePrepareResponse['totais']
  valuesModified?: boolean
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatOrDash(value: number) {
  return value > 0 ? formatCurrency(value) : '-'
}

export function InvoiceTotalsSection({
  totais,
  valuesModified,
}: InvoiceTotalsSectionProps) {
  return (
    <div className="space-y-3">
      {valuesModified && (
        <div className="flex items-start gap-3 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-800 animate-in fade-in slide-in-from-top-2">
          <IconAlertTriangle
            size={18}
            className="mt-0.5 shrink-0 text-warning-500"
          />
          <p className="font-medium">
            Os valores foram ajustados manualmente. A responsabilidade fiscal é
            do usuário.
          </p>
        </div>
      )}
      <Card className="border-none shadow-sm overflow-hidden">
        <Accordion type="single" collapsible defaultValue="totals">
          <AccordionItem value="totals" className="p-0 m-0 border-0">
            <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
              <div className="flex gap-3 items-center">
                <FeaturedIcon variant="neutralOutline" Icon={IconCalculator} />
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Totais
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
                  {/* Row 1: Invoice Components */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 p-6 border-b border-gray-100">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Valor Prod/Serv
                      </p>
                      <p className="text-sm font-semibold text-brand-600">
                        {formatCurrency(totais.valorProdutos)}
                      </p>
                    </div>
                    {[
                      { label: 'Frete', value: totais.valorFrete },
                      { label: 'Seguro', value: totais.valorSeguro },
                      { label: 'Desconto', value: totais.valorDesconto },
                      { label: 'Outras desps.', value: totais.outrasDesepesas },
                    ].map((field, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          {field.label}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatOrDash(field.value)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Row 2: Taxes */}
                  <div className="grid grid-cols-2 lg:grid-cols-7 gap-6 p-6 border-b border-gray-100">
                    {[
                      { label: 'Base ICMS', value: totais.baseCalculoIcms },
                      { label: 'Valor ICMS', value: totais.valorIcms },
                      { label: 'Base ST', value: totais.baseCalculoIcmsSt },
                      { label: 'Valor ST', value: totais.valorIcmsSt },
                      { label: 'Valor IPI', value: totais.valorIpi },
                      { label: 'Valor PIS', value: totais.valorPis },
                      { label: 'Valor COFINS', value: totais.valorCofins },
                    ].map((field, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                          {field.label}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatOrDash(field.value)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Row 3: Grand Total */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50/50">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Total Tributos
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatOrDash(totais.valorTotalTributos)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Valor da Nota
                      </p>
                      <p className="text-lg font-bold text-brand-600">
                        {formatCurrency(totais.valorNota)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  )
}
