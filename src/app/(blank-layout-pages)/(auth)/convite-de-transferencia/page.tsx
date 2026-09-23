// Next
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// UI
import { CardContent } from '@/components/ui/card'

// Components
import { TransferInvite } from './components/TransferInvite'

export const metadata: Metadata = {
  title: 'Transferência de titularidade',
  description: 'Aceite a transferência de um ambiente Atrupe',
}

/**
 * O link do convite de transferência. Público: quem recebe ainda não tem
 * conta — é aqui que ela é criada. O token vem no endereço (é o link do
 * e-mail), mas segue para o backend no corpo das chamadas.
 */
export default function TransferInvitePage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  if (!searchParams.token) notFound()

  return (
    <CardContent className="p-0">
      <TransferInvite token={searchParams.token} />
    </CardContent>
  )
}
