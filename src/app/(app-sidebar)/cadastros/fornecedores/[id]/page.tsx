import { redirect } from 'next/navigation'

export default function SupplierPage({ params }: { params: { id: string } }) {
  redirect(`/cadastros/fornecedores/${params.id}/dados`)
}
