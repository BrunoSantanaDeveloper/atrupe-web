import { Metadata } from 'next'

// Components
import { PayrollDetail } from './components/PayrollDetail'

// Types
import { ParamsType } from '@/types/coreTypes'

export const metadata: Metadata = {
  title: 'Folha de Pagamento',
  description: 'Detalhes da folha de pagamento do colaborador',
}

export default async function PayrollDetailPage({ params }: ParamsType) {
  return <PayrollDetail payrollId={params.payrollId} />
}
