import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconCalculator } from '@tabler/icons-react'

interface NfseTotaisSectionProps {
  servicesTotal: number
  aliquotaIss: number
  issRetido: boolean
  formatCurrency: (value: number) => string
}

export function NfseTotaisSection({
  servicesTotal,
  aliquotaIss,
  issRetido,
  formatCurrency,
}: NfseTotaisSectionProps) {
  return (
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Valor Total Serviços
                  </p>
                  <p className="text-xl font-bold text-brand-600">
                    {formatCurrency(servicesTotal)}
                  </p>
                </div>
                {issRetido && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      ISS Retido ({aliquotaIss}%)
                    </p>
                    <p className="text-xl font-bold text-error-600">
                      -
                      {formatCurrency(
                        servicesTotal * ((aliquotaIss || 0) / 100),
                      )}
                    </p>
                  </div>
                )}
                {issRetido && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Líquido a Pagar
                    </p>
                    <p className="text-xl font-bold text-success-600">
                      {formatCurrency(
                        servicesTotal * (1 - (aliquotaIss || 0) / 100),
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
