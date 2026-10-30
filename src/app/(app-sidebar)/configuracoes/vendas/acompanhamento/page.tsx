import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { FEATURES } from '@/consts/features'
import { FollowUpSettingsForm } from './components/FollowUpSettingsForm'

export function metadata() {
  return { title: 'Acompanhamento comercial' }
}

// Modelos de mensagem (CRM-5), e-mail diário ao vendedor (CRM-3) e os dias
// para o cliente contar como sem compra (CRM-4)
export default function FollowUpSettingsPage() {
  return (
    <PermissionGate
      permissions={['sales_settings:series:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar esta configuração.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.SALES.SALES_FOLLOW_UP]}
        wall={{
          title: 'Acompanhamento comercial',
          description:
            'Registrar contatos, marcar o próximo contato e lembrar quem retomar fazem parte do acompanhamento comercial.',
        }}
      >
        <FollowUpSettingsForm />
      </FeatureGate>
    </PermissionGate>
  )
}
