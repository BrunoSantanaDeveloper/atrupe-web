// Components
import { ProposalPrint } from '../components/ProposalPrint'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return { title: 'Proposta' }
}

export default function ProposalPage({
  params,
}: {
  params: { quotationId: string }
}) {
  return (
    <PermissionGate
      permissions={['sale:quotation:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar o orçamento.
        </div>
      }
    >
      <ProposalPrint quotationId={params.quotationId} />
    </PermissionGate>
  )
}
