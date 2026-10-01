'use client'

import { Topbar, type TabNavType } from '@/components/common/Topbar'

import { AvailabilityTab } from './components/AvailabilityTab'
import { FeatureMatrix } from './components/FeatureMatrix'
import { HistoryTab } from './components/HistoryTab'
import { LimitsMatrix } from './components/LimitsMatrix'
import { PricingTexts } from './components/PricingTexts'

const TABS: TabNavType[] = [
  {
    value: 'disponibilidade',
    tab: 'disponibilidade',
    label: 'Disponibilidade',
  },
  { value: 'recursos', tab: 'recursos', label: 'Recursos por plano' },
  { value: 'limites', tab: 'limites', label: 'Limites' },
  { value: 'precos', tab: 'precos', label: 'Preços e textos' },
  { value: 'historico', tab: 'historico', label: 'Histórico' },
]

/**
 * Super Admin › Sistema › Planos: disponibilidade para contratação, o que
 * cada plano inclui (matriz recurso × plano), os limites e o histórico.
 */
export default function AdminPlansPage({
  searchParams,
}: {
  searchParams?: { aba?: string }
}) {
  const tab = TABS.some((t) => t.tab === searchParams?.aba)
    ? (searchParams?.aba as string)
    : 'disponibilidade'

  return (
    <div className="space-y-5">
      <Topbar
        title="Planos"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
        tabs={TABS}
        activeTab={tab}
        paramName="aba"
      />

      {tab === 'recursos' ? (
        <FeatureMatrix />
      ) : tab === 'limites' ? (
        <LimitsMatrix />
      ) : tab === 'precos' ? (
        <PricingTexts />
      ) : tab === 'historico' ? (
        <HistoryTab />
      ) : (
        <AvailabilityTab />
      )}
    </div>
  )
}
