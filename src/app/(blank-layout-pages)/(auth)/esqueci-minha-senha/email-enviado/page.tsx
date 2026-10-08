// Next
import Link from 'next/link'
import type { Metadata } from 'next'

// UI
import { Button } from '@/components/ui/button'
import {
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
} from '@/components/ui/card'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icons
import { IconCircleCheck as CheckCircle } from '@tabler/icons-react'

export const metadata: Metadata = {
  title: 'E-mail enviado com sucesso',
  description: 'E-mail enviado com sucesso',
}

export default function SignupPage() {
  return (
    <>
      <CardHeader className="p-0 mb-1 text-center">
        <FeaturedIcon
          Icon={CheckCircle}
          variant="successBorderedLight"
          size="xl"
          className="mx-auto mb-2"
          rounded
        />
        <CardTitle>E-mail enviado com sucesso</CardTitle>
      </CardHeader>
      <CardContent className="mb-8 text-center text-sm text-gray">
        <p className="mb-3">
          Dentro de alguns instantes você receberá em seu e-mail as instruções
          para a troca de senha.
        </p>
        <p>
          Se não receber em 10 minutos, verifique a lixeira e o spam. Se o
          problema persistir, favor entrar em contato com o{' '}
          <Link href="mailto:suporte@example.com" className="underline">
            nosso suporte
          </Link>
          .
        </p>
      </CardContent>
      <CardFooter className="p-0">
        <Button asChild>
          <Link href="/" className="w-full">
            Ir para a página inicial
          </Link>
        </Button>
      </CardFooter>
    </>
  )
}
