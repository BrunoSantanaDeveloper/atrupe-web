'use client'

// O mapa de ocupação (GP-50; Maicol, 23/11/2026): uma linha por setor, uma
// coluna por dia, uma semana na tela, rolando para as próximas. Serve para
// saber para quando dá para agendar ou prometer um serviço. Cada quadrado tem
// uma cor: verde (tem espaço), amarelo (acima de 80%), vermelho (lotado) e
// cinza (feriado ou sem expediente). O detalhe aparece ao passar o mouse; o
// clique abre o setor. Só o ELITE (vem do tempo agendado).

// React / Next
import Link from 'next/link'
import { useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { SectorIcon } from '@/components/common/SectorIcon'
import { Icon } from '@/components/ui/icon'

// Actions
import { getOccupancy } from '@/actions/production-manager'

// Utils
import { cn } from '@/lib/utils'
import { dayOff, effectiveHours, toMinutes } from '../forecast'

// Third-party
import { useQuery } from '@tanstack/react-query'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const iso = (date: Date) => date.toISOString().slice(0, 10)

/** A segunda-feira da semana de hoje, mais n semanas. */
const mondayOf = (weeks: number) => {
  const today = new Date()
  const utc = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  )
  const shift = (utc.getUTCDay() + 6) % 7
  utc.setUTCDate(utc.getUTCDate() - shift + weeks * 7)
  return utc
}

const hm = (minutes: number) => {
  const value = Math.max(0, Math.round(minutes))
  const h = Math.floor(value / 60)
  const m = value % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

const shortDate = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`

type Level = 'free' | 'busy' | 'full' | 'off'

const LEVEL: Record<Level, string> = {
  free: 'bg-success-100 border-success-200 text-success-800',
  busy: 'bg-warning-100 border-warning-200 text-warning-800',
  full: 'bg-error-100 border-error-200 text-error-800',
  off: 'bg-gray-100 border-gray-200 text-gray',
}

export function OccupancyMap({
  linkToSector = true,
}: {
  linkToSector?: boolean
}) {
  const [week, setWeek] = useState(0)
  const monday = mondayOf(week)
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setUTCDate(monday.getUTCDate() + index)
    return iso(date)
  })
  const from = days[0]
  const to = days[6]

  const { data, isLoading } = useQuery({
    queryKey: ['production-occupancy', from, to],
    queryFn: () => getOccupancy({ from, to }),
    staleTime: 60 * 1000,
  })
  const occupancy = data?.data

  const used = new Map(
    (occupancy?.days || []).map((row) => [`${row.managerId}:${row.date}`, row]),
  )

  /** Os minutos de trabalho do setor no dia: o expediente sem o intervalo. */
  const capacityOf = (
    hours: NonNullable<typeof occupancy>['managers'][number]['hours'],
    day: string,
  ) => {
    if (!occupancy || dayOff(day, occupancy.calendar)) return 0
    const effective = effectiveHours(hours, occupancy.calendar)
    const start = toMinutes(effective.workStart || '08:00')
    const end = toMinutes(effective.workEnd || '18:00')
    const pause =
      !effective.runsThroughBreak && effective.breakStart && effective.breakEnd
        ? Math.max(
            toMinutes(effective.breakEnd) - toMinutes(effective.breakStart),
            0,
          )
        : 0
    return Math.max(end - start - pause, 0)
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-gray-800">Ocupação dos setores</p>
            <p className="text-sm text-gray">
              Para saber para quando dá para agendar ou prometer um serviço.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="neutralOutline"
              size="sm"
              aria-label="Semana anterior"
              onClick={() => setWeek((value) => value - 1)}
            >
              <Icon icon={IconChevronLeft} size="md" />
            </Button>
            <span className="min-w-32 text-center text-sm text-gray-800">
              {shortDate(from)} a {shortDate(to)}
            </span>
            <Button
              type="button"
              variant="neutralOutline"
              size="sm"
              aria-label="Próxima semana"
              onClick={() => setWeek((value) => value + 1)}
            >
              <Icon icon={IconChevronRight} size="md" />
            </Button>
            {week !== 0 && (
              <Button
                type="button"
                variant="neutralOutline"
                size="sm"
                onClick={() => setWeek(0)}
              >
                Esta semana
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !occupancy ? (
          <p className="text-sm text-gray">
            {data?.message || 'Não foi possível ler a ocupação.'}
          </p>
        ) : !occupancy.managers.length ? (
          <p className="text-sm text-gray">
            Nenhum gerenciador ativo. Crie um por setor em Configurações ›
            Produção.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="w-48 text-left text-xs font-medium text-gray">
                    Setor
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="text-center text-xs font-medium text-gray"
                    >
                      {WEEKDAYS[new Date(`${day}T12:00:00Z`).getUTCDay()]}{' '}
                      {shortDate(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {occupancy.managers.map((manager) => (
                  <tr key={manager.id}>
                    <td className="pr-2">
                      <div className="flex items-center gap-2">
                        <SectorIcon
                          name={manager.sector?.name || manager.name}
                          size="sm"
                        />
                        <span className="truncate text-sm text-gray-800">
                          {manager.name}
                        </span>
                      </div>
                    </td>
                    {days.map((day) => {
                      const row = used.get(`${manager.id}:${day}`)
                      const minutes = row?.minutes || 0
                      const capacity = capacityOf(manager.hours, day)
                      const off = !!dayOff(day, occupancy.calendar)
                      const level: Level =
                        off && !minutes
                          ? 'off'
                          : !capacity || minutes > capacity
                            ? 'full'
                            : minutes >= capacity * 0.8
                              ? 'busy'
                              : 'free'
                      const detail = off
                        ? `${manager.name}, ${shortDate(day)}: ${
                            dayOff(day, occupancy.calendar) === 'HOLIDAY'
                              ? 'feriado'
                              : 'sem expediente'
                          }${minutes ? `, com ${hm(minutes)} agendadas` : ''}`
                        : `${manager.name}, ${shortDate(day)}: ${hm(minutes)} de ${hm(
                            capacity,
                          )}, ${
                            minutes > capacity
                              ? `passa ${hm(minutes - capacity)}`
                              : `sobram ${hm(capacity - minutes)}`
                          }`
                      const cell = (
                        <div
                          title={detail}
                          aria-label={detail}
                          className={cn(
                            'flex h-10 items-center justify-center rounded-md border text-xs',
                            LEVEL[level],
                          )}
                        >
                          {level === 'off'
                            ? ''
                            : capacity
                              ? `${Math.round((minutes / capacity) * 100)}%`
                              : hm(minutes)}
                        </div>
                      )
                      return (
                        <td key={day}>
                          {linkToSector ? (
                            <Link
                              href={`/producao/gerenciador/${manager.id}`}
                              className="block transition-opacity hover:opacity-80"
                            >
                              {cell}
                            </Link>
                          ) : (
                            cell
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray">
              {(
                [
                  ['free', 'Tem espaço'],
                  ['busy', 'Acima de 80%'],
                  ['full', 'Lotado'],
                  ['off', 'Feriado ou sem expediente'],
                ] as [Level, string][]
              ).map(([level, label]) => (
                <span key={level} className="flex items-center gap-1.5">
                  <span
                    className={cn('size-3 rounded-sm border', LEVEL[level])}
                  />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
