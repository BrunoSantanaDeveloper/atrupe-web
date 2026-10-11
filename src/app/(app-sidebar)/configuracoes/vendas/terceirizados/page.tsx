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
      {/* O terceirizado avulso entra pelo "Acrescentar a este item", do LITE
          em diante (T-2 continua em aberto para o START) */}
      <FeatureGate
        features={[FEATURES.PRODUCTS.PRODUCT_COMPOSITION]}
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
