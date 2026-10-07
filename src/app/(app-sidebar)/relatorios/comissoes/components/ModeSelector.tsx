'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// Icons
import { IconReceipt2, IconCoin } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'
import { updateFilterParam } from '@/lib/filter-utils'

// Mode
import {
  commissionModeOf,
  commissionModeCopy,
  type CommissionMode,
} from '../mode'

const icons = { sold_value: IconReceipt2, received_value: IconCoin }

// A primeira pergunta do relatório é como a empresa paga a comissão. Fica fora
// da barra de filtros porque ela some no celular, e sem o modo o número da
// comissão não quer dizer nada
export function ModeSelector() {
  const router = useRouter()
  const params = useSearchParams()
  const mode = commissionModeOf(params.get('commissionType'))

  return (
    <div
      role="radiogroup"
      aria-label="Como a comissão é calculada"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {(Object.keys(commissionModeCopy) as CommissionMode[]).map((value) => {
        const copy = commissionModeCopy[value]
        const Icon = icons[value]
        const active = value === mode

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() =>
              updateFilterParam('commissionType', value, { router, params })
            }
            className={cn(
              'flex items-start gap-3 rounded-xl border bg-white p-4 text-left shadow-sm transition-colors',
              active
                ? 'border-brand-600 ring-1 ring-brand-600'
                : 'border-gray-200 hover:border-gray-300',
            )}
          >
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-lg',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-gray-100 text-gray-500',
              )}
            >
              <Icon size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-gray-800">
                Comissão {copy.label.toLowerCase()}
              </span>
              <span className="mt-0.5 block text-sm text-gray">
                {copy.description}
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                'mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border',
                active ? 'border-brand-600 bg-brand-600' : 'border-gray-300',
              )}
            >
              {active && <span className="size-1.5 rounded-full bg-white" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
