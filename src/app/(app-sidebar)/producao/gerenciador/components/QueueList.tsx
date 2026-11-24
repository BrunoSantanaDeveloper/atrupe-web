'use client'

// A fila em lista (GP-48 itens 1 a 3, 6, 7 e 12): uma linha por trabalho,
// para o setor com muitos trabalhos por dia (a impressão tem em média 20).
// Arte, previsão, cliente e O.S., máquina e qualidade, quantidade e medida,
// tempo, situação, sinais e ações. Clicar na linha abre a janela da tarefa.
// Arrastar dentro do mesmo dia e da mesma máquina troca a ordem: os
// horários ficam no lugar e os trabalhos trocam de vaga.
// No gerenciador coletivo (arrastar colaborador), soltar a pessoa na linha
// liga o relógio dela no trabalho (Maicol, 24/11/2026: todos os
// gerenciadores em lista, como no legado; o Quadro saiu).

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
import { blocksOf, type TaskBlock, type TaskView } from '../manager'
import {
  excess,
  forecastKey,
  hhmm,
  remainingOf,
  type Forecast,
} from '../forecast'

// Utils
import { cn } from '@/lib/utils'
import { shortDate } from './shared'

// Icons
import {
  IconLock,
  IconLockOpen,
  IconHourglass,
  IconMessage,
  IconGripVertical,
  IconPaperclip,
  IconAlertTriangle,
} from '@tabler/icons-react'

// A linha da lista: a tarefa e, no grupo de um dia, o bloco de agenda dela
// naquele dia (GP-52). A tarefa dividida tem uma linha em cada dia
export type QueueRow = TaskView & { block?: TaskBlock }

// A linha é do bloco 1 (ou não tem bloco): o horário, o cadeado e o arrastar
// são os do agendamento da tarefa
const isFirstBlock = (row: QueueRow) => !row.block || row.block.slotId === null

/**
 * O selo da linha que não é do bloco 1 (GP-52), com os termos da janela da
 * tarefa (TaskSlots): "Bloco 2" ou "Extra".
 */
export function BlockBadge({
  task,
  block,
}: {
  task: TaskView
  block?: TaskBlock
}) {
  if (!block || block.slotId === null) return null
  // O número como TaskSlots conta: a posição em slots, depois do bloco 1
  const index = (task.slots || []).findIndex((slot) => slot.id === block.slotId)
  const number =
    index >= 0
      ? index + 2
      : blocksOf(task).findIndex((item) => item.slotId === block.slotId) + 1
  return (
    <Badge
      variant={block.kind === 'EXTRA' ? 'warningLight' : 'neutralLight'}
      size="sm"
      className="shrink-0"
    >
      {block.kind === 'EXTRA' ? 'Extra' : `Bloco ${number}`}
    </Badge>
  )
}

export type QueueGroup = {
  key: string
  title: string
  hint?: string
  // O total de horas do dia (GP-48 item 3)
  minutes?: number
  tasks: QueueRow[]
  // Só o dia agendado aceita arrastar para trocar a ordem
  sortable?: boolean
  // Feriado ou dia sem expediente: o título e o aviso em vermelho (GP-49)
  alert?: boolean
}

const COLUMNS =
  'grid grid-cols-[28px_48px_minmax(96px,0.8fr)_minmax(140px,1.6fr)_minmax(120px,1.2fr)_minmax(110px,1fr)_88px_minmax(110px,0.9fr)_minmax(150px,auto)] items-center gap-3'

const NO_FORECASTS = new Map<string, Forecast>()
const NO_SELECTION = new Set<string>()

