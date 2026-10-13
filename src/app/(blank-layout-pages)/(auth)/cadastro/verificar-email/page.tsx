// Next
import type { Metadata } from 'next'

// UI
import {
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

// Components
import { StoredEmail } from './components/StoredEmail'
import { VerifyEmailForm } from './components/VerifyEmailForm'

export const metadata: Metadata = {
  title: 'Verificar e-mail',
  description: 'Verifique seu e-mail',
}

export default function VerifyEmailPage() {
  return (
    <>
      <CardHeader className="p-0 mb-8 text-center">
        <CardTitle>Verificação de e-mail</CardTitle>
        <CardDescription>
          Enviamos um código de verificação para o e-mail <StoredEmail />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyEmailForm />
      </CardContent>
    </>
  )
}
