// Next
import type { Metadata } from 'next'

// UI
import { CardHeader, CardContent, CardTitle } from '@/components/ui/card'

// Components
import { LoginForm } from './components/LoginForm'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Entre em sua conta',
}

export default function LoginPage() {
  return (
    <>
      <CardHeader className="p-0 mb-8 text-center">
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </>
  )
}
