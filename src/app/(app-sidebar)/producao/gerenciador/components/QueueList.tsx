'use client'

// A fila em lista (GP-48 itens 1 a 3, 6, 7 e 12): uma linha por trabalho,
// para o setor com muitos trabalhos por dia (a impressão tem em média 20).
// Arte, previsão, cliente e O.S., máquina e qualidade, quantidade e medida,
// tempo, situação, sinais e ações. Clicar na linha abre a janela da tarefa.
// Arrastar dentro do mesmo dia e da mesma máquina troca a ordem: os
// horários ficam no lugar e os trabalhos trocam de vaga.

// React
import { useState, type ReactNode } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Checkbox } from '@/components/ui/checkbox'

// Components
import { SectorIcon } from '@/components/common/SectorIcon'
import { duration, taskStatusBadge } from './TaskDetailDialog'

// Types
import type { TaskView } from '../manager'
import { excess, hhmm, remainingOf, type Forecast } from '../forecast'

// Utils
import { cn } from '@/lib/utils'
import { shortDate } from './shared'

// Icons
import {
  IconLock,
  IconMessage,
  IconGripVertical,
  IconPaperclip,
  IconAlertTriangle,
} from '@tabler/icons-react'

export type QueueGroup = {
  key: string
  title: string
  hint?: string
  // O total de horas do dia (GP-48 item 3)
  minutes?: number
  tasks: TaskView[]
  // Só o dia agendado aceita arrastar para trocar a ordem
  sortable?: boolean
  // Feriado ou dia sem expediente: o título e o aviso em vermelho (GP-49)
  alert?: boolean
}

const COLUMNS =
  'grid grid-cols-[28px_48px_minmax(96px,0.8fr)_minmax(160px,1.6fr)_minmax(140px,1.2fr)_minmax(110px,1fr)_88px_minmax(110px,0.9fr)_minmax(150px,auto)] items-center gap-3'

