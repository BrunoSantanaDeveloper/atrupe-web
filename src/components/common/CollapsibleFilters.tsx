'use client'

// Filtros recolhíveis no celular (ajuste de mobile, 20/11/2026). Ao abrir uma
// lista no celular, os filtros ocupavam a tela inteira antes dos registros.
// Abaixo de `sm`, os filtros ficam fechados atrás de dois ícones: a lupa abre
// a busca e o funil abre os demais filtros, com o número de filtros ativos no
// funil para a lista não parecer completa quando está filtrada. A partir de
// `sm` nada muda: busca e filtros aparecem como sempre.

import { useId, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { IconFilter, IconSearch } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface Props {
  // Os filtros (período, setor, vendedor…), abertos pelo funil
  children?: ReactNode
  // A busca, aberta pela lupa. Sem ela, a lupa não aparece e a busca, se
  // houver, vai junto dos filtros
  search?: ReactNode
  // Quantos filtros estão aplicados (sem contar a busca)
  activeCount?: number
  // A busca tem texto: a lupa já começa aberta, para o termo não sumir
  searchActive?: boolean
  // Ações que ficam sempre à vista, na linha dos ícones (ex.: ordenar)
  actions?: ReactNode
  className?: string
  // Classe do bloco dos filtros (o que fica escondido no celular)
  contentClassName?: string
  searchClassName?: string
}

export function CollapsibleFilters({
  children,
  search,
  activeCount = 0,
  searchActive = false,
  actions,
  className,
  contentClassName,
  searchClassName,
}: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(searchActive)
  const filtersId = useId()
  const searchId = useId()

  return (
    <div className={cn('max-sm:space-y-3', className)}>
      <div className="flex items-center gap-2 sm:hidden">
        {search ? (
          <Button
            type="button"
            size="icon"
            variant={searchOpen ? 'neutralLight' : 'neutralOutline'}
            aria-label={searchOpen ? 'Fechar a busca' : 'Buscar'}
            aria-expanded={searchOpen}
            aria-controls={searchId}
            onClick={() => setSearchOpen((open) => !open)}
            className="relative"
          >
            <Icon icon={IconSearch} size="md" />
            {searchActive && !searchOpen ? (
              <span
                aria-hidden
                className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand-600"
              />
            ) : null}
          </Button>
        ) : null}
        {children ? (
          <Button
            type="button"
            size="icon"
            variant={filtersOpen ? 'neutralLight' : 'neutralOutline'}
            aria-label={
              activeCount
                ? `Filtros, ${activeCount} ${activeCount === 1 ? 'aplicado' : 'aplicados'}`
                : 'Filtros'
            }
            aria-expanded={filtersOpen}
            aria-controls={filtersId}
            onClick={() => setFiltersOpen((open) => !open)}
            className="relative"
          >
            <Icon icon={IconFilter} size="md" />
            {activeCount ? (
              <span
                aria-hidden
                className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white"
              >
                {activeCount}
              </span>
            ) : null}
          </Button>
        ) : null}
        {actions ? <div className="ml-auto flex gap-2">{actions}</div> : null}
      </div>
      {search ? (
        <div
          id={searchId}
          className={cn(!searchOpen && 'max-sm:hidden', searchClassName)}
        >
          {search}
        </div>
      ) : null}
      {children ? (
        <div
          id={filtersId}
          className={cn(!filtersOpen && 'max-sm:hidden', contentClassName)}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}
