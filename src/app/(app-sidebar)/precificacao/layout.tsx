'use client'

// React / Next
import Link from 'next/link'
import { useSelectedLayoutSegment } from 'next/navigation'

// UI
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Components
import { Topbar } from '@/components/common/Topbar'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Hooks / Store / Consts
import { FEATURES } from '@/consts/features'
import { pricingTabs } from '@/consts/pricing'

interface Props {
  children: React.ReactNode
}

export default function PricingLayout({ children }: Props) {
  const segment = useSelectedLayoutSegment()

  return (
    <PermissionGate
      requireAll
      permissions={['cost:pricing:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a precificação.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.PRICING_CENTER]}
        wall={{
          title: 'Precificação',
          description:
            'Reúne o preço de mão de obra, máquinas, materiais e produtos num lugar só.',
          pageTitle: true,
        }}
      >
        <div className="space-y-5">
          <Topbar
            title="Precificação"
            supportText="Custo, preço praticado e margem de cada recurso"
          />
          <Tabs
            value={segment || 'resumo'}
            variant="pill"
            className="overflow-x-auto"
          >
            <TabsList>
              {pricingTabs.map((tab) => (
                <TabsTrigger key={tab.tab} value={tab.tab} asChild>
                  <Link href={`/precificacao/${tab.tab}`}>{tab.label}</Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {children}
        </div>
      </FeatureGate>
    </PermissionGate>
  )
}
