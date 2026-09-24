import { QuickSaleSettingsForm } from './components/QuickSaleSettingsForm'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Venda rápida' }
}

export default function QuickSalePage() {
  return (
    <PermissionGate
      permissions={['sales_settings:series:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para configurar a venda rápida.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.SALES.QUOTATION_QUICK_SALE]}
        fallback={
          <UpgradeFallback
            title="Venda rápida"
            description="A venda de balcão, sem cadastro e sem perguntas, faz parte do plano LITE."
          />
        }
      >
        <QuickSaleSettingsForm />
      </FeatureGate>
    </PermissionGate>
  )
}
