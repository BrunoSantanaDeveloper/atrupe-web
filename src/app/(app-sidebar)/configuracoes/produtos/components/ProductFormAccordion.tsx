'use client'

// A sanfona do cadastro de produto (16/11/2026): etapas de produção e
// configurações avançadas de venda. O conteúdo continua montado com a
// sanfona fechada, porque os blocos de dentro guardam o que ainda não foi
// salvo (variações, faixas, setores do produto novo).

// React
import type { ReactNode } from 'react'

// Icons
import { IconChevronDown } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Libs
import { cn } from '@/lib/utils'

export function ProductFormAccordion({
  title,
  description,
  open,
  onOpenChange,
  children,
  contentClassName,
}: {
  title: string
  description: ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  contentClassName?: string
}) {
  return (
    <section className="mt-4 w-full rounded-2xl border border-gray-200 bg-gray-50">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div>
          <h3 className="type-card-title">{title}</h3>
          <p className="text-sm text-gray">{description}</p>
        </div>
        <IconChevronDown
          aria-hidden="true"
          size={ICON_SIZE.md}
          className={cn(
            'shrink-0 text-gray-500 transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      <div className={cn('px-5 pb-5', contentClassName, !open && 'hidden')}>
        {children}
      </div>
    </section>
  )
}
