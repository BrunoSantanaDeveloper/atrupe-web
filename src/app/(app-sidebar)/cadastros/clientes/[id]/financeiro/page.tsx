import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
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
      wall={{
        title: 'Abas adicionais de cliente',
        description:
          'A aba Financeiro reúne no cadastro o saldo, as contas e as movimentações do cliente.',
      }}
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
