import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { UpgradeFallback } from '@/components/common/UpgradeFallback'
import { EntityFinancialSummary } from '@/components/common/entity-financial/EntityFinancialSummary'
import { FEATURES } from '@/consts/features'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function ClientFinancialPage({ params }: Props) {
  return (
    <FeatureGate
      features={[FEATURES.CONTACTS.CLIENT_ADDITIONAL_TABS]}
      fallback={
        <UpgradeFallback
          title="Abas adicionais de cliente"
          description="A aba financeiro no cadastro do cliente faz parte do plano Lite. Faça upgrade para acessá-la."
        />
      }
    >
      <PermissionGate
        requireAll
        permissions={['financial:flow:view', 'values:values:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar o financeiro do cliente.
          </div>
        }
      >
        <EntityFinancialSummary entityId={params.id} entityType="client" />
      </PermissionGate>
    </FeatureGate>
  )
}
