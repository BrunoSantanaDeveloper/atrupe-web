'use client'

// Veículos, fase 1 (Maicol, 23/11/2026, ELITE). A saída é sempre a mesma
// (veículo, quem dirige, equipe, partida, volta e km) e a diferença fica nas
// paradas: de trabalho (a tarefa da produção com o veículo reservado, com o
// km previsto) ou livre (banco, cartório, buscar material, levar alguém).
// Qualquer setor pede veículo; quem cuida da frota agenda. O veículo só sai
// de novo depois de fechar a anterior; na volta, o km é repartido pelo
// previsto e quem fecha pode ajustar. "Quem estava com o veículo?" responde
// pela placa, o dia e a hora.

// React
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Topbar } from '@/components/common/Topbar'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import {
  getTrips,
  createTrip,
  startTrip,
  setStopResult,
  closeTrip,
  cancelTrip,
  requestVehicle,
  cancelVehicleRequest,
  whoWasDriving,
} from '@/actions/production-trips'
import { getManagerConfig } from '@/actions/production-manager'

// Hooks
import { useSector } from '@/hooks/queries/useSector'

// Types
import { TRIP_STATUS, suggestKm, type Trip, type TripStopInput } from '../types'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { uploadProductionAttachment } from '@/lib/production-upload'
import { parseTypedNumber } from '@/lib/typed-number'

const SCHEDULE = ['production:vehicle_schedule:edit']

const iso = (date: Date) => date.toISOString().slice(0, 10)
const mondayOf = (weeks: number) => {
  const today = new Date()
  const utc = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  )
  utc.setUTCDate(utc.getUTCDate() - ((utc.getUTCDay() + 6) % 7) + weeks * 7)
  return utc
}
const when = (value: string) =>
  new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
const km = (value: number | null) =>
  value === null
    ? '-'
    : `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`

