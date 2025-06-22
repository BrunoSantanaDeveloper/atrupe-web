import { redirect } from 'next/navigation'

export default function ClientPage({ params }: { params: { id: string } }) {
  redirect(`/cadastros/clientes/${params.id}/dados`)
}
