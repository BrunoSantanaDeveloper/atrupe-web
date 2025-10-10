'use client'

import { IconCode, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { Button } from './ui/button'

export function DevEnvAlert() {
  const [isVisible, setIsVisible] = useState(true)

  const isDevEnv = process.env.NEXT_PUBLIC_ENV === 'development'

  if (!isDevEnv || !isVisible) return null

  return (
    <div className="border-b bg-warning-50 border-warning-200">
      <div className="flex flex-wrap items-center justify-center gap-4 py-2 px-4 relative">
        <IconCode className="size-8 stroke-1 flex-shrink-0 text-warning-600" />
        <div className="flex flex-col flex-shrink-0">
          <span className="text-xs font-semibold text-warning-600">
            Você está em ambiente de Desenvolvimento / Homologação
          </span>
          <span className="text-xs text-gray">
            As alterações feitas aqui não serão refletidas em produção!
          </span>
        </div>
        <Button
          RightIcon={IconX}
          size="iconXs"
          variant="warningGhost"
          onClick={() => setIsVisible(false)}
          aria-label="Fechar alerta"
          className="absolute right-4 p-1"
        />
      </div>
    </div>
  )
}
