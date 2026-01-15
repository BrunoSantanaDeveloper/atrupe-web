import { Metadata } from 'next'

// Components
import { PayrollDetail } from './components/PayrollDetail'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import { ParamsType } from '@/types/coreTypes'

export const metadata: Metadata = {
  title: 'Folha de Pagamento',
  description: 'Detalhes da folha de pagamento do colaborador',
}

export default async function PayrollDetailPage({ params }: ParamsType) {
  return (
    <PermissionGate
      permissions={['financial:payroll:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a folha de pagamento.
        </div>
      }
    >
      <PayrollDetail payrollId={params.payrollId} />
    </PermissionGate>
  )
}
