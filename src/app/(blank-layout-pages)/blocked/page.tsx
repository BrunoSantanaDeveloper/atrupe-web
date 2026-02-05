import type { Metadata } from 'next'
import Link from 'next/link'
import { Lock, CreditCard, Headset, AlertTriangle } from 'lucide-react'

// UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const metadata: Metadata = {
  title: 'Conta Suspensa',
  description: 'Sua conta foi suspensa por pendências financeiras',
}

export default function BlockedPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-error-100 flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-error" />
          </div>
          <CardTitle className="text-2xl font-bold">Conta Suspensa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            O acesso da sua empresa foi suspenso devido a pendências
            financeiras. Regularize sua situação para voltar a utilizar o
            sistema.
          </p>

          <Alert variant="error">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Sua assinatura possui pagamentos pendentes. Após a confirmação do
              pagamento, o acesso será restaurado automaticamente.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link href="https://www.asaas.com" target="_blank">
                <CreditCard className="w-5 h-5 mr-2" />
                Regularizar Pagamento
              </Link>
            </Button>

            <Button
              asChild
              variant="neutralOutline"
              size="lg"
              className="w-full"
            >
              <Link href="mailto:suporte@atrupe.com.br">
                <Headset className="w-5 h-5 mr-2" />
                Contatar Suporte
              </Link>
            </Button>
          </div>

          <p className="text-xs text-gray-400">
            Se você acredita que isso é um erro, entre em contato conosco.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