export function Vehicles() {
  const queryClient = useQueryClient()
  const [week, setWeek] = useState(0)
  const monday = mondayOf(week)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  const from = iso(monday)
  const to = iso(sunday)

  const { data, isLoading } = useQuery({
    queryKey: ['production-trips', from, to],
    queryFn: () => getTrips(from, to),
  })
  const overview = data?.data
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['production-trips'] })

  const [openNew, setOpenNew] = useState(false)
  const [openRequest, setOpenRequest] = useState(false)
  const [tripId, setTripId] = useState<string | null>(null)
  const trip = overview?.trips.find((item) => item.id === tripId) || null

  return (
    <div className="space-y-5">
      <Topbar
        title="Veículos"
        supportText="As saídas, com as paradas de trabalho e as livres."
        secondaryCta={
          <Button variant="neutralOutline" onClick={() => setOpenRequest(true)}>
            Pedir veículo
          </Button>
        }
        primaryCta={
          <PermissionGate permissions={SCHEDULE}>
            <Button onClick={() => setOpenNew(true)}>Nova saída</Button>
          </PermissionGate>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-medium text-gray-800">Saídas da semana</p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="neutralOutline"
                onClick={() => setWeek((value) => value - 1)}
              >
                Semana anterior
              </Button>
              <span className="text-sm text-gray-800">
                {from.split('-').reverse().slice(0, 2).join('/')} a{' '}
                {to.split('-').reverse().slice(0, 2).join('/')}
              </span>
              <Button
                size="sm"
                variant="neutralOutline"
                onClick={() => setWeek((value) => value + 1)}
              >
                Próxima semana
              </Button>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !overview?.vehicles.length ? (
            <p className="text-sm text-gray">
              Nenhum veículo cadastrado. Cadastre em Configurações › Produção ›
              Veículos.
            </p>
          ) : !overview.trips.length ? (
            <p className="text-sm text-gray">Sem saídas na semana.</p>
          ) : (
            // As saídas em lista (24/11/2026: listas, não cartões)
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <div className="min-w-[820px] divide-y divide-gray-100">
                <div className="grid grid-cols-[90px_minmax(160px,1fr)_minmax(200px,1.2fr)_minmax(140px,1fr)_110px_120px] gap-3 bg-gray-50 px-4 py-2 text-xs font-medium text-gray">
                  <span>Saída</span>
                  <span>Veículo</span>
                  <span>Saída → volta</span>
                  <span>Motorista</span>
                  <span>Paradas · km</span>
                  <span>Situação</span>
                </div>
                {[...overview.trips]
                  .sort((a, b) => a.departAt.localeCompare(b.departAt))
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTripId(item.id)}
                      className="grid w-full grid-cols-[90px_minmax(160px,1fr)_minmax(200px,1.2fr)_minmax(140px,1fr)_110px_120px] items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-25"
                    >
                      <span className="font-medium text-gray-900">
                        Nº {item.number}
                      </span>
                      <span className="truncate text-gray-800">
                        {item.vehicle.name}
                        {item.vehicle.plate ? (
                          <span className="text-gray">
                            {' '}
                            · {item.vehicle.plate}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-gray-800">
                        {when(item.departAt)} → {when(item.returnAt)}
                      </span>
                      <span className="truncate text-gray-800">
                        {item.driver ? item.driver.name : 'Sem motorista'}
                      </span>
                      <span className="text-gray-700">
                        {item.stops.length}
                        {item.km !== null ? ` · ${km(item.km)}` : ''}
                      </span>
                      <span className="flex flex-wrap gap-1">
                        <Badge variant={TRIP_STATUS[item.status].variant}>
                          {TRIP_STATUS[item.status].label}
                        </Badge>
                        {item.overdue && (
                          <Badge variant="warningLight">Não fechada</Badge>
                        )}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="font-medium text-gray-800">Precisam de saída</p>
            <p className="text-sm text-gray">
              As tarefas com veículo reservado que ainda não estão numa saída, e
              as paradas não feitas.
            </p>
            {(overview?.pending || []).length ? (
              <ul className="space-y-1 text-sm">
                {overview!.pending.map((task) => (
                  <li key={task.id} className="text-gray-800">
                    {task.code} · {task.stageName} · {task.itemName}
                    <span className="text-gray">
                      {task.km !== null ? ` · previsto ${km(task.km)}` : ''}
                      {task.scheduleDate
                        ? ` · ${task.scheduleDate.split('-').reverse().slice(0, 2).join('/')}`
                        : ''}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray">Nada esperando.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="font-medium text-gray-800">Pedidos de veículo</p>
            {(overview?.requests || []).length ? (
              <ul className="space-y-2 text-sm">
                {overview!.requests.map((request) => (
                  <li
                    key={request.id}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="text-gray-800">
                      {request.reason}
                      <span className="text-gray">
                        {' '}
                        ·{' '}
                        {request.date
                          .split('-')
                          .reverse()
                          .slice(0, 2)
                          .join('/')}{' '}
                        · {request.requestedByName}
                        {request.sectorName ? ` (${request.sectorName})` : ''}
                      </span>
                    </span>
                    <PermissionGate permissions={SCHEDULE}>
                      <button
                        type="button"
                        className="text-xs text-error-700 hover:underline"
                        onClick={async () => {
                          const res = await cancelVehicleRequest(request.id)
                          if (!res.success) return toast.error(res.message)
                          toast.success(res.message)
                          refresh()
                        }}
                      >
                        Cancelar
                      </button>
                    </PermissionGate>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray">Nenhum pedido aberto.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <WhoWas />

      {overview && (
        <NewTripDialog
          open={openNew}
          onOpenChange={setOpenNew}
          overview={overview}
          onDone={refresh}
        />
      )}
      <RequestDialog
        open={openRequest}
        onOpenChange={setOpenRequest}
        onDone={refresh}
      />
      {/* A chave pela saída: cada uma abre limpa, sem o estado da anterior */}
      <TripDialog
        key={trip?.id ?? 'none'}
        trip={trip}
        onOpenChange={(value) => !value && setTripId(null)}
        onDone={refresh}
      />
    </div>
  )
}

/* ------------------------------------------------------------ nova saída */

function NewTripDialog({
  open,
  onOpenChange,
  overview,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  overview: NonNullable<Awaited<ReturnType<typeof getTrips>>['data']>
  onDone: () => void
}) {
  // As pessoas vêm com as saídas (os colaboradores ativos); a configuração
  // da produção fica para a API que ainda não as devolve
  const { data: config } = useQuery({
    queryKey: ['production-config'],
    queryFn: () => getManagerConfig(),
    enabled: open && !overview.people,
  })
  const people = overview.people || config?.data?.collaborators || []
  const { data: sectors } = useSector()
  const [vehicleId, setVehicleId] = useState('')
  const [driverId, setDriverId] = useState('')
  const [team, setTeam] = useState<string[]>([])
  const [departAt, setDepartAt] = useState('')
  const [returnAt, setReturnAt] = useState('')
  const [tasks, setTasks] = useState<string[]>([])
  const [requests, setRequests] = useState<string[]>([])
  const [free, setFree] = useState<TripStopInput[]>([])
  const [freeText, setFreeText] = useState('')
  const [freeAddress, setFreeAddress] = useState('')
  const [freeSector, setFreeSector] = useState('')
  const [saving, setSaving] = useState(false)

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id]

  const close = () => {
    setVehicleId('')
    setDriverId('')
    setTeam([])
    setDepartAt('')
    setReturnAt('')
    setTasks([])
    setRequests([])
    setFree([])
    onOpenChange(false)
  }

  const save = async () => {
    setSaving(true)
    const res = await createTrip({
      vehicleId,
      driverId: driverId || undefined,
      teamIds: team,
      departAt: new Date(departAt).toISOString(),
      returnAt: new Date(returnAt).toISOString(),
      stops: [
        ...tasks.map((taskId) => ({ kind: 'WORK' as const, taskId })),
        ...free,
      ],
      requestIds: requests,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    close()
    onDone()
  }

  const stopsCount = tasks.length + requests.length + free.length

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? null : close())}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Nova saída</DialogTitle>
          <DialogDescription>
            O veículo, quem vai, a partida, a volta e as paradas.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectBasic
              name="trip-vehicle"
              label="Veículo"
              placeholder="Escolher"
              options={overview.vehicles.map((item) => ({
                value: item.id,
                label: `${item.name}${item.plate ? ` · ${item.plate}` : ''}`,
              }))}
              value={vehicleId || undefined}
              onChange={(value) => setVehicleId(String(value))}
            />
            <SelectBasic
              name="trip-driver"
              label="Quem dirige"
              placeholder="Escolher"
              options={people.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
              value={driverId || undefined}
              onChange={(value) => setDriverId(String(value))}
            />
            <div className="space-y-1">
              <Label htmlFor="trip-depart">Partida</Label>
              <Input
                id="trip-depart"
                type="datetime-local"
                value={departAt}
                onChange={(event) => setDepartAt(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="trip-return">Volta</Label>
              <Input
                id="trip-return"
                type="datetime-local"
                value={returnAt}
                onChange={(event) => setReturnAt(event.target.value)}
              />
            </div>
          </div>

          {people.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800">Equipe</p>
              <div className="flex flex-wrap gap-3">
                {people
                  .filter((item) => item.id !== driverId)
                  .map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={team.includes(item.id)}
                        onCheckedChange={() => setTeam(toggle(team, item.id))}
                      />
                      {item.name}
                    </label>
                  ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">
              Paradas de trabalho
            </p>
            {overview.pending.length ? (
              overview.pending.map((task) => (
                <label
                  key={task.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={tasks.includes(task.id)}
                    onCheckedChange={() => setTasks(toggle(tasks, task.id))}
                  />
                  {task.code} · {task.stageName} · {task.itemName}
                  {task.km !== null && (
                    <span className="text-gray">· previsto {km(task.km)}</span>
                  )}
                </label>
              ))
            ) : (
              <p className="text-sm text-gray">
                Nenhuma tarefa com veículo reservado esperando saída.
              </p>
            )}
          </div>

          {overview.requests.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800">
                Pedidos de veículo
              </p>
              {overview.requests.map((request) => (
                <label
                  key={request.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={requests.includes(request.id)}
                    onCheckedChange={() =>
                      setRequests(toggle(requests, request.id))
                    }
                  />
                  {request.reason}
                  <span className="text-gray">· {request.requestedByName}</span>
                </label>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">Parada livre</p>
            {free.map((stop, index) => (
              <p key={index} className="text-sm text-gray-800">
                {stop.description}
                {stop.address ? ` · ${stop.address}` : ''}
              </p>
            ))}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Input
                aria-label="Motivo da parada"
                placeholder="Banco, cartório, buscar material…"
                value={freeText}
                onChange={(event) => setFreeText(event.target.value)}
              />
              <Input
                aria-label="Endereço"
                placeholder="Endereço"
                value={freeAddress}
                onChange={(event) => setFreeAddress(event.target.value)}
              />
              <SelectBasic
                name="trip-free-sector"
                label=""
                placeholder="Setor que pediu"
                options={(sectors || []).map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                value={freeSector || undefined}
                onChange={(value) => setFreeSector(String(value))}
              />
            </div>
            <Button
              type="button"
              size="sm"
              variant="neutralOutline"
              disabled={!freeText.trim()}
              onClick={() => {
                setFree([
                  ...free,
                  {
                    kind: 'FREE',
                    description: freeText.trim(),
                    address: freeAddress.trim() || undefined,
                    sectorId: freeSector || undefined,
                  },
                ])
                setFreeText('')
                setFreeAddress('')
                setFreeSector('')
              }}
            >
              Acrescentar parada livre
            </Button>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="neutralOutline" onClick={close}>
            Cancelar
          </Button>
          <Button
            isLoading={saving}
            disabled={!vehicleId || !departAt || !returnAt || !stopsCount}
            onClick={save}
          >
            Agendar saída
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------- a saída */

/** Por que a saída não fecha (o motivo aparece em CloseIssueText) */
type CloseIssue =
  | 'odometer-invalid'
  | 'odometer-lower'
  | 'km-invalid'
  | 'km-negative'
  | 'allocation'
  | null

function TripDialog({
  trip,
  onOpenChange,
  onDone,
}: {
  trip: Trip | null
  onOpenChange: (open: boolean) => void
  onDone: () => void
}) {
  const [odometer, setOdometer] = useState('')
  const [closing, setClosing] = useState(false)
  const [closeKm, setCloseKm] = useState('')
  const [allocations, setAllocations] = useState<Record<string, string>>({})
  const [results, setResults] = useState<
    Record<string, { status: 'DONE' | 'NOT_DONE'; reason: string }>
  >({})
  const [cancelReason, setCancelReason] = useState('')
  const [busy, setBusy] = useState(false)

  if (!trip) return null

  const run = async (
    action: () => Promise<{ success: boolean; message: string }>,
  ) => {
    setBusy(true)
    const res = await action()
    setBusy(false)
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    setClosing(false)
    onDone()
  }

  // O digitado no costume brasileiro ("45.320" é 45 mil): undefined no
  // vazio, null no que não é número, que a tela recusa com o motivo
  const odometerValue = parseTypedNumber(odometer)
  const closeKmValue = parseTypedNumber(closeKm)
  const allocationOf = (stopId: string) =>
    parseTypedNumber(allocations[stopId] ?? '')
  const withOdometer = trip.odometerStart !== null
  const typed = withOdometer ? odometerValue : closeKmValue
  const rodado =
    typeof typed !== 'number'
      ? null
      : withOdometer
        ? typed - (trip.odometerStart as number)
        : typed
  const suggested = suggestKm(
    trip.stops,
    rodado !== null && rodado > 0 ? rodado : 0,
  )
  // Por que "Fechar a saída" não vai: o motivo aparece embaixo do campo
  const closeIssue: CloseIssue =
    typed === null
      ? withOdometer
        ? 'odometer-invalid'
        : 'km-invalid'
      : rodado !== null && rodado < 0
        ? withOdometer
          ? 'odometer-lower'
          : 'km-negative'
        : trip.stops.some((stop) => {
              const value = allocationOf(stop.id)
              return value === null || (value !== undefined && value < 0)
            })
          ? 'allocation'
          : null
  const open = trip.status === 'SCHEDULED' || trip.status === 'ON_ROUTE'

  return (
    <Dialog open={!!trip} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>
            Saída {trip.number} · {trip.vehicle.name}
          </DialogTitle>
          <DialogDescription>
            {when(trip.departAt)} → {when(trip.returnAt)} ·{' '}
            {TRIP_STATUS[trip.status].label}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-gray-800">
            {trip.driver ? trip.driver.name : 'Sem motorista'}
            {trip.team.length
              ? ` · equipe: ${trip.team.map((item) => item.name).join(', ')}`
              : ''}
          </p>
          {trip.overdue && (
            <p className="text-sm text-warning-700">
              A volta prevista já passou: feche a saída para o veículo sair de
              novo.
            </p>
          )}
          {trip.cancelReason && (
            <p className="text-sm text-error-700">
              Cancelada: {trip.cancelReason}
            </p>
          )}

          <ul className="space-y-2">
            {trip.stops.map((stop) => (
              <li
                key={stop.id}
                className="space-y-1 rounded-md border border-gray-200 px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-gray-800">
                    {stop.kind === 'FREE'
                      ? `Livre · ${stop.description}`
                      : stop.description}
                    {stop.address ? ` · ${stop.address}` : ''}
                  </span>
                  <span className="text-xs text-gray">
                    {stop.plannedKm !== null
                      ? `previsto ${km(stop.plannedKm)}`
                      : ''}
                    {stop.km !== null ? ` · rodou ${km(stop.km)}` : ''}
                  </span>
                </div>
                {stop.status === 'DONE' && (
                  <p className="text-xs text-gray">
                    {stop.doneBy ? `Feita · ${stop.doneBy}` : 'Feita'}
                  </p>
                )}
                {stop.status === 'NOT_DONE' && (
                  <p className="text-xs text-gray">Não feita: {stop.reason}</p>
                )}
                {stop.status === 'PENDING' && (
                  <p className="text-xs text-gray">Por fazer</p>
                )}
                {closing && stop.status === 'PENDING' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <SelectBasic
                      name={`stop-result-${stop.id}`}
                      label=""
                      placeholder="Feita ou não?"
                      options={[
                        { value: 'DONE', label: 'Feita' },
                        { value: 'NOT_DONE', label: 'Não feita' },
                      ]}
                      value={results[stop.id]?.status}
                      onChange={(value) =>
                        setResults({
                          ...results,
                          [stop.id]: {
                            status: value as 'DONE' | 'NOT_DONE',
                            reason: results[stop.id]?.reason || '',
                          },
                        })
                      }
                    />
                    {results[stop.id]?.status === 'NOT_DONE' && (
                      <Input
                        aria-label="Por que não foi feita"
                        placeholder="Cliente ausente, chuva…"
                        value={results[stop.id]?.reason || ''}
                        onChange={(event) =>
                          setResults({
                            ...results,
                            [stop.id]: {
                              status: 'NOT_DONE',
                              reason: event.target.value,
                            },
                          })
                        }
                      />
                    )}
                  </div>
                )}
                {closing && (
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`alloc-${stop.id}`} className="text-xs">
                      Km desta parada
                    </Label>
                    <Input
                      id={`alloc-${stop.id}`}
                      className="h-8 w-28"
                      inputMode="decimal"
                      placeholder={String(suggested.get(stop.id) ?? 0)}
                      value={allocations[stop.id] ?? ''}
                      onChange={(event) =>
                        setAllocations({
                          ...allocations,
                          [stop.id]: event.target.value,
                        })
                      }
                    />
                  </div>
                )}
                {/* O back só conclui parada com a saída em rota (e a de
                    trabalho com a foto enviada depois da saída começar): o
                    botão aparece depois de "Saiu" */}
                {!closing &&
                  open &&
                  stop.status === 'PENDING' &&
                  trip.status === 'ON_ROUTE' && (
                    <StopDone
                      tripId={trip.id}
                      stopId={stop.id}
                      taskId={stop.kind === 'WORK' ? stop.taskId : null}
                      onDone={onDone}
                    />
                  )}
              </li>
            ))}
          </ul>

          {trip.status === 'SCHEDULED' && !closing && (
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="trip-odometer">Odômetro na saída</Label>
                <Input
                  id="trip-odometer"
                  inputMode="decimal"
                  value={odometer}
                  onChange={(event) => setOdometer(event.target.value)}
                />
              </div>
              <Button
                isLoading={busy}
                disabled={
                  odometerValue === null ||
                  (odometerValue !== undefined && odometerValue < 0)
                }
                onClick={() =>
                  run(() =>
                    startTrip(
                      trip.id,
                      typeof odometerValue === 'number'
                        ? odometerValue
                        : undefined,
                    ),
                  )
                }
              >
                Saiu
              </Button>
              {odometerValue === null ? (
                <p className="w-full text-xs text-error-700">
                  O odômetro não é um número. Escreva como 45.320 ou 45320,5.
                </p>
              ) : odometerValue !== undefined && odometerValue < 0 ? (
                <p className="w-full text-xs text-error-700">
                  O odômetro não pode ser negativo.
                </p>
              ) : null}
            </div>
          )}

          {closing && (
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              {trip.odometerStart !== null ? (
                <div className="space-y-1">
                  <Label htmlFor="trip-odometer-end">
                    Odômetro na volta (saiu com {trip.odometerStart})
                  </Label>
                  <Input
                    id="trip-odometer-end"
                    inputMode="decimal"
                    value={odometer}
                    onChange={(event) => setOdometer(event.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <Label htmlFor="trip-km">Km rodado</Label>
                  <Input
                    id="trip-km"
                    inputMode="decimal"
                    value={closeKm}
                    onChange={(event) => setCloseKm(event.target.value)}
                  />
                </div>
              )}
              <p className="text-xs text-gray">
                O km é repartido entre as paradas de trabalho pelo previsto; as
                livres ficam com zero. Ajuste antes de fechar, se precisar.
              </p>
              <CloseIssueText
                issue={closeIssue}
                odometerStart={trip.odometerStart}
              />
            </div>
          )}

          {trip.status === 'SCHEDULED' && (
            <PermissionGate permissions={SCHEDULE}>
              <div className="flex flex-wrap items-end gap-2">
                <Input
                  aria-label="Motivo do cancelamento"
                  placeholder="Motivo do cancelamento"
                  value={cancelReason}
                  onChange={(event) => setCancelReason(event.target.value)}
                />
                <Button
                  variant="neutralOutline"
                  disabled={!cancelReason.trim()}
                  onClick={() => run(() => cancelTrip(trip.id, cancelReason))}
                >
                  Cancelar a saída
                </Button>
              </div>
            </PermissionGate>
          )}
        </DialogBody>
        <DialogFooter>
          {open && (
            <PermissionGate permissions={SCHEDULE}>
              {closing ? (
                <Button
                  isLoading={busy}
                  disabled={typeof typed !== 'number' || !!closeIssue}
                  onClick={() =>
                    run(() =>
                      closeTrip(trip.id, {
                        ...(withOdometer
                          ? { odometerEnd: typed as number }
                          : { km: typed as number }),
                        allocations: Object.keys(allocations).length
                          ? trip.stops.map((stop) => ({
                              stopId: stop.id,
                              km:
                                allocationOf(stop.id) ??
                                suggested.get(stop.id) ??
                                0,
                            }))
                          : undefined,
                        stops: Object.entries(results).map(
                          ([stopId, value]) => ({
                            stopId,
                            status: value.status,
                            reason: value.reason || undefined,
                          }),
                        ),
                      }),
                    )
                  }
                >
                  Fechar a saída
                </Button>
              ) : (
                <Button
                  variant="neutralOutline"
                  onClick={() => {
                    setOdometer('')
                    setCloseKm('')
                    setAllocations({})
                    setResults({})
                    setClosing(true)
                  }}
                >
                  Fechar na volta
                </Button>
              )}
            </PermissionGate>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Por que a saída não fecha: o botão fica desligado e o motivo aparece aqui.
 * Em JSX para a biblioteca de idiomas enxergar os textos (IN-7).
 */
function CloseIssueText({
  issue,
  odometerStart,
}: {
  issue: CloseIssue
  odometerStart: number | null
}) {
  if (!issue) return null
  const start = (odometerStart ?? 0).toLocaleString('pt-BR')
  return (
    <p className="text-xs text-error-700">
      {issue === 'odometer-invalid' ? (
        <>
          O odômetro na volta não é um número. Escreva como 45.320 ou 45320,5.
        </>
      ) : issue === 'odometer-lower' ? (
        <>
          O odômetro na volta é menor que o da saída ({start}). Confira os dois
          números.
        </>
      ) : issue === 'km-invalid' ? (
        <>O km rodado não é um número. Escreva como 120 ou 120,5.</>
      ) : issue === 'km-negative' ? (
        <>O km rodado não pode ser negativo.</>
      ) : (
        <>O km de alguma parada não é um número ou está negativo.</>
      )}
    </p>
  )
}

/* -------------------------------------------------------- pedir veículo */

function RequestDialog({
  open,
  onOpenChange,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone: () => void
}) {
  const { data: sectors } = useSector()
  const [reason, setReason] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [sectorId, setSectorId] = useState('')
  const [saving, setSaving] = useState(false)

  const close = () => {
    setReason('')
    setDestination('')
    setDate('')
    setSectorId('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(value) => (value ? null : close())}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Pedir veículo</DialogTitle>
          <DialogDescription>
            Quem cuida da frota agenda, encaixando numa saída ou criando uma
            nova.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="request-reason">Para quê</Label>
            <Input
              id="request-reason"
              placeholder="Visitar cliente, banco, buscar material…"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="request-destination">Destino</Label>
            <Input
              id="request-destination"
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="request-date">Dia</Label>
            <Input
              id="request-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <SelectBasic
            name="request-sector"
            label="Setor"
            placeholder="Escolher"
            options={(sectors || []).map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            value={sectorId || undefined}
            onChange={(value) => setSectorId(String(value))}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="neutralOutline" onClick={close}>
            Cancelar
          </Button>
          <Button
            isLoading={saving}
            disabled={!reason.trim() || !date}
            onClick={async () => {
              setSaving(true)
              const res = await requestVehicle({
                reason: reason.trim(),
                destination: destination.trim() || undefined,
                date,
                sectorId: sectorId || undefined,
              })
              setSaving(false)
              if (!res.success) return toast.error(res.message)
              toast.success(res.message)
              close()
              onDone()
            }}
          >
            Pedir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------- quem estava com o veículo */

function WhoWas() {
  const [plate, setPlate] = useState('')
  const [at, setAt] = useState('')
  // A resposta: o aviso da API (placa não achada) ou a saída do momento
  const [answer, setAnswer] = useState<
    { message: string } | { vehicleName: string; trip: Trip | null } | null
  >(null)
  const [busy, setBusy] = useState(false)

  return (
    <Card>
      <CardContent className="space-y-3 p-6">
        <p className="font-medium text-gray-800">Quem estava com o veículo?</p>
        <p className="text-sm text-gray">
          Para quando chega uma multa: a placa, o dia e a hora.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="who-plate">Placa</Label>
            <Input
              id="who-plate"
              value={plate}
              onChange={(event) => setPlate(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="who-at">Dia e hora</Label>
            <Input
              id="who-at"
              type="datetime-local"
              value={at}
              onChange={(event) => setAt(event.target.value)}
            />
          </div>
          <Button
            variant="neutralOutline"
            isLoading={busy}
            disabled={!plate.trim() || !at}
            onClick={async () => {
              setBusy(true)
              const res = await whoWasDriving(
                plate.trim(),
                new Date(at).toISOString(),
              )
              setBusy(false)
              if (!res.success || !res.data) {
                setAnswer(
                  res.message
                    ? { message: res.message }
                    : { message: 'Não encontrado' },
                )
                return
              }
              setAnswer({
                vehicleName: res.data.vehicle.name,
                trip: res.data.trip,
              })
            }}
          >
            Consultar
          </Button>
        </div>
        {answer && <WhoWasAnswer answer={answer} />}
      </CardContent>
    </Card>
  )
}

/**
 * A resposta de "Quem estava com o veículo?". Em JSX, com as frases
 * inteiras, para a biblioteca de idiomas enxergar os textos (IN-7).
 */
function WhoWasAnswer({
  answer,
}: {
  answer: { message: string } | { vehicleName: string; trip: Trip | null }
}) {
  if ('message' in answer) {
    return <p className="text-sm text-gray-800">{answer.message}</p>
  }
  const found = answer.trip
  if (!found) {
    return (
      <p className="text-sm text-gray-800">
        Nenhuma saída de {answer.vehicleName} nesse momento.
      </p>
    )
  }
  const start = when(found.startedAt || found.departAt)
  const end = when(found.finishedAt || found.returnAt)
  const team = found.team.map((item) => item.name).join(', ')
  return (
    <div className="space-y-0.5 text-sm">
      <p className="font-medium text-gray-800">
        {found.driver ? found.driver.name : 'Sem motorista registrado'}
      </p>
      <p className="text-gray">
        Saída {found.number}, de {start} a {end}
      </p>
      {team ? <p className="text-gray">Equipe: {team}</p> : null}
    </div>
  )
}

/**
 * A parada feita no caminho. A de trabalho pede a foto do trabalho pronto
 * (Maicol, 23/11/2026): a foto vai para os anexos da tarefa e a parada fica
 * feita; a livre conclui direto.
 */
function StopDone({
  tripId,
  stopId,
  taskId,
  onDone,
}: {
  tripId: string
  stopId: string
  taskId: string | null
  onDone: () => void
}) {
  const { data: session } = useSession()
  const [busy, setBusy] = useState(false)

  const finish = async () => {
    const res = await setStopResult(tripId, stopId, { status: 'DONE' })
    if (!res.success) return toast.error(res.message)
    toast.success(res.message)
    onDone()
  }

  if (!taskId) {
    return (
      <button
        type="button"
        className="text-xs text-brand-700 hover:underline"
        onClick={finish}
      >
        Feita
      </button>
    )
  }
  return (
    <label className="cursor-pointer text-xs text-brand-700 hover:underline">
      {busy ? 'Enviando a foto…' : 'Feita (com a foto)'}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={busy}
        onChange={async (event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file) return
          setBusy(true)
          const sent = await uploadProductionAttachment({
            token: session?.accessToken,
            taskId,
            name: 'Foto do trabalho pronto',
            kind: 'PHOTO',
            file,
          })
          setBusy(false)
          if (!sent.success) return toast.error(sent.message)
          await finish()
        }}
      />
    </label>
  )
}
