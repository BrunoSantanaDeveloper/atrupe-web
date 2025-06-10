'use client'
import { useSupplierById } from '@/hooks/queries/useSupplierById'
import { SupplierSummary } from './components/Summary'

interface Props {
  params: {
    id: string
    tab: string
  }
}

export default function ClientDataPage({ params }: Props) {
  const { data } = useSupplierById({ id: params.id })
  return <SupplierSummary data={data} />
}
