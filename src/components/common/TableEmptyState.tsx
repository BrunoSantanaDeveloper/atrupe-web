'use client'

// Next Imports
import { useRouter } from 'next/navigation'

// UI component Imports
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '../ui/featured-icon'

// Icon Imports
import { IconSearch } from '@tabler/icons-react'

// Type Imports
import type { IconProps } from '@tabler/icons-react'

interface FilteredEmpty {
  title?: string
  description?: string
  cta?: JSX.Element
}

export function FilteredDataEmpty({
  cta,
  title = 'Nada encontrado',
  description = 'Sua busca não encontrou nenhum resultado. Tente novamente ou cadastre um novo item.',
}: FilteredEmpty) {
  const router = useRouter()

  return (
    <div className="flex justify-center items-center h-[calc(100vh-255px)] w-full">
      <div className="max-w-[352px] text-center space-y-6">
        <div>
          <FeaturedIcon
            Icon={IconSearch}
            size="xl"
            variant="borderedLight"
            rounded
          />
          <p className="font-semibold text-base mt-4 mb-1">{title}</p>
          <p className="text-sm text-gray">{description}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => router.push('?')}
          >
            Refazer busca
          </Button>
          {cta || null}
        </div>
      </div>
    </div>
  )
}

interface TotalEmptyProps {
  title?: string
  description?: string
  icon?: React.ElementType<IconProps>
  cta?: JSX.Element
}

export function ListDataTotalEmpty({
  icon = IconSearch,
  title = 'Nenhum item cadastrado',
  description = 'Cadastre seu primeiro item',
  cta,
}: TotalEmptyProps) {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-170px)]">
      <div className="max-w-[352px] text-center space-y-6">
        <div>
          <FeaturedIcon Icon={icon} size="xl" variant="borderedLight" rounded />
          <p className="font-semibold text-base mt-4 mb-1">{title}</p>
          <p className="text-sm text-gray">{description}</p>
        </div>
        {cta || null}
      </div>
    </div>
  )
}

interface StatusEmptyProps {
  title?: string
  icon?: React.ComponentType<IconProps>
}

export function ListDataStatusEmpty({
  icon = IconSearch,
  title = 'Nenhum registro neste status',
}: StatusEmptyProps) {
  return (
    <div className="flex justify-center items-center h-[calc(100vh-150px)]">
      <div className="max-w-[352px] text-center space-y-6">
        <div>
          <FeaturedIcon Icon={icon} size="xl" variant="borderedLight" rounded />
          <p className="font-semibold text-base mt-4 mb-1">{title}</p>
        </div>
      </div>
    </div>
  )
}
