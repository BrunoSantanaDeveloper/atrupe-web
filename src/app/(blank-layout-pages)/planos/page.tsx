'use client'

import { useState } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PlanCard } from '@/app/(blank-layout-pages)/planos/components/PlanCard'
import { ModuleCard } from '@/app/(blank-layout-pages)/planos/components/ModuleCard'
import type { Plan, AdditionalModule } from '@/types/plans'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { formatCurrencyToBrl } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const basePlans: Plan[] = [
  {
    id: 'basic',
    name: 'Atrupe Básico',
    price: 100.0,
    description: 'O início certo para o seu negócio.',
    features: [
      { title: '1 usuário' },
      { title: 'Orçamentos ilimitados' },
      { title: 'Agenda de entrega' },
    ],
  },
  {
    id: 'advanced',
    name: 'Atrupe Avançado',
    price: 300.0,
    description: 'O início certo para o seu negócio.',
    features: [
      { title: 'Todos os recursos do Atrupe Básico' },
      { title: 'Orçamentos ilimitados' },
      { title: 'Agenda de entrega' },
    ],
  },
]

const additionalModules: AdditionalModule[] = [
  {
    id: 'grafica',
    name: 'Gráfica Rápida',
    price: 50.0,
    description: 'Frente de Caixa e Venda Rápida.',
  },
  {
    id: 'nf',
    name: 'Nota Fiscal',
    price: 50.0,
    description: 'NF-e, NFS-e, NFC-e e MDF-e.',
  },
  {
    id: 'boletos',
    name: 'Boletos',
    price: 50.0,
    description: 'Texto de suporte',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 50.0,
    description: 'Centro de Custos e Composição.',
  },
  {
    id: 'gerenciador-producao',
    name: 'Gerenciador de Produção',
    price: 50.0,
    description: 'Texto de suporte',
  },
  {
    id: 'estoque',
    name: 'Estoque',
    price: 50.0,
    description: 'Texto de suporte',
  },
]

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('basic')
  const [selectedModules, setSelectedModules] = useState<string[]>(['grafica'])

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId],
    )
  }

  const calculateTotal = () => {
    const basePlan = basePlans.find((plan) => plan.id === selectedPlan)
    const modulesTotal = selectedModules.reduce((total, moduleId) => {
      const modulo = additionalModules.find((m) => m.id === moduleId)
      return total + (modulo?.price || 0)
    }, 0)
    return (basePlan?.price || 0) + modulesTotal
  }

  return (
    <div className="bg-gray-100 w-full">
      <div className="flex justify-between items-center gap-4 mb-8 px-6 py-4 bg-brand-50">
        <div className="flex items-center gap-1 w-full">
          <Button asChild variant="ghost" size="icon" RightIcon={IconArrowLeft}>
            <Link href="/" aria-label="Voltar para a página inicial" />
          </Button>
          <h1 className="text-lg font-semibold">Assinatura</h1>
        </div>
        <Logo text />
        <div className="w-full"></div>
      </div>
      <div className="flex-1 max-w-xl lg:max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Plano base</h2>
              <p className="text-gray mb-4">
                Escolha o plano mais compatível com o seu negócio.
              </p>
              <div className="grid gap-4">
                {basePlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    {...plan}
                    isSelected={selectedPlan === plan.id}
                    onSelect={() => setSelectedPlan(plan.id)}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Módulos adicionais</h2>
              <p className="text-gray mb-4">
                Turbine seu plano com os módulos de acordo com a sua
                necessidade.
              </p>
              <div className="grid gap-4">
                {additionalModules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    {...module}
                    isSelected={selectedModules.includes(module.id)}
                    onSelect={() => toggleModule(module.id)}
                  />
                ))}
              </div>
            </section>
          </div>

          {/* Resumo da assinatura */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-700">
                    Resumo da assinatura
                  </CardTitle>
                </CardHeader>

                <Separator className="mb-4" />

                <CardContent className="space-y-4">
                  {/* Plano base */}
                  <div className="flex justify-between px-4">
                    <span className="text-sm text-gray-500">Plano base</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrencyToBrl(
                        basePlans.find((p) => p.id === selectedPlan)?.price,
                      )}
                      /mês
                    </span>
                  </div>

                  <Separator />

                  {/* Módulos selecionados */}
                  {selectedModules.map((moduleId) => {
                    const modulo = additionalModules.find(
                      (m) => m.id === moduleId,
                    )
                    return modulo ? (
                      <>
                        <div
                          key={moduleId}
                          className="flex justify-between px-4"
                        >
                          <span className="text-sm text-gray-500">
                            {modulo.name}
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {formatCurrencyToBrl(modulo.price)}/mês
                          </span>
                        </div>
                        <Separator />
                      </>
                    ) : null
                  })}

                  {/* Total */}
                  <div>
                    <div className="flex justify-between px-4">
                      <span className="text-sm text-gray-700 font-medium">
                        Total
                      </span>
                      <span className="text-xl font-semibold text-gray-700">
                        {formatCurrencyToBrl(calculateTotal())}/mês
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
