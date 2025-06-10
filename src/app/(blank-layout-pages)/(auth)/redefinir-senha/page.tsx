// Next
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// UI
import { CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { NewPassword } from './components/NewPassword'

export const metadata: Metadata = {
  title: 'Criação de senha',
  description: 'Crie sua senha',
}

export default function NewPasswordPage({
  searchParams,
}: {
  searchParams: { token: string }
}) {
  if (!searchParams.token) notFound()

  return (
    <>
      <CardHeader className="p-0 mb-8 text-center">
        <CardTitle className="text-xl font-bold">
          Criação de nova senha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <NewPassword token={searchParams.token} />
      </CardContent>
    </>
  )
}
