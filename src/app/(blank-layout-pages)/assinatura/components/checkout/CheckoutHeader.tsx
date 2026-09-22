'use client'

import Link from 'next/link'
import { IconArrowLeft } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

interface Props {
  title: string
  backHref: string
  onBack?: () => void
}

/** Cabeçalho das etapas da contratação: voltar, título e a logo. */
export function CheckoutHeader({ title, backHref, onBack }: Props) {
  return (
    <header className="flex flex-wrap justify-between gap-2 bg-white px-6 py-4">
      <div className="flex items-center gap-1">
        {onBack ? (
          <Button
            type="button"
            size="icon"
            variant="neutralLight"
            className="bg-transparent"
            onClick={onBack}
            aria-label="Voltar"
          >
            <IconArrowLeft />
          </Button>
        ) : (
          <Button
            asChild
            type="button"
            size="icon"
            variant="neutralLight"
            className="bg-transparent"
          >
            <Link href={backHref} aria-label="Voltar">
              <IconArrowLeft />
            </Link>
          </Button>
        )}
        <h1 className="text-gray-800 font-semibold text-lg">{title}</h1>
      </div>
      <Logo text />
    </header>
  )
}
