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

export default function SupplierFinancialPage({ params }: Props) {
  return (
    <PermissionGate
      requireAll
      permissions={['financial:flow:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar o financeiro do fornecedor.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.CONTACTS.SUPPLIER_ADDITIONAL_TABS]}
        wall={{
          title: 'Abas adicionais de fornecedor',
          description:
            'A aba Financeiro reúne no cadastro o saldo, as contas e as movimentações do fornecedor.',
        }}
      >
        <EntityFinancialSummary entityId={params.id} entityType="supplier" />
      </FeatureGate>
    </PermissionGate>
  )
}
