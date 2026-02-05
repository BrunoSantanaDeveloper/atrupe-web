import Link from 'next/link'
import type { Metadata } from 'next'

// Icons
import { Lock, CreditCard, AlertTriangle } from 'lucide-react'

// UI
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Component
import { Logo } from '@/components/Logo'

// Actions
import { getPendingPaymentUrl } from '@/actions/subscription'
import { TryAgainButton } from './components/TryAgainButton'

export const metadata: Metadata = {
  title: 'Conta Suspensa',
  description: 'Sua conta foi suspensa por pendências financeiras',
}

export default async function BlockedPage() {
  // Get dynamic payment URL
  const { paymentUrl } = await getPendingPaymentUrl()

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 py-8 overflow-y-auto">
      <div className="w-full max-w-[1248px] flex items-center gap-10 flex-col-reverse lg:flex-row mx-auto px-4 my-auto">
        {/* Coluna da esquerda - Imagem */}
        <div className="w-full max-w-[744px] aspect-square rounded-3xl bg-[url('/img/auth-start.png')] bg-cover relative"></div>

        {/* Coluna do formulário */}
        <div className="flex flex-col items-center justify-center w-full max-w-[464px] gap-10 py-4">
          <a href="http://www.atrupe.com.br/" target="_blank">
            <Logo text width={154} />
          </a>
          <Card className="rounded-2xl w-full px-8 py-10">
            <CardHeader className="p-0 pb-6 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-error" />
              </div>
              <CardTitle className="text-xl font-bold">
                Conta Suspensa
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <p className="text-gray-600 text-center text-sm">
                O acesso da sua empresa foi suspenso devido a pendências
                financeiras. Regularize sua situação para voltar a utilizar o
                sistema.
              </p>

              <Alert variant="error">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Sua assinatura possui pagamentos pendentes. Após a confirmação
                  do pagamento, o acesso será restaurado.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  className="w-full"
                  disabled={!paymentUrl}
                  LeftIcon={CreditCard}
                >
                  <Link href={paymentUrl || '#'} target="_blank">
                    Regularizar Pagamento
                  </Link>
                </Button>

                <TryAgainButton />
              </div>

              <p className="text-xs text-gray-400 text-center">
                Se você acredita que isso é um erro,{' '}
                <a
                  href="https://wa.me/554721229194"
                  target="_blank"
                  className="text-gray hover:underline"
                >
                  entre em contato conosco
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
