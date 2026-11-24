'use server'

// Veículos, fase 1 (Maicol, 23/11/2026, ELITE): as saídas com as paradas,
// o pedido de veículo e quem estava com o veículo, pela API
// (/production/trip). Num arquivo "use server" só se exportam funções
// assíncronas: os tipos ficam em producao/veiculos/types.ts.

import { getItem, createItemNew } from '@/actions/_cruds'

import type {
  Trip,
  TripOverview,
  TripStopInput,
} from '@/app/(app-sidebar)/producao/veiculos/types'

type ApiResult = {
  success: boolean
  message?: string
  data?: unknown
}

const result = <T>(res: ApiResult, done: string) =>
  res.success
    ? { success: true, data: res.data as T, message: done }
    : { success: false, data: null, message: res.message || 'Não deu certo' }

export const getTrips = async (from: string, to: string) =>
  result<TripOverview>(
    await getItem({ route: '/production/trip', params: { from, to } }),
    '',
  )

export const createTrip = async (values: {
  vehicleId: string
  driverId?: string
  teamIds?: string[]
  departAt: string
  returnAt: string
  note?: string
  stops: TripStopInput[]
  requestIds?: string[]
}) =>
  result<Trip>(
    await createItemNew({ route: '/production/trip', data: values }),
    'Saída agendada',
  )

export const startTrip = async (id: string, odometerStart?: number) =>
  result<Trip>(
    await createItemNew({
      route: `/production/trip/${id}/start`,
      data: odometerStart !== undefined ? { odometerStart } : {},
    }),
    'Saída em rota',
  )

export const setStopResult = async (
  id: string,
  stopId: string,
  values: { status: 'DONE' | 'NOT_DONE'; reason?: string },
) =>
  result<Trip>(
    await createItemNew({
      route: `/production/trip/${id}/stop/${stopId}`,
      data: values,
    }),
    'Parada registrada',
  )

export const closeTrip = async (
  id: string,
  values: {
    odometerEnd?: number
    km?: number
    allocations?: { stopId: string; km: number }[]
    stops?: { stopId: string; status: 'DONE' | 'NOT_DONE'; reason?: string }[]
  },
) =>
  result<Trip>(
    await createItemNew({
      route: `/production/trip/${id}/close`,
      data: values,
    }),
    'Saída fechada',
  )

export const cancelTrip = async (id: string, reason: string) =>
  result<Trip>(
    await createItemNew({
      route: `/production/trip/${id}/cancel`,
      data: { reason },
    }),
    'Saída cancelada',
  )

export const requestVehicle = async (values: {
  reason: string
  destination?: string
  date: string
  sectorId?: string
}) =>
  result<unknown>(
    await createItemNew({ route: '/production/trip/request', data: values }),
    'Pedido enviado',
  )

export const cancelVehicleRequest = async (id: string) =>
  result<unknown>(
    await createItemNew({ route: `/production/trip/request/${id}/cancel` }),
    'Pedido cancelado',
  )

export const whoWasDriving = async (plate: string, at: string) =>
  result<{
    vehicle: { id: string; name: string; plate: string }
    trip: Trip | null
  }>(
    await getItem({ route: '/production/trip/who-was', params: { plate, at } }),
    '',
  )
