import { Papers } from './components/Papers'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Papéis' }
}

// Papéis (GR-0): o cadastro do LITE, com `paper_register`; no PRO a base de
// custos abre o mesmo registro em Materiais
export default function PapersPage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['product_settings:products:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os papéis.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.PRODUCTS.PAPER_REGISTER, FEATURES.COSTS.COST_BASE]}
        wall={{
          title: 'Papéis',
          description:
            'Os papéis da gráfica, com gramatura, folha e área útil para o aproveitamento.',
          pageTitle: true,
        }}
      >
        <Papers searchParams={searchParams} />
      </FeatureGate>
    </PermissionGate>
  )
}
