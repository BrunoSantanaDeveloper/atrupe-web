'use client'
import { useSupplierById } from '@/hooks/queries/useSupplierById'
import { SupplierSummary } from './components/Summary'
import { PermissionGate } from '@/components/common/PermissionGate'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function ClientDataPage({ params }: Props) {
  const { data } = useSupplierById({ id: params.id })
  return (
    <PermissionGate
      permissions={['register:supplier:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os dados do fornecedor.
        </div>
      }
    >
      <SupplierSummary data={data} />
    </PermissionGate>
  )
}
