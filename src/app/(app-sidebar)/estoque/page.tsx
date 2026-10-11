import { Stock } from './components/Stock'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Estoque' }
}

export default function StockPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['stock:stock:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar o estoque.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.STOCK.STOCK_CONTROL]}
        wall={{
          title: 'Estoque',
          description:
            'A entrada vem da nota conciliada e a baixa, do consumo real da produção.',
          pageTitle: true,
        }}
      >
        <Stock searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