export function QueueList({
  groups,
  forecasts = NO_FORECASTS,
  selected = NO_SELECTION,
  onSelect,
  onOpen,
  actions,
  showSector = false,
  onLock,
  onReorder,
  showForecast = true,
  person = null,
  onDropPerson,
}: {
  groups: QueueGroup[]
  forecasts?: Map<string, Forecast>
  // Sem onSelect, a linha não tem a caixa de seleção (a Agenda viva)
  selected?: Set<string>
  onSelect?: (id: string, checked: boolean) => void
  onOpen: (id: string) => void
  actions?: (item: TaskView) => ReactNode
  // A Agenda viva junta todos os setores: o setor vai na linha
  showSector?: boolean
  // O cadeado na agenda (24/11/2026): travar ou destravar o trabalho
  onLock?: (item: TaskView) => void
  onReorder?: (dragged: TaskView, target: TaskView) => void
  showForecast?: boolean
  // A pessoa que está sendo arrastada do painel de colaboradores
  person?: string | null
  onDropPerson?: (item: TaskView) => void
}) {
  const [dragging, setDragging] = useState<TaskView | null>(null)

  // Troca só no mesmo dia e na mesma máquina (GP-48 item 6). A troca mexe no
  // agendamento da tarefa: só entre linhas do bloco 1 (GP-52)
  const canSwap = (target: QueueRow) =>
    !!dragging &&
    isFirstBlock(target) &&
    dragging.id !== target.id &&
    dragging.schedule?.date === target.schedule?.date &&
    (dragging.machine || '') === (target.machine || '')

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <div className="min-w-[1020px]">
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
              // A previsão da linha é a do próprio bloco (GP-52): o bloco 2
              // em outro dia mostra o horário dele; o cadeado é da tarefa
              const forecast = forecasts.get(forecastKey(item.id, item.block))
              const badge = taskStatusBadge(item)
              const swap = group.sortable && canSwap(item)
              const sortable =
                !!group.sortable && !!onReorder && isFirstBlock(item)
              // A tarefa dividida: a linha mostra os minutos do bloco do dia
              const split = !!item.block && blocksOf(item).length > 1
              const takesPerson =
                !!person &&
                !!onDropPerson &&
                item.status !== 'DONE' &&
                item.status !== 'CANCELED'
              return (
                <div
                  key={
                    item.block?.slotId
                      ? `${item.id}:${item.block.slotId}`
                      : item.id
                  }
                  role="button"
                  tabIndex={0}
                  draggable={sortable}
                  onDragStart={() => setDragging(item)}
                  onDragEnd={() => setDragging(null)}
                  onDragOver={(event) =>
                    (swap || takesPerson) && event.preventDefault()
                  }
                  onDrop={() => {
                    if (takesPerson) onDropPerson?.(item)
                    else if (dragging && swap) onReorder?.(dragging, item)
                    setDragging(null)
                  }}
                  onClick={() => onOpen(item.id)}
                  onKeyDown={(event) =>
                    event.key === 'Enter' && onOpen(item.id)
                  }
                  className={cn(
                    COLUMNS,
                    'cursor-pointer border-b border-gray-100 px-4 py-3 text-sm transition last:border-b-0 hover:bg-gray-25',
                    (swap || takesPerson) &&
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
                    {sortable && (
                      <Icon
                        icon={IconGripVertical}
                        size="sm"
                        label="Arraste para trocar a ordem"
                        className="cursor-grab text-gray-400"
                      />
                    )}
                    {onSelect && (
                      <Checkbox
                        aria-label={`Selecionar ${item.code}`}
                        checked={selected.has(item.id)}
                        onCheckedChange={(checked) =>
                          onSelect(item.id, checked === true)
                        }
                      />
                    )}
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

                  <div className="flex items-start gap-1.5">
                    {item.schedule && item.status === 'NOT_STARTED' && (
                      <button
                        type="button"
                        disabled={!onLock}
                        aria-label={
                          item.locked
                            ? 'Travada na agenda: clique para destravar'
                            : 'Travar na agenda'
                        }
                        title={
                          item.locked
                            ? 'Travada na agenda: a agenda viva não adianta nem atrasa'
                            : 'Travar na agenda'
                        }
                        onClick={(event) => {
                          event.stopPropagation()
                          onLock?.(item)
                        }}
                        className={cn(
                          'mt-0.5 rounded p-0.5 disabled:cursor-default',
                          item.locked
                            ? 'text-brand-600'
                            : 'text-gray-300 hover:text-gray-600',
                          !onLock && !item.locked && 'hidden',
                        )}
                      >
                        <Icon
                          icon={item.locked ? IconLock : IconLockOpen}
                          size="sm"
                        />
                      </button>
                    )}
                    <ForecastCell
                      item={item}
                      forecast={showForecast ? forecast : undefined}
                    />
                  </div>

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
                    <p className="flex items-center gap-1.5 truncate text-gray-800">
                      {showSector && (
                        <SectorIcon name={item.sector} size="sm" />
                      )}
                      <span className="truncate">
                        {showSector ? `${item.stageName} · ` : ''}
                        {item.machine ||
                          (showSector ? item.sector : item.stageName)}
                      </span>
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
                      {duration(
                        split && item.block
                          ? item.block.minutes
                          : item.estimatedMinutes,
                      )}
                    </p>
                    {split && (
                      <p className="text-gray">
                        vendido {duration(item.estimatedMinutes)}
                      </p>
                    )}
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
                    <BlockBadge task={item} block={item.block} />
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
                        icon={IconHourglass}
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
                    {actions?.(item)}
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