export function QueueList({
  groups,
  forecasts,
  selected,
  onSelect,
  onOpen,
  actions,
  onReorder,
  showForecast = true,
}: {
  groups: QueueGroup[]
  forecasts: Map<string, Forecast>
  selected: Set<string>
  onSelect: (id: string, checked: boolean) => void
  onOpen: (id: string) => void
  actions: (item: TaskView) => ReactNode
  onReorder?: (dragged: TaskView, target: TaskView) => void
  showForecast?: boolean
}) {
  const [dragging, setDragging] = useState<TaskView | null>(null)

  // Troca só no mesmo dia e na mesma máquina (GP-48 item 6)
  const canSwap = (target: TaskView) =>
    !!dragging &&
    dragging.id !== target.id &&
    dragging.schedule?.date === target.schedule?.date &&
    (dragging.machine || '') === (target.machine || '')

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <div className="min-w-[1080px]">
        <div
          className={cn(
            COLUMNS,
            'border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray',
          )}
        >
          <span />
          <span>Arte</span>
          <span>Previsão</span>
          <span>Cliente e O.S.</span>
          <span>Máquina e qualidade</span>
          <span>Quantidade</span>
          <span>Tempo</span>
          <span>Situação</span>
          <span className="text-right">Ações</span>
        </div>

        {groups.map((group) => (
          <section key={group.key}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-gray-100 bg-gray-25 px-4 py-2">
              <h3
                className={cn(
                  'text-sm font-semibold text-gray-900',
                  group.alert && 'text-error-700',
                )}
              >
                {group.title}
                <span className="font-normal text-gray">
                  {' '}
                  ({group.tasks.length})
                </span>
              </h3>
              {group.minutes !== undefined && group.minutes > 0 && (
                <span className="text-xs text-gray-700">
                  {duration(group.minutes)} no dia
                </span>
              )}
              {group.hint && (
                <span
                  className={cn(
                    'text-xs text-gray',
                    group.alert && 'font-medium text-error-700',
                  )}
                >
                  {group.hint}
                </span>
              )}
            </div>

            {group.tasks.map((item) => {
              const forecast = forecasts.get(item.id)
              const badge = taskStatusBadge(item)
              const swap = group.sortable && canSwap(item)
              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  draggable={!!group.sortable && !!onReorder}
                  onDragStart={() => setDragging(item)}
                  onDragEnd={() => setDragging(null)}
                  onDragOver={(event) => swap && event.preventDefault()}
                  onDrop={() => {
                    if (dragging && swap) onReorder?.(dragging, item)
                    setDragging(null)
                  }}
                  onClick={() => onOpen(item.id)}
                  onKeyDown={(event) =>
                    event.key === 'Enter' && onOpen(item.id)
                  }
                  className={cn(
                    COLUMNS,
                    'cursor-pointer border-b border-gray-100 px-4 py-3 text-sm transition last:border-b-0 hover:bg-gray-25',
                    swap &&
                      'bg-brand-25 outline-dashed outline-1 outline-brand-400',
                    selected.has(item.id) && 'bg-brand-25',
                    item.alert && 'border-l-4 border-l-error-600',
                  )}
                >
                  <div
                    className="flex items-center gap-1"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    role="presentation"
                  >
                    {group.sortable && onReorder && (
                      <Icon
                        icon={IconGripVertical}
                        size="sm"
                        label="Arraste para trocar a ordem"
                        className="cursor-grab text-gray-400"
                      />
                    )}
                    <Checkbox
                      aria-label={`Selecionar ${item.code}`}
                      checked={selected.has(item.id)}
                      onCheckedChange={(checked) =>
                        onSelect(item.id, checked === true)
                      }
                    />
                  </div>

                  {item.itemImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.itemImage}
                      alt={item.itemName}
                      className="size-11 rounded-md border border-gray-200 object-cover"
                    />
                  ) : (
                    <SectorIcon
                      name={item.sector}
                      size="lg"
                      className="size-11"
                    />
                  )}

                  <ForecastCell
                    item={item}
                    forecast={showForecast ? forecast : undefined}
                  />

                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900">
                      {item.project.client}
                    </p>
                    <p className="truncate text-xs text-gray">
                      <span className="font-mono">{item.code}</span> · O.S.{' '}
                      {item.project.number} · {item.itemName}
                    </p>
                    <p className="text-xs text-gray">
                      Entrega {shortDate(item.project.due)}
                    </p>
                  </div>

                  <div className="min-w-0 text-xs">
                    <p className="truncate text-gray-800">
                      {item.machine || item.stageName}
                    </p>
                    {item.machineQuality && (
                      <p className="truncate text-gray">
                        {item.machineQuality}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 text-xs text-gray-700">
                    <p className="truncate">{item.measureText}</p>
                  </div>

                  <div className="text-xs">
                    <p className="text-gray-800">
                      {duration(item.estimatedMinutes)}
                    </p>
                    {item.actualMinutes > 0 && (
                      <p className="text-gray">
                        falta {duration(remainingOf(item))}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={badge.variant} size="sm">
                      {badge.text}
                    </Badge>
                    {item.priority === 'URGENT' && (
                      <Badge variant="errorLight" size="sm">
                        Urgente
                      </Badge>
                    )}
                    {!!item.comments && (
                      <span className="flex items-center gap-0.5 text-xs text-gray">
                        <Icon
                          icon={IconMessage}
                          size="sm"
                          label="Comentários"
                        />
                        {item.comments}
                      </span>
                    )}
                    {item.attachments.length > 0 && (
                      <Icon
                        icon={IconPaperclip}
                        size="sm"
                        label="Tem anexos"
                        className="text-gray"
                      />
                    )}
                    {item.blocked && item.status === 'NOT_STARTED' && (
                      <Icon
                        icon={IconLock}
                        size="sm"
                        label={`Espera ${item.blockedBy || 'a etapa anterior'}`}
                        className="text-gray"
                      />
                    )}
                    {item.alert && (
                      <Icon
                        icon={IconAlertTriangle}
                        size="sm"
                        label={
                          item.alert.kind === 'OVERDUE'
                            ? 'Passou do horário planejado'
                            : item.alert.kind === 'LATE_PREDECESSOR'
                              ? 'Etapa anterior atrasou'
                              : 'Entrega em risco'
                        }
                        className="text-error-600"
                      />
                    )}
                  </div>

                  <div
                    className="flex flex-wrap items-center justify-end gap-2"
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                    role="presentation"
                  >
                    {actions(item)}
                  </div>
                </div>
              )
            })}
            {!group.tasks.length && (
              <p className="px-4 py-4 text-sm text-gray">Nada aqui.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

// A previsão: início e fim; o excedente do intervalo em laranja e o do fim
// do dia em vermelho; começar fora do expediente, também (GP-48 item 12)
function ForecastCell({
  item,
  forecast,
}: {
  item: TaskView
  forecast?: Forecast
}) {
  if (!forecast) {
    return (
      <span className="text-xs text-gray">
        {item.schedule?.start ?? (item.schedule ? 'Só o dia' : 'Sem horário')}
      </span>
    )
  }
  return (
    <div className="text-xs leading-5">
      <p
        className={cn(
          'font-medium tabular-nums text-gray-900',
          forecast.outside && 'text-error-700',
        )}
      >
        {hhmm(forecast.start)}–{hhmm(forecast.end)}
      </p>
      <p className="flex flex-wrap gap-x-1.5">
        {forecast.breakExcess > 0 && (
          <span className="font-medium text-warning-700">
            {excess(forecast.breakExcess)} no intervalo
          </span>
        )}
        {forecast.maintenance && (
          <span className="font-medium text-error-700">
            na manutenção ({forecast.maintenance})
          </span>
        )}
        {forecast.offDay && (
          <span className="font-medium text-error-700">
            {forecast.offDay === 'HOLIDAY' ? 'feriado' : 'dia sem expediente'}
          </span>
        )}
        {forecast.dayExcess > 0 && (
          <span className="font-medium text-error-700">
            {excess(forecast.dayExcess)} depois do expediente
          </span>
        )}
        {forecast.delayMinutes > 0 && (
          <span className="text-gray">
            {item.schedule?.start &&
            item.schedule.start !== hhmm(forecast.start)
              ? `era ${item.schedule.start}`
              : `atrasa ${duration(forecast.delayMinutes)}`}
          </span>
        )}
      </p>
    </div>
  )
}
