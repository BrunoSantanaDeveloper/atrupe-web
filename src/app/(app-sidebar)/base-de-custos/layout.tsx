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
import { usePermissions } from '@/hooks/usePermissions'
import { FEATURES } from '@/consts/features'
import { costBaseTabs } from '@/consts/cost-base'

interface Props {
  children: React.ReactNode
}

export default function CostBaseLayout({ children }: Props) {
  const segment = useSelectedLayoutSegment()
  const { hasAllPermissions } = usePermissions()

  // Cada aba só aparece se o usuário tiver a permissão do seu conteúdo,
  // somada à de valores, porque todas mostram dinheiro (design.md §9).
  const tabs = costBaseTabs.filter((tab) =>
    hasAllPermissions([tab.permission, 'values:values:view']),
  )

  return (
    <PermissionGate
      requireAll
      permissions={['cost:base:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a base de custos.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.COSTS.COST_BASE]}
        wall={{
          title: 'Base de custos',
          description:
            'Forma o custo mensal de referência da empresa e alimenta a precificação.',
          pageTitle: true,
        }}
      >
        <div className="space-y-5">
          <Topbar
            review="new"
            title="Base de custos"
            supportText="Custo mensal de referência da empresa"
          />
          <Tabs
            value={segment || 'resumo'}
            variant="pill"
            className="overflow-x-auto"
          >
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger key={tab.tab} value={tab.tab} asChild>
                  <Link href={`/base-de-custos/${tab.tab}`}>{tab.label}</Link>
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
