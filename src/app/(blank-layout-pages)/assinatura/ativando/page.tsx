'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function AtivarPlanoPage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const startProgress = async () => {
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)

        if (i < 100) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      // Aguardar um pouco antes de atualizar os dados e redirecionar
      setTimeout(async () => {
        try {
          // Atualizar a sessão local com os novos dados
          if (session?.company?.id) {
            await update({
              company: {
                subscription: 'START', // TODO: Gravar o plano escolhido e features
                features: [],
              },
            })
          }
        } catch (error) {
          console.error('Erro ao atualizar dados da empresa:', error)
        } finally {
          // Redirecionar para a página inicial
          router.replace('/')
        }
      }, 1500)
    }

    // Iniciar após pequeno delay
    const timer = setTimeout(startProgress, 1000)

    return () => clearTimeout(timer)
  }, [router, session, update])

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        <Logo text width={154} />
        <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
          <CardHeader className="p-0 mb-8 text-center">
            <CardTitle className="text-xl font-bold">Validando dados</CardTitle>
            <CardDescription>
              Estamos atualizando as informações da sua assinatura.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ProgressCircle value={progress} size={180} />
            <div className="text-2xl font-bold text-gray-700">{progress}%</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
