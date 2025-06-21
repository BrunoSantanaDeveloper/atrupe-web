// Next
import type { Metadata } from 'next'

// UI
import { CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { NewPassword } from './components/NewPassword'

export const metadata: Metadata = {
  title: 'Criação de senha',
  description: 'Crie sua senha',
}

export default function NewPasswordPage() {
  return (
    <>
      <CardHeader className="p-0 mb-4 text-center">
        <CardTitle className="text-xl font-bold">Criação de senha</CardTitle>
      </CardHeader>
      <CardContent>
        <NewPassword />
      </CardContent>
    </>
  )
}
