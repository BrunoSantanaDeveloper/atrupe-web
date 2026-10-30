'use client'

// O cartão da tarefa, o mesmo no quadro, na fila do dia, na agenda e nos
// veículos: imagem do item, trabalho, cliente, prazo, previsto × apontado,
// a pessoa e o alerta de risco (GP-39, GP-42). No coletivo recebe o
// colaborador arrastado; na fila do dia leva os botões do relógio.

// React
import type { ReactNode } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'

// Components
import { PersonAvatar } from './PersonAvatar'
import { SectorIcon } from '@/components/common/SectorIcon'
import { duration, taskStatusBadge } from './TaskDetailDialog'

// Types
import type { TaskView } from '../manager'

// Hooks
import { useSectorColor } from '@/hooks/useSectorColor'

// Utils
import { cn } from '@/lib/utils'
import { shortDate } from './shared'

// Icons
import {
  IconLock,
  IconTruck,
  IconPaperclip,
  IconAlertTriangle,
} from '@tabler/icons-react'

export function TaskCard({
  item,
  showSector = false,
  onOpen,
  droppable = false,
  dragging = null,
  onDrop,
  actions,
  timeless = false,
}: {
  item: TaskView
  showSector?: boolean
  onOpen: (id: string) => void
  // No coletivo, o cartão aceita o colaborador arrastado (GP-43)
  droppable?: boolean
  dragging?: string | null
  onDrop?: (item: TaskView) => void
  // Os botões da fila do dia (relógio e ações), abaixo do cartão
  actions?: ReactNode
  // Sem controle de tempo (GP-47): só o previsto, sem o apontado
  timeless?: boolean
}) {
  const colorOf = useSectorColor()
  const badge = taskStatusBadge(item)
  const color = colorOf(item.sector)
  const open = item.status !== 'DONE' && item.status !== 'CANCELED'
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item.id)}
      onKeyDown={(event) => event.key === 'Enter' && onOpen(item.id)}
      onDragOver={(event) => droppable && open && event.preventDefault()}
      onDrop={() => onDrop?.(item)}
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg border bg-white p-3 text-left transition hover:border-brand-300 hover:shadow-sm',
        dragging && !item.blocked && open
          ? 'border-dashed border-brand-400 bg-brand-25'
          : 'border-gray-200',
        item.alert && 'border-l-4',
      )}
      style={item.alert ? { borderLeftColor: '#D92D20' } : undefined}
    >
      {item.itemImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.itemImage}
          alt={item.itemName}
          className="size-14 shrink-0 rounded-lg border object-cover"
          style={{ borderColor: `${color}66` }}
        />
      ) : (
        <SectorIcon name={item.sector} size="lg" className="size-14" />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2">
          <p className="truncate text-sm font-medium text-gray-900">
            {item.stageName}
            {showSector && (
              <span className="font-normal text-gray"> · {item.sector}</span>
            )}
          </p>
          <span className="font-mono text-xs text-gray">{item.code}</span>
        </div>
        <p className="truncate text-xs text-gray-700">{item.itemName}</p>
        <p className="truncate text-xs text-gray">
          {item.project.client} · {item.project.number} · entrega{' '}
          {shortDate(item.project.due)}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={badge.variant} size="sm">
            {badge.text}
          </Badge>
          <span className="text-xs text-gray-700">
            {duration(item.estimatedMinutes)} previsto
            {!timeless && ` · ${duration(item.actualMinutes)} apontado`}
          </span>
          {item.schedule && (
            <span className="text-xs text-gray">
              {shortDate(item.schedule.date)} {item.schedule.start}
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
          {item.vehicleId && (
            <Icon
              icon={IconTruck}
              size="sm"
              label="Com veículo"
              className="text-gray"
            />
          )}
          {item.blocked && item.status === 'NOT_STARTED' && (
            <Icon
              icon={IconLock}
              size="sm"
              label="Bloqueada"
              className="text-gray"
            />
          )}
        </div>
        {(item.workers.length > 0 || item.assignee) && (
          <p className="flex items-center gap-1.5 text-xs text-gray-700">
            {/* As iniciais de quem está na tarefa (ou da pessoa atribuída),
                na cor da pessoa: o mesmo avatar da coluna Colaboradores */}
            <span className="flex -space-x-1.5">
              {(item.workers.length ? item.workers : [item.assignee!]).map(
                (person) => (
                  <PersonAvatar
                    key={person.id}
                    name={person.name}
                    size="sm"
                    className="ring-2 ring-white"
                  />
                ),
              )}
            </span>
            {item.workers.length
              ? `${item.workers.map((worker) => worker.name).join(', ')} na tarefa`
              : item.assignee?.name}
          </p>
        )}
        {item.alert && (
          <p className="flex items-start gap-1 text-xs text-error-700">
            <Icon
              icon={IconAlertTriangle}
              size="sm"
              className="mt-0.5 shrink-0"
            />
            {item.alert.kind === 'OVERDUE'
              ? 'Passou do horário planejado'
              : item.alert.kind === 'LATE_PREDECESSOR'
                ? 'Etapa anterior atrasou'
                : 'Entrega em risco'}
          </p>
        )}
        {actions && (
          <div
            className="flex flex-wrap items-center gap-2 pt-1"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            role="presentation"
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
