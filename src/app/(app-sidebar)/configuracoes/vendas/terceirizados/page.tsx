import { OutsourcedSettingsForm } from './components/OutsourcedSettingsForm'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Terceirizado avulso' }
}

export default function OutsourcedSettingsPage() {
  return (
    <PermissionGate
      permissions={['sales_settings:series:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para configurar o terceirizado avulso.
        </div>
      }
    >
      {/* O terceirizado avulso entra pelo "Acrescentar a este item", já no
          START (T-5, 24/10/2026) */}
      <FeatureGate
        features={[FEATURES.SALES.OUTSOURCED_ITEM]}
        wall={{
          title: 'Terceirizado avulso',
          description: 'Lançar um terceirizado dentro do item do orçamento.',
          pageTitle: true,
        }}
      >
        <OutsourcedSettingsForm />
      </FeatureGate>
    </PermissionGate>
  )
}
