'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Logo } from '@/components/Logo'
import { ProgressCircle } from '@/components/ui/progress-circle'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

type SubscriptionStatus = 'processing' | 'success' | 'error' | 'waiting_payment'

export default function FinishSubscriptionPage() {
  const [status, setStatus] = useState<SubscriptionStatus>('processing')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [countdown, setCountdown] = useState(30)
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { update } = useSession()

  // Countdown para redirecionamento automático
  useEffect(() => {
    if (status === 'waiting_payment' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (status === 'waiting_payment' && countdown === 0) {
      router.replace('/dashboard')
    }
  }, [status, countdown, router])

  const checkPaymentStatus = async () => {
    setIsChecking(true)
    setStatus('processing')
    setProgress(20)

    try {
      const token = await fetch('/api/auth/session')
        .then((res) => res.json())
        .then((session) => session?.accessToken)

      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      setProgress(50)

      const checkResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/check-status`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      )

      const checkResult = await checkResponse.json()

      setProgress(80)

      await update()

      setProgress(100)

      if (
        checkResult.status === 'activated' ||
        checkResult.status === 'already_active'
      ) {
        setStatus('success')
        toast.success('Assinatura realizada com sucesso!')
        setTimeout(() => {
          router.replace('/dashboard')
        }, 3000)
      } else {
        setStatus('waiting_payment')
        setErrorMessage(
          'Pagamento ainda não confirmado. Aguarde alguns instantes e tente verificar novamente.',
        )
        setCountdown(30) // Reset countdown
        toast.info('Pagamento ainda pendente')
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
      setStatus('error')
      setErrorMessage('Erro ao verificar status do pagamento')
      setProgress(0)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    const processSubscription = async () => {
      try {
        setProgress(20)

        // Aguardar um pouco para o webhook processar (se estiver configurado)
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setProgress(40)

        // Verificar status diretamente no Asaas (polling ativo)
        const token = await fetch('/api/auth/session')
          .then((res) => res.json())
          .then((session) => session?.accessToken)

        if (!token) {
          throw new Error('Token de autenticação não encontrado')
        }

        setProgress(60)

        // Chamar endpoint que verifica status no Asaas e sincroniza
        const checkResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subscriptions/check-status`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        )

        const checkResult = await checkResponse.json()

        setProgress(80)

        // Atualizar a sessão para obter os dados mais recentes
        await update()

        setProgress(100)

        // Verificar o resultado da sincronização
        if (
          checkResult.status === 'activated' ||
          checkResult.status === 'already_active'
        ) {
          setStatus('success')
          toast.success('Assinatura realizada com sucesso!')

          // Redirecionar para o dashboard após 3 segundos
          setTimeout(() => {
            router.replace('/dashboard')
          }, 3000)
        } else if (checkResult.status === 'payment_pending') {
          // Pagamento ainda pendente (PIX ou Boleto)
          setStatus('waiting_payment')
          setErrorMessage(
            'Aguardando confirmação do pagamento. Você receberá um e-mail quando o pagamento for confirmado.',
          )
          setCountdown(30)
        } else {
          // Outro status (not_found, no_payments, etc.)
          setStatus('waiting_payment')
          setErrorMessage(
            'Assinatura em processamento. Você receberá um e-mail quando o pagamento for confirmado.',
          )
          setCountdown(30)
        }
      } catch (error) {
        console.error('Erro ao processar assinatura:', error)
        setStatus('error')
        setErrorMessage('Erro inesperado ao processar assinatura')
        setProgress(0)
      }
    }

    processSubscription()
  }, [searchParams, router, update])

  if (status === 'processing') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
            <CardHeader className="p-0 mb-8 text-center">
              <CardTitle className="text-xl font-bold">
                Validando dados
              </CardTitle>
              <CardDescription>
                Estamos atualizando as informações da sua assinatura.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <ProgressCircle value={progress} size={180} />
            </CardContent>
          </Card>
          <Logo text width={154} />
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
            <CardHeader className="p-0 mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <IconCheck size={48} className="text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-green-600">
                Assinatura realizada com sucesso!
              </CardTitle>
              <CardDescription>
                Sua assinatura foi ativada. Você será redirecionado em
                instantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Button
                onClick={() => router.replace('/dashboard')}
                className="w-full"
              >
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>
          <Logo text width={154} />
        </div>
      </div>
    )
  }

  if (status === 'waiting_payment') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
            <CardHeader className="p-0 mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-3">
                  <IconCheck size={48} className="text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-blue-600">
                Aguardando pagamento
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {errorMessage}
              </CardDescription>
              <CardDescription className="text-gray-500 mt-4">
                Redirecionando para o dashboard em{' '}
                <span className="font-semibold text-blue-600">
                  {countdown}s
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <Button
                onClick={checkPaymentStatus}
                disabled={isChecking}
                className="w-full"
                variant="default"
              >
                {isChecking ? 'Verificando...' : 'Verificar novamente'}
              </Button>
              <Button
                onClick={() => router.replace('/dashboard')}
                className="w-full"
                variant="outline"
              >
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>
          <Logo text width={154} />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center gap-8 w-full">
          <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
            <CardHeader className="p-0 mb-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <IconX size={48} className="text-red-600" />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-red-600">
                Erro ao processar assinatura
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {errorMessage ||
                  'Ocorreu um erro ao processar sua assinatura. Por favor, tente novamente.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Button
                onClick={() => router.replace('/dashboard')}
                className="w-full"
              >
                Ir para o Dashboard
              </Button>
            </CardContent>
          </Card>
          <Logo text width={154} />
        </div>
      </div>
    )
  }

  return null
}
