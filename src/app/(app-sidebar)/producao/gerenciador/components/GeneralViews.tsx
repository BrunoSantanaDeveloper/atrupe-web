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
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { SectorIcon } from '@/components/common/SectorIcon'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { TaskView } from '../manager'

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

export function AgendaView({
  scheduled,
  unscheduled,
  card,
}: {
  scheduled: TaskView[]
  unscheduled: TaskView[]
  card: (item: TaskView) => JSX.Element
}) {
  const days = Array.from(new Set(scheduled.map((task) => task.schedule!.date)))
  const alerts = scheduled.filter((task) => task.alert).length
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
      {days.map((day) => (
        <Card key={day}>
          <CardHeader>
            <CardTitle className="capitalize">{dayLabel(day)}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-3">
            {scheduled
              .filter((task) => task.schedule!.date === day)
              .map((task) => (
                <div key={task.id} className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">
                    {task.schedule!.start} –{' '}
                    {endTime(task.schedule!.start, task.schedule!.minutes)}
                    {task.machine ? ` · ${task.machine}` : ''}
                    {task.vehicleId ? ' · com veículo' : ''}
                  </p>
                  {card(task)}
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
      {!days.length && (
        <p className="text-sm text-gray">Nada agendado neste período.</p>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon
              icon={IconAlertTriangle}
              size="sm"
              className="text-warning-600"
            />
            Tarefas não agendadas
            <span className="font-normal text-gray">
              ({unscheduled.length})
            </span>
          </CardTitle>
          <CardDescription>
            Abra a tarefa para agendar: dia, início e duração. O preparo ocupa a
            máquina junto com a produção.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 px-6 pb-6 md:grid-cols-2 xl:grid-cols-3">
          {unscheduled.map((task) => (
            <div key={task.id}>{card(task)}</div>
          ))}
          {!unscheduled.length && (
            <p className="text-sm text-gray">Tudo agendado.</p>
          )}
        </CardContent>
      </Card>
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
  const overlaps = (a: TaskView, b: TaskView) => {
    const startA = toMinutes(a.schedule!.start)
    const endA = startA + a.schedule!.minutes
    const startB = toMinutes(b.schedule!.start)
    const endB = startB + b.schedule!.minutes
    return startA < endB && startB < endA
  }
  return (
    <div className="space-y-4">
      {!vehicles.length && (
        <p className="text-sm text-gray">
          Nenhum veículo cadastrado. Cadastre em Configurações › Produção ›
          Veículos.
        </p>
      )}
      {vehicles.map((vehicle) => {
        const own = withVehicle.filter((task) => task.vehicleId === vehicle.id)
        const km = own.reduce((sum, task) => sum + (task.km || 0), 0)
        return (
          <Card key={vehicle.id}>
            <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
              <div className="flex items-center gap-3">
                <SectorIcon name="Frota" size="lg" />
                <div>
                  <CardTitle>{vehicle.name}</CardTitle>
                  <CardDescription>
                    {vehicle.plate} · {own.length} saída(s) · {km} km previstos
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-6 pb-6">
              {days.map((day) => {
                const inDay = own.filter((task) => task.schedule!.date === day)
                if (!inDay.length) return null
                return (
                  <div key={day} className="space-y-1">
                    <p className="text-sm font-medium capitalize text-gray-800">
                      {dayLabel(day)}
                    </p>
                    {inDay.map((task) => {
                      const conflict = inDay.some(
                        (other) =>
                          other.id !== task.id && overlaps(task, other),
                      )
                      return (
                        <button
                          key={task.id}
                          type="button"
                          onClick={() => onOpen(task.id)}
                          className={cn(
                            'flex w-full flex-wrap items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm hover:border-brand-300',
                            conflict
                              ? 'border-error-300 bg-error-50'
                              : 'border-gray-200 bg-white',
                          )}
                        >
                          <span className="font-medium text-gray-800">
                            {task.schedule!.start} –{' '}
                            {endTime(
                              task.schedule!.start,
                              task.schedule!.minutes,
                            )}
                          </span>
                          <SectorIcon name={task.sector} size="sm" />
                          <span className="text-gray-800">
                            {task.stageName} · {task.itemName}
                          </span>
                          <span className="text-gray">
                            {task.project.client}
                            {task.km ? ` · ${task.km} km` : ''}
                          </span>
                          {conflict && (
                            <Badge variant="errorLight">
                              Duas saídas no mesmo horário
                            </Badge>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
              {!own.length && (
                <p className="text-sm text-gray">
                  Sem saídas agendadas neste período.
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
      <p className="text-xs text-gray">
        O veículo entra na tarefa de instalação ou entrega, pelo detalhe da
        tarefa: veículo, km previstos e horário. O km é custo de deslocamento,
        não tempo de trabalho (MO-2).
      </p>
    </div>
  )
}
