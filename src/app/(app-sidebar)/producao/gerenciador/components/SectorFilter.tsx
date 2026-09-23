'use client'

// React / Next
import Link from 'next/link'

// UI
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

const sectors = [
  { value: '', label: 'Todos os setores' },
  { value: 'Criação', label: 'Criação' },
  { value: 'Impressão', label: 'Impressão' },
  { value: 'Produção', label: 'Produção' },
  { value: 'Marcenaria', label: 'Marcenaria' },
  { value: 'Instalação', label: 'Instalação' },
]

// O gerenciador é por setor (§12): cada setor vê o seu quadro
export function SectorFilter({ searchParams }: SearchParamsType) {
  const current = (searchParams?.sector as string) || ''

  return (
    <Tabs value={current} className="overflow-x-auto">
      <TabsList>
        {sectors.map((sector) => (
          <TabsTrigger key={sector.value} value={sector.value} asChild>
            <Link
              href={
                sector.value
                  ? `/producao/gerenciador?sector=${encodeURIComponent(sector.value)}`
                  : '/producao/gerenciador'
              }
            >
              {sector.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
