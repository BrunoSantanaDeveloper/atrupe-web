// Veículos, fase 1 (Maicol, 23/11/2026, ELITE): os tipos da tela.

export type TripStatus = 'SCHEDULED' | 'ON_ROUTE' | 'DONE' | 'CANCELED'
export type StopStatus = 'PENDING' | 'DONE' | 'NOT_DONE'

export type TripStop = {
  id: string
  kind: 'WORK' | 'FREE'
  taskId: string | null
  description: string
  address: string
  sector: string
  plannedKm: number | null
  km: number | null
  status: StopStatus
  reason: string | null
  doneAt: string | null
  doneBy: string | null
}

export type Trip = {
  id: string
  number: number
  status: TripStatus
  vehicle: { id: string; name: string; plate: string }
  driver: { id: string; name: string } | null
  team: { id: string; name: string }[]
  departAt: string
  returnAt: string
  startedAt: string | null
  finishedAt: string | null
  odometerStart: number | null
  odometerEnd: number | null
  km: number | null
  note: string | null
  cancelReason: string | null
  createdBy: string
  closedBy: string | null
  stops: TripStop[]
  overdue?: boolean
}

export type VehicleRequest = {
  id: string
  requestedByName: string
  sectorName: string
  reason: string
  destination: string
  date: string
}

export type PendingTask = {
  id: string
  code: string
  stageName: string
  itemName: string
  km: number | null
  vehicleId: string | null
  scheduleDate: string | null
}

export type TripOverview = {
  trips: Trip[]
  vehicles: { id: string; name: string; plate: string }[]
  requests: VehicleRequest[]
  pending: PendingTask[]
}

export type TripStopInput = {
  kind: 'WORK' | 'FREE'
  taskId?: string
  description?: string
  address?: string
  sectorId?: string
}

export const TRIP_STATUS: Record<
  TripStatus,
  {
    label: string
    variant: 'neutralLight' | 'blueLight' | 'successLight' | 'errorLight'
  }
> = {
  SCHEDULED: { label: 'Agendada', variant: 'neutralLight' },
  ON_ROUTE: { label: 'Em rota', variant: 'blueLight' },
  DONE: { label: 'Fechada', variant: 'successLight' },
  CANCELED: { label: 'Cancelada', variant: 'errorLight' },
}

/** O km da volta repartido pelo previsto (a mesma conta do back). */
export function suggestKm(stops: TripStop[], km: number) {
  const work = stops.filter((stop) => stop.kind === 'WORK')
  const result = new Map<string, number>(stops.map((stop) => [stop.id, 0]))
  if (!work.length || !(km > 0)) return result
  const planned = work.reduce((sum, stop) => sum + (stop.plannedKm || 0), 0)
  let used = 0
  work.forEach((stop, index) => {
    const share =
      index === work.length - 1
        ? Math.round((km - used) * 10) / 10
        : Math.round(
            (planned > 0
              ? (km * (stop.plannedKm || 0)) / planned
              : km / work.length) * 10,
          ) / 10
    used += share
    result.set(stop.id, share)
  })
  return result
}
