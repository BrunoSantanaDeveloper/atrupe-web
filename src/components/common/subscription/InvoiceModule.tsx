'use client'

import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface InvoiceModuleProps {
  isActive: boolean
  onToggle: (checked: boolean) => void
  price?: number
}

export function InvoiceModule({
  isActive,
  onToggle,
  price = 70.0,
}: InvoiceModuleProps) {
  const invoiceFeatures = [
    'Emissão de Nota Fiscal',
    'Gestão de tributos',
    'Relatórios fiscais',
    'Integração com Receita Federal',
    'Controle de impostos',
    'Compliance fiscal automatizado',
  ]

  return (
    <div className="mt-8">
      <h3 className="font-semibold text-gray-700 mb-1">Nota Fiscal</h3>
      <p className="text-xs text-muted-foreground mb-2">
        Contrate recursos adicionais para impulsionar o seu plano.
      </p>
      <Card className="mb-6">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={isActive}
              onCheckedChange={(checked) => onToggle(checked === true)}
              className="w-6 h-6"
            />
            <span className="text-base font-semibold">Módulo NF</span>
          </div>
          <span className="text-xl font-bold text-emerald-900">
            R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}{' '}
            <span className="text-base font-normal text-muted-foreground">
              /mês
            </span>
          </span>
        </div>

        {/* Features Section */}
        <div className="border-t border-emerald-100">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="features" className="border-b-0">
              <AccordionTrigger className="px-6 py-4 hover:bg-emerald-50 font-semibold text-base">
                Funcionalidades
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {invoiceFeatures.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Card>
    </div>
  )
}
