'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Plan } from '@/types/subscription'

interface CardPlanoProps {
  plan: Plan
  isSelected: boolean
  onSelect: () => void
}

export function CardPlano({ plan, isSelected, onSelect }: CardPlanoProps) {
  const isAvailable = plan.status === 'available'

  return (
    <Card
      className={`w-full max-w-xl border-gray-200 border bg-white transition-shadow mb-4 ${
        isSelected ? 'shadow-lg ring-1 ring-emerald-300' : ''
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={isAvailable ? onSelect : undefined}
            aria-label={`Selecionar plano ${plan.name}`}
            className="w-6 h-6 rounded-full border-emerald-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-emerald-600 focus:ring-2 focus:ring-emerald-400"
            disabled={!isAvailable}
          />
          <div
            className={`flex items-center gap-2 ${
              isAvailable ? 'text-emerald-900' : 'text-gray-400'
            }`}
          >
            {plan.svg}
            {plan.namesvg}
          </div>
          {plan.badge && (
            <Badge
              variant={
                plan.badgeVariant === 'success'
                  ? 'successLight'
                  : 'warningLight'
              }
              className="ml-2"
            >
              {plan.badge}
            </Badge>
          )}
        </div>
        <span
          className={`text-xl font-bold ${
            isAvailable ? 'text-emerald-900' : 'text-gray-400'
          }`}
        >
          R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}{' '}
          <span className="text-base font-normal text-muted-foreground">
            /mês
          </span>
        </span>
      </div>

      <Accordion type="multiple" className="w-full">
        {/* Concept Section */}
        <AccordionItem value="concept" className="border-b border-emerald-100">
          <AccordionTrigger className="px-6 py-4 hover:bg-emerald-50 font-semibold text-base">
            Conceito
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
            {Array.isArray(plan.concept.description)
              ? plan.concept.description.map((paragraph, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground mb-4">
                    {paragraph}
                  </p>
                ))
              : plan.concept.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.concept.description}
                  </p>
                )}
            {plan.concept.objective && (
              <>
                <h3 className="font-semibold mb-1 mt-2">Objetivo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.concept.objective}
                </p>
              </>
            )}
            {plan.concept.mainActions.length > 0 && (
              <>
                <h3 className="font-semibold mb-1">Principais Ações</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground mb-4">
                  {plan.concept.mainActions.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ul>
              </>
            )}
            {plan.concept.expectedResults && (
              <>
                <h3 className="font-semibold mb-1">Resultados Esperados</h3>
                <p className="text-sm text-muted-foreground">
                  {plan.concept.expectedResults}
                </p>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Features Section */}
        {plan.features && plan.features.length > 0 && (
          <AccordionItem value="features">
            <AccordionTrigger className="px-6 py-4 hover:bg-emerald-50 font-semibold text-base">
              Funcionalidades
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-4">
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </Card>
  )
}
