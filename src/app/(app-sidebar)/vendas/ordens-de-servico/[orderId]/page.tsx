import { Metadata } from 'next'

// Components
import { Order } from './components/Order'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import { ParamsType } from '@/types/coreTypes'

// Metadata
export const metadata: Metadata = {
  title: 'Ordem de serviço',
  description: 'Ordem de serviço',
}

export default async function OrderPage({ params }: ParamsType) {
  return (
    <PermissionGate
      permissions={['sale:order:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar esta ordem de serviço.
        </div>
      }
    >
      <Order id={params.orderId} />
    </PermissionGate>
  )
}
