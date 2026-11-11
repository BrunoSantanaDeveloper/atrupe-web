// Components
import { TodayQuickSales } from './components/TodayQuickSales'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Vendas de hoje',
  }
}

// As vendas rápidas do dia (VR-9, 11/11/2026). Fora do menu: abre pelo botão
// "Vendas de hoje" da venda rápida e da frente de caixa
export default function TodayQuickSalesPage({
  searchParams,
}: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['sale:quotation:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as vendas.
        </div>
      }
    >
      <TodayQuickSales searchParams={searchParams} />
    </PermissionGate>
  )
}
