'use client'

// As etapas de produção do produto numa sanfona (14/11/2026): ficam abaixo
// das configurações de venda e começam fechadas. A lista continua montada
// com a sanfona fechada, porque é ela que preenche os setores do produto
// novo ao abrir o cadastro.

// React
import { useState } from 'react'

// Third-party
import { useFormContext, useWatch } from 'react-hook-form'

// Components
import { ProductionStages } from './ProductionStages'

// Types
import type { NewProductsFormType } from './schema'

// Icons
import { IconChevronDown } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Libs
import { cn } from '@/lib/utils'

export function ProductionStagesSection() {
  const [open, setOpen] = useState(false)
  const { control } = useFormContext<NewProductsFormType>()
  const stages = useWatch({ control, name: 'productionStages' }) || []
  const active = stages.filter((stage) => stage?.isActive).length

  return (
    <section className="mt-4 w-full rounded-2xl border border-gray-200 bg-gray-50">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <div>
          <h3 className="type-card-title">Etapas de produção</h3>
          <p className="text-sm text-gray">
            {stages.length
              ? `${active} de ${stages.length} etapas usadas por este produto`
              : 'Os setores por onde o produto passa na produção'}
          </p>
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
      <div className={cn('px-5 pb-5', !open && 'hidden')}>
        <ProductionStages hideTitle />
      </div>
    </section>
  )
}
