'use client'

// Produção › Setores (LITE; área 9 §4.16, 26/11/2026): um cartão por setor
// de produção, com os trabalhos abertos nele. Cada cartão abre a tela do
// setor. A Agenda de entrega continua sendo a visão de todos os trabalhos.

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { IconChevronRight, IconListCheck } from '@tabler/icons-react'

import { Topbar } from '@/components/common/Topbar'
import { SectorIcon } from '@/components/common/SectorIcon'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@/components/ui/icon'
import { useSector } from '@/hooks/queries/useSector'
import { cn } from '@/lib/utils'
import { DELIVERY_STAGE_NAMES, WORK_QUERY, fetchWork } from '../work'

export function SectorsHome() {
  const { data: sectors, isLoading: loadingSectors } = useSector({
    isProductionStage: true,
  })
  const { data: work, isLoading: loadingWork } = useQuery({
    queryKey: [WORK_QUERY, 'counts'],
    queryFn: () => fetchWork({ view: 'open' }),
  })

  const list = (sectors ?? []).filter(
    (sector) => sector.isActive && !DELIVERY_STAGE_NAMES.includes(sector.name),
  )

  return (
    <div className="space-y-5">
      <Topbar
        title="Setores"
        supportText="Cada setor tem a sua lista de trabalhos. Concluir aqui ou no ícone da Agenda de entrega é a mesma coisa."
      />
      {loadingSectors ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-[48px] rounded-xl" />
          ))}
        </div>
      ) : list.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((sector) => {
            const open = work?.counts?.[sector.id] ?? 0
            return (
              <Link
                key={sector.id}
                href={`/producao/setores/${sector.id}`}
                className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 transition hover:border-brand-300 hover:shadow-sm"
              >
                <SectorIcon
                  name={sector.name}
                  icon={sector.icon}
                  sectorId={sector.id}
                  size="sm"
                />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">
                  {sector.name}
                </p>
                {loadingWork ? (
                  <Skeleton className="h-4 w-8" />
                ) : (
                  <span
                    className={cn(
                      'flex shrink-0 items-center gap-1 text-sm font-medium',
                      open ? 'text-blue-700' : 'text-gray',
                    )}
                    title={
                      open === 1
                        ? '1 trabalho a fazer'
                        : `${open} trabalhos a fazer`
                    }
                  >
                    <Icon icon={IconListCheck} size="sm" />
                    {open}
                  </span>
                )}
                <Icon
                  icon={IconChevronRight}
                  size="sm"
                  className="shrink-0 text-gray transition group-hover:text-brand-600"
                />
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-sm text-gray">
            Nenhum setor de produção ativo. Marque os setores em Configurações ›
            Setores.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
