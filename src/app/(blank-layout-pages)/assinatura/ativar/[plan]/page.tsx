'use client'

import { useEffect, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

// UI
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { ProgressCircle } from '@/components/ui/progress-circle'

// Components
import { Logo } from '@/components/Logo'
import { toast } from 'sonner'

const features = {
  START: [
    'user_limit_3',
    'sales_orders_limited',
    'rejection_reasons_limited',
    'budget_status_limited',
    'delivery_schedule_limited',
    'bank_accounts_limited',
    'bank_tax_transfer_limited',
    'products_limited',
    'production_stages_limited',
    'clients_limited',
    'suppliers_limited',
  ],
  LITE: [
    'user_limit_5',
    'additional_cnpj',
    'sectors_management',
    'sales_orders_full',
    'quick_sale',
    'rejection_reasons_full',
    'budget_status_full',
    'delivery_schedule_full',
    'accounts_receivable',
    'accounts_payable',
    'cash_control',
    'pdv',
    'bank_accounts_full',
    'bank_tax_transfer_full',
    'credit_limit',
    'products_full',
    'production_stages_full',
    'clients_full',
    'suppliers_full',
  ],
}

export default function AtivarPlanoPage({
  params,
}: {
  params: { plan: string }
}) {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (progress > 0) return

    const startProgress = async () => {
      const progressPromise = (async () => {
        for (let i = 0; i <= 100; i += Math.floor(Math.random() * 3) + 1) {
          setProgress(i)

          if (i < 100) {
            await new Promise((resolve) =>
              setTimeout(resolve, Math.random() * 100),
            )
          }
        }
        setProgress(100)
      })()

      const updateSessionPromise = (async () => {
        try {
          // Atualizar a sessão local com os novos dados
          if (session?.company?.id) {
            // TODO: Gravar o plano escolhido e features
            await update({
              company: {
                plan: {
                  name: params.plan.toUpperCase(),
                  features:
                    features[
                      params.plan.toUpperCase() as keyof typeof features
                    ],
                },
              },
            })
          }
        } catch (error) {
          console.error('Erro ao atualizar dados da empresa:', error)
        }
      })()

      // Aguardar ambos os processos terminarem
      await Promise.all([progressPromise, updateSessionPromise])

      toast.success('Redirecionando...')

      // Aguardar um pouco antes de redirecionar
      setTimeout(() => {
        router.replace('/')
      }, 500)
    }

    // Iniciar após pequeno delay
    const timer = setTimeout(startProgress, 1000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, progress])

  if (!features[params.plan.toUpperCase() as keyof typeof features]) {
    notFound()
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
          <CardHeader className="p-0 mb-8 text-center">
            <CardTitle className="text-xl font-bold">Validando dados</CardTitle>
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
