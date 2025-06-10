'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

// UI
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { ProgressCircle } from '@/components/ui/progress-circle'

// Store
import { useSignupStore } from '@/store/signupStore'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Components
import { toast } from 'sonner'
import { Logo } from '@/components/Logo'

export default function ResetingPasswordPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [hasRedirected, setHasRedirected] = useState(false)
  const { newPasswordData, verificationToken, clearSignupData } =
    useSignupStore()
  const processStarted = useRef(false)

  useEffect(() => {
    const sendData = async () => {
      if (processStarted.current || hasRedirected) {
        console.log(
          'Processo já iniciado anteriormente, ignorando chamada duplicada',
        )
        return
      }

      processStarted.current = true

      let currentProgress = 0

      const finishSignupPromise = createItemNew({
        route: '/user/reset-password',
        data: {
          token: verificationToken,
          password: newPasswordData?.password,
        },
      })

      while (currentProgress < 80) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        const increment = Math.floor(Math.random() * 6)
        currentProgress = Math.min(80, currentProgress + increment)
        setProgress(currentProgress)
      }

      const signupResponse = await finishSignupPromise

      if (!signupResponse.success) {
        toast.error(signupResponse.message)
        setProgress(0)
        console.error(
          'Erro durante o processo de redefinição de senha:',
          signupResponse.message,
        )
        setHasRedirected(true)
        router.push('/')
        setTimeout(() => {
          clearSignupData()
        }, 500)
      } else {
        setProgress(100)
        toast.success('Senha redefinida com sucesso!')
        setHasRedirected(true)
        router.push('/login')
        setTimeout(() => {
          clearSignupData()
        }, 500)
      }
    }

    if (!hasRedirected) {
      console.log('Componente montado, iniciando processo')
      sendData()
    }
  }, [
    newPasswordData,
    verificationToken,
    router,
    clearSignupData,
    hasRedirected,
  ])

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center gap-8 w-full">
        <Logo text width={154} />
        <Card className="rounded-2xl w-full max-w-[464px] mx-auto px-8 py-10">
          <CardHeader className="p-0 mb-8 text-center">
            <CardTitle className="text-xl font-bold">Validando dados</CardTitle>
            <CardDescription>Estamos redefinindo sua senha.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ProgressCircle value={progress} size={180} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
