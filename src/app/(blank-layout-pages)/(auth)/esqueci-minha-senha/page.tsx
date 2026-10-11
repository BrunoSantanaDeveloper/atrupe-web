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
import { ForgotPasswordForm } from './components/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Recuperar senha',
  description: 'Redefina sua senha',
}

export default function SignupPage() {
  return (
    <>
      <CardHeader className="p-0 mb-8 text-center">
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>
          Digite o e-mail cadastrado para redefinir sua senha.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm />
      </CardContent>
    </>
  )
}
