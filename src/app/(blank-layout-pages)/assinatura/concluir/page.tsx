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
import { createItemNew } from '@/actions/_cruds'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

type SubscriptionStatus = 'processing' | 'success' | 'error' | 'expired'

export default function FinishSubscriptionPage() {
  const [status, setStatus] = useState<SubscriptionStatus>('processing')
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { update } = useSession()

  useEffect(() => {
    const processSubscription = async () => {
      try {
        setProgress(10)

        // Recuperar dados da assinatura pendente do sessionStorage
        const pendingSubscriptionData = sessionStorage.getItem(
          'pendingSubscription',
        )

        if (!pendingSubscriptionData) {
          setStatus('expired')
          setErrorMessage('Sessão expirada. Por favor, tente novamente.')
          return
        }

        const pendingSubscription = JSON.parse(pendingSubscriptionData)

        // Verificar se a sessão não expirou (30 minutos)
        const sessionAge = Date.now() - pendingSubscription.timestamp
        if (sessionAge > 30 * 60 * 1000) {
          sessionStorage.removeItem('pendingSubscription')
          setStatus('expired')
          setErrorMessage('Sessão expirada. Por favor, tente novamente.')
          return
        }

        setProgress(30)

        // Obter parâmetros da URL (enviados pelo Asaas)
        const checkoutId =
          searchParams.get('checkout_id') || pendingSubscription.checkoutId
        const paymentStatus = searchParams.get('status')
        const paymentId = searchParams.get('payment_id')

        setProgress(50)

        // Criar assinatura no backend
        const res = await createItemNew({
          route: '/plan/subscription/complete',
          data: {
            checkoutId,
            paymentId,
            paymentStatus,
            planId: pendingSubscription.planId,
            modules: pendingSubscription.modules,
            additionalUsers: pendingSubscription.additionalUsers,
          },
        })

        setProgress(70)

        if (!res.success) {
          setStatus('error')
          setErrorMessage(res.message || 'Erro ao finalizar assinatura')
          toast.error(res.message || 'Erro ao finalizar assinatura')
          return
        }

        setProgress(85)

        // Atualizar a sessão local com os novos dados
        try {
          await update({
            company: {
              plan: {
                name: pendingSubscription.planName,
                features: res.data.features,
              },
            },
          })
        } catch (error) {
          console.error('Erro ao atualizar sessão:', error)
        }

        setProgress(100)

        // Limpar dados do sessionStorage
        sessionStorage.removeItem('pendingSubscription')

        setStatus('success')
        toast.success('Assinatura realizada com sucesso!')

        // Redirecionar para o dashboard após 3 segundos
        setTimeout(() => {
          router.replace('/dashboard')
        }, 3000)
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

  if (status === 'error' || status === 'expired') {
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
                {status === 'expired'
                  ? 'Sessão expirada'
                  : 'Erro ao processar assinatura'}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {errorMessage ||
                  'Ocorreu um erro ao processar sua assinatura. Por favor, tente novamente.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Button
                onClick={() => router.replace('/assinatura')}
                className="w-full"
              >
                Voltar para assinatura
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
