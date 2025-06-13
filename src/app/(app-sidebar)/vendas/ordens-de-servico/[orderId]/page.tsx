import { Metadata } from 'next'

// Components
import { Order } from './components/Order'

// Types
import { ParamsType } from '@/types/coreTypes'

// Metadata
export const metadata: Metadata = {
  title: 'Ordem de serviço',
  description: 'Ordem de serviço',
}

export default async function OrderPage({ params }: ParamsType) {
  return <Order id={params.orderId} />
}
