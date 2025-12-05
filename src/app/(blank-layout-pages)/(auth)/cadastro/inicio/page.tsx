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
import { SignupForm } from './components/SignupForm'

export const metadata: Metadata = {
  title: 'Cadastro',
  description: 'Crie sua conta',
}

export default function SignupPage() {
  return (
    <>
      <CardHeader className="p-0 mb-8 text-center">
        <CardTitle className="text-xl font-bold">Vamos começar!</CardTitle>
        <CardDescription>
          Crie sua conta e experimente grátis por 15 dias!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </>
  )
}
