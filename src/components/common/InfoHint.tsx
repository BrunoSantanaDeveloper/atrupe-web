'use client'

// O (i) ao lado de um título ou campo: ao clicar, abre a explicação de para
// que serve e como funciona (decisão de 18/11/2026). Substitui os textos
// explicativos que ficavam sempre à vista e pesavam a tela. O (!) laranja
// (RiskHint) continua sendo só para a opção que abre uma brecha.
//
// Fica à vista, fora do (i): aviso e erro (o que bloqueia diz o caminho),
// valor calculado ou em uso, estado da tela e as confirmações dos diálogos.

import { IconInfoCircle } from '@tabler/icons-react'

import { Icon } from '@/components/ui/icon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function InfoHint({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Sobre: ${title}`}
          className="inline-flex shrink-0 items-center justify-center rounded-full max-sm:-m-2 max-sm:p-2 align-middle text-gray-400 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          <Icon icon={IconInfoCircle} size="sm" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] space-y-2 text-sm text-gray-700">
        <p className="font-semibold text-gray-900">{title}</p>
        {children}
      </PopoverContent>
    </Popover>
  )
}
