'use client'

// A Simulação do processo e do produto, no mesmo desenho (PAD-6, decidido em
// 05/10/2026): a medida simulada em cima e o resultado embaixo. Não grava
// nada: a medida padrão do produto só muda pelo "Salvar como padrão" do
// rodapé. O que entra antes da medida (a base simulada do processo, §9.1)
// vem por `children`; os valores mostrados vêm por `results`, porque o
// produto compara custo, preço e margem e o processo só custo e venda.

import type { ReactNode } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { AssemblyMeasure } from '../assembly'

// Utils
import { cn } from '@/lib/utils'

export type MeasureField = 'quantity' | 'width' | 'height'

export type SimulationResult = {
  label: string
  value: string
  help?: string
  tone?: 'default' | 'success' | 'error'
}

interface Props {
  description?: string
  measure: AssemblyMeasure
  onMeasureChange: (measure: AssemblyMeasure) => void
  // Rótulo do bloco da medida, quando há mais de uma (a base simulada)
  measureLabel?: string
  // Quais campos da medida própria aparecem. Depois de uma base, o processo
  // que herda a medida e a quantidade dela não pede nada (08/10/2026)
  fields?: MeasureField[]
  // O que fica no lugar dos campos quando nenhum aparece
  measureNote?: ReactNode
  results: SimulationResult[]
  // Sem etapa com custo não há o que comparar: a frase que fica no lugar
  emptyText?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
  // Prefixo dos ids dos campos, para o produto e o processo coexistirem
  idPrefix?: string
}

const toneClass = {
  default: 'text-gray-900',
  success: 'text-success-700',
  error: 'text-error-700',
}

export function SimulationCard({
  description = 'Confira o consumo numa medida. Não grava nada.',
  measure,
  onMeasureChange,
  measureLabel,
  fields: visibleFields,
  measureNote,
  results,
  emptyText,
  children,
  footer,
  className,
  idPrefix = 'sim',
}: Props) {
  const fields = (
    [
      ['quantity', 'Quantidade', '1'],
      ['width', 'Largura (m)', '0.01'],
      ['height', 'Altura (m)', '0.01'],
    ] as const
  ).filter(([key]) => !visibleFields || visibleFields.includes(key))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Simulação</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {children}
        <div className="space-y-2">
          {measureLabel && fields.length > 0 && (
            <p className="text-sm font-medium text-gray-800">{measureLabel}</p>
          )}
          {fields.length === 0 && measureNote ? (
            <p className="text-sm text-gray">{measureNote}</p>
          ) : null}
          <div className="grid grid-cols-3 gap-3">
            {fields.map(([key, label, step]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`${idPrefix}-${key}`}>{label}</Label>
                <Input
                  id={`${idPrefix}-${key}`}
                  type="number"
                  min={0}
                  step={step}
                  value={measure[key]}
                  onChange={(event) =>
                    onMeasureChange({
                      ...measure,
                      [key]: Number(event.target.value) || 0,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
        <PermissionGate permissions={['values:values:view']}>
          {results.length ? (
            <div
              className={cn(
                'grid grid-cols-2 gap-3 rounded-lg bg-gray-50 p-3',
                results.length > 2 && 'md:grid-cols-4',
              )}
            >
              {results.map((result) => (
                <div key={result.label}>
                  <p className="type-kpi-label">{result.label}</p>
                  <p
                    className={cn(
                      'type-kpi-value',
                      toneClass[result.tone || 'default'],
                    )}
                  >
                    {result.value}
                  </p>
                  {result.help && (
                    <p className="text-xs text-gray">{result.help}</p>
                  )}
                </div>
              ))}
            </div>
          ) : emptyText ? (
            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray">
              {emptyText}
            </p>
          ) : null}
        </PermissionGate>
      </CardContent>
      {footer && (
        <CardFooter className="flex-wrap justify-between gap-3">
          {footer}
        </CardFooter>
      )}
    </Card>
  )
}
