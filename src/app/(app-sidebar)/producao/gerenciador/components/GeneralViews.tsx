'use client'

// As visões gerais, de todos os setores (GP-45/GP-46): a Agenda viva (§4.8),
// por dia, com horário, duração e a cadeia avisando; e os Veículos (VS-7),
// a ocupação da frota por dia. Sem reagendamento automático: quem reagenda
// abre a tarefa (§12.2). Também os filtros que toda tela da produção usa.

// UI
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'

// Components
import { SectorIcon } from '@/components/common/SectorIcon'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { TaskView } from '../manager'
import { QueueList, type QueueGroup } from './QueueList'

// Utils
import { cn } from '@/lib/utils'
import { dayLabel, endTime, periodOptions, type Period } from './shared'

// Icons
import { IconSearch, IconAlertTriangle } from '@tabler/icons-react'

export function ProductionFilters({
  search,
  onSearch,
  person,
  onPerson,
  people,
  machine,
  onMachine,
  machines,
  period,
  onPeriod,
}: {
  search: string
  onSearch: (value: string) => void
  person?: string
  onPerson?: (value: string) => void
  people?: { id: string; name: string }[]
  // A fila por máquina (GP-47, item 4): só quando o setor tem máquinas
  machine?: string
  onMachine?: (value: string) => void
  machines?: string[]
  period: Period
  onPeriod: (value: Period) => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-end gap-3 p-4">
        <Input
          aria-label="Buscar tarefa"
          placeholder="Código, cliente, item"
          className="w-full sm:w-[240px]"
          startAdornment={
            <Icon icon={IconSearch} size="sm" className="text-gray" />
          }
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
        {people && onPerson && (
          <SelectBasic
            name="board-person"
            label=""
            className="w-[200px]"
            options={[
              { value: 'todos', label: 'Todas as pessoas' },
              ...people.map((item) => ({ value: item.id, label: item.name })),
            ]}
            value={person}
            onChange={(value) => value && onPerson(String(value))}
          />
        )}
        {machines && machines.length > 0 && onMachine && (
          <SelectBasic
            name="board-machine"
            label=""
            className="w-[200px]"
            options={[
              { value: 'todas', label: 'Todas as máquinas' },
              ...machines.map((item) => ({ value: item, label: item })),
            ]}
            value={machine}
            onChange={(value) => value && onMachine(String(value))}
          />
        )}
        <Tabs
          value={period}
          variant="pill"
          onValueChange={(value) => onPeriod(value as Period)}
        >
          <TabsList>
            {periodOptions.map((option) => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// A Agenda viva em lista (Maicol, 24/11/2026: todos os gerenciadores em
// lista, como no legado): um grupo por dia, com as horas do dia, e as
// tarefas não agendadas no fim. Os setores juntos: o setor vai na linha.
export function AgendaView({
  scheduled,
  unscheduled,
  onOpen,
}: {
  scheduled: TaskView[]
  unscheduled: TaskView[]
  onOpen: (id: string) => void
}) {
  const days = Array.from(new Set(scheduled.map((task) => task.schedule!.date)))
  const alerts = scheduled.filter((task) => task.alert).length
  const groups: QueueGroup[] = [
    ...days.map((day) => {
      const tasks = scheduled.filter((task) => task.schedule!.date === day)
      return {
        key: day,
        title: dayLabel(day),
        minutes: tasks.reduce((sum, task) => sum + task.schedule!.minutes, 0),
        tasks,
      }
    }),
    {
      key: 'sem-agenda',
      title: 'Tarefas não agendadas',
      hint: 'Abra a tarefa para agendar: dia, início e duração. O preparo ocupa a máquina junto com a produção.',
      tasks: unscheduled,
    },
  ]
  return (
    <div className="space-y-4">
      {alerts > 0 && (
        <p className="flex items-start gap-2 rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          <Icon
            icon={IconAlertTriangle}
            size="sm"
            className="mt-0.5 shrink-0"
          />
          {alerts === 1
            ? 'Uma etapa está com alerta na cadeia de produção.'
            : `${alerts} etapas estão com alerta na cadeia de produção.`}{' '}
          O aviso some quando a etapa anterior terminar ou o reagendamento fizer
          a cadeia caber no prazo. Nada é remarcado sozinho.
        </p>
      )}
      {!days.length && (
        <p className="text-sm text-gray">Nada agendado neste período.</p>
      )}
      <QueueList
        groups={groups}
        onOpen={onOpen}
        showSector
        showForecast={false}
      />
    </div>
  )
}

export function VehiclesView({
  vehicles,
  scheduled,
  onOpen,
}: {
  vehicles: { id: string; name: string; plate: string }[]
  scheduled: TaskView[]
  onOpen: (id: string) => void
}) {
  const withVehicle = scheduled.filter((task) => task.vehicleId)
  const days = Array.from(
    new Set(withVehicle.map((task) => task.schedule!.date)),
  )
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
  // Só o dia não tem hora: não acusa conflito de horário
  const overlaps = (a: TaskView, b: TaskView) => {
    if (!a.schedule!.start || !b.schedule!.start) return false
    const startA = toMinutes(a.schedule!.start)
    const endA = startA + a.schedule!.minutes
    const startB = toMinutes(b.schedule!.start)
    const endB = startB + b.schedule!.minutes
    return startA < endB && startB < endA
  }
  // Em lista (24/11/2026: listas, não cartões): um grupo por dia, o veículo
  // na linha; duas saídas do mesmo veículo no mesmo horário ficam em vermelho
  const conflictOf = (task: TaskView) =>
    withVehicle.some(
      (other) =>
        other.id !== task.id &&
        other.vehicleId === task.vehicleId &&
        other.schedule!.date === task.schedule!.date &&
        overlaps(task, other),
    )
  const vehicleOf = (id: string | null) =>
    vehicles.find((vehicle) => vehicle.id === id)
  return (
    <div className="space-y-4">
      {!vehicles.length && (
        <p className="text-sm text-gray">
          Nenhum veículo cadastrado. Cadastre em Configurações › Produção ›
          Veículos.
        </p>
      )}
      {vehicles.length > 0 && !withVehicle.length && (
        <p className="text-sm text-gray">Sem saídas agendadas neste período.</p>
      )}
      {withVehicle.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[110px_minmax(150px,1fr)_minmax(200px,1.4fr)_minmax(150px,1fr)_80px] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs font-medium text-gray">
              <span>Horário</span>
              <span>Veículo</span>
              <span>Etapa e item</span>
              <span>Cliente</span>
              <span>Km</span>
            </div>
            {days.map((day) => {
              const inDay = withVehicle.filter(
                (task) => task.schedule!.date === day,
              )
              const totalKm = inDay.reduce(
                (sum, task) => sum + (task.km || 0),
                0,
              )
              return (
                <section key={day}>
                  <div className="flex items-baseline gap-3 border-b border-gray-100 bg-gray-25 px-4 py-2">
                    <h3 className="text-sm font-semibold capitalize text-gray-900">
                      {dayLabel(day)}
                    </h3>
                    <span className="text-xs text-gray-700">
                      {inDay.length} saída(s) · {totalKm} km previstos
                    </span>
                  </div>
                  {inDay.map((task) => {
                    const conflict = conflictOf(task)
                    const vehicle = vehicleOf(task.vehicleId)
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => onOpen(task.id)}
                        className={cn(
                          'grid w-full grid-cols-[110px_minmax(150px,1fr)_minmax(200px,1.4fr)_minmax(150px,1fr)_80px] items-center gap-3 border-b border-gray-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-gray-25',
                          conflict && 'bg-error-50',
                        )}
                      >
                        <span className="font-medium text-gray-800">
                          {task.schedule!.start
                            ? `${task.schedule!.start} – ${endTime(task.schedule!.start, task.schedule!.minutes)}`
                            : 'Só o dia'}
                        </span>
                        <span className="truncate text-gray-800">
                          {vehicle?.name ?? '—'}
                          {vehicle?.plate ? (
                            <span className="text-gray">
                              {' '}
                              · {vehicle.plate}
                            </span>
                          ) : null}
                          {conflict && (
                            <Badge variant="errorLight" className="ml-2">
                              Duas saídas no mesmo horário
                            </Badge>
                          )}
                        </span>
                        <span className="flex min-w-0 items-center gap-2 text-gray-800">
                          <SectorIcon name={task.sector} size="sm" />
                          <span className="truncate">
                            {task.stageName} · {task.itemName}
                          </span>
                        </span>
                        <span className="truncate text-gray">
                          {task.project.client}
                        </span>
                        <span className="text-gray-700">
                          {task.km ? `${task.km} km` : '—'}
                        </span>
                      </button>
                    )
                  })}
                </section>
              )
            })}
          </div>
        </div>
      )}
      <p className="text-xs text-gray">
        O veículo entra na tarefa de instalação ou entrega, pelo detalhe da
        tarefa: veículo, km previstos e horário. O km é custo de deslocamento,
        não tempo de trabalho (MO-2).
      </p>
    </div>
  )
}
