'use client'

import Link from 'next/link'
import { IconArrowLeft } from '@tabler/icons-react'
import { Logo } from '@/components/Logo'

interface Props {
  title: string
  backHref: string
  onBack?: () => void
}

const BACK_CLASS =
  'grid size-10 flex-none place-items-center rounded-lg p-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700'

/** Cabeçalho das etapas da contratação: voltar, título e a logo. */
export function CheckoutHeader({ title, backHref, onBack }: Props) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-[1040px] items-center gap-3 px-6 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-1">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar"
              className={BACK_CLASS}
            >
              <IconArrowLeft className="size-5" />
            </button>
          ) : (
            <Link href={backHref} aria-label="Voltar" className={BACK_CLASS}>
              <IconArrowLeft className="size-5" />
            </Link>
          )}
          <h1 className="truncate text-lg font-semibold leading-7 text-gray-900">
            {title}
          </h1>
        </div>
        <div className="flex flex-none items-center">
          <Logo text width={120} />
        </div>
      </div>
    </header>
  )
}
