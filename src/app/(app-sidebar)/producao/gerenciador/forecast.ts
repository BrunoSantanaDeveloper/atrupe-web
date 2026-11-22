// A previsão da fila (GP-48 itens 4, 5, 8, 12 e 20): o início e o fim de cada
// trabalho agendado, na sequência da máquina. O próximo começa quando o
// anterior termina, mais o intervalo entre tarefas (GP-20). Pura: a tela só
// mostra; nada é gravado.
//
// - Reagenda e avisa (RESCHEDULE): o trabalho que atrasa empurra os
//   seguintes da mesma máquina; a tela mostra o horário novo.
// - Só avisa (WARN): o horário fica o agendado e a tela diz quanto atrasa.
// - Intervalo (almoço): a máquina que segue no intervalo termina o que
//   começou antes dele e mostra o excedente (+h:mm, laranja); o próximo
//   começa no turno seguinte. A equipe para no intervalo: o trabalho que o
//   cruza termina mais tarde.
// - O que começa fora do expediente ou passa do fim do dia fica em vermelho.
// - Feriado e dia sem expediente: a agenda deixa agendar, mas fica em
//   vermelho (GP-49).
// - O gerenciador sem expediente usa o da empresa (GP-49).

import type { LiveSchedule, ManagerHours, TaskView } from './manager'
import type { ProductionCalendar } from '@/actions/production-manager'

// O dia é feriado ou não é de trabalho (GP-49)
export type DayOff = 'HOLIDAY' | 'NO_WORK' | null

export type Forecast = {
  start: number
  end: number
  // RESCHEDULE: quanto o início andou; WARN: quanto o trabalho vai atrasar
  delayMinutes: number
  // Começa fora do expediente (antes do início ou depois do fim)
  outside: boolean
  // O que passa do início do intervalo (máquina que segue sozinha)
  breakExcess: number
  // O que passa do fim do expediente
  dayExcess: number
  // O dia é feriado ou não é de trabalho (GP-49)
  offDay: DayOff
}

const weekdayOf = (day: string) => new Date(`${day}T12:00:00Z`).getUTCDay()

/** O dia fora do expediente da empresa: feriado ou dia sem trabalho. */
export const dayOff = (
  day: string,
  calendar?: Pick<ProductionCalendar, 'workDays' | 'holidays'>,
): DayOff => {
  if (!calendar) return null
  if (calendar.holidays.includes(day)) return 'HOLIDAY'
  if (!calendar.workDays.includes(weekdayOf(day))) return 'NO_WORK'
  return null
}

/** O expediente que vale: o do gerenciador; sem ele, o da empresa. */
export const effectiveHours = (
  hours: ManagerHours,
  calendar?: ProductionCalendar,
): ManagerHours =>
  hours.workStart || !calendar
    ? hours
    : {
        workStart: calendar.startTime,
        workEnd: calendar.endTime,
        breakStart: hours.breakStart || calendar.breakStart,
        breakEnd: hours.breakStart ? hours.breakEnd : calendar.breakEnd,
        runsThroughBreak: hours.runsThroughBreak,
      }

const DEFAULT_START = '08:00'
const DEFAULT_END = '18:00'

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export const hhmm = (minutes: number) => {
  const value = Math.max(0, Math.round(minutes))
  const h = Math.floor(value / 60) % 24
  const m = value % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// "+1:05": o excedente em horas e minutos
export const excess = (minutes: number) => {
  const value = Math.round(minutes)
  return `+${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

/** O tempo que falta: o previsto menos o apontado (o pausado continua). */
export const remainingOf = (task: TaskView) =>
  Math.max(task.estimatedMinutes - (task.actualMinutes || 0), 0)

const machineKey = (task: TaskView) => task.machine || ''

export function forecastQueue(
  tasks: TaskView[],
  options: {
    hours: ManagerHours
    intervalMinutes: number
    liveSchedule: LiveSchedule
    today: string
    // Minutos do dia agora
    nowMinutes: number
    // O expediente da empresa: o padrão e os feriados
    calendar?: ProductionCalendar
  },
): Map<string, Forecast> {
  const { intervalMinutes, liveSchedule, today, nowMinutes, calendar } = options
  const hours = effectiveHours(options.hours, calendar)
  const workStart = toMinutes(hours.workStart || DEFAULT_START)
  const workEnd = toMinutes(hours.workEnd || DEFAULT_END)
  const breakStart = hours.breakStart ? toMinutes(hours.breakStart) : null
  const breakEnd = hours.breakEnd ? toMinutes(hours.breakEnd) : null
  const hasBreak = breakStart !== null && breakEnd !== null
  const result = new Map<string, Forecast>()

  // A máquina ocupada agora: o que está em andamento termina no restante
  const busyUntil = new Map<string, number>()
  for (const task of tasks) {
    if (task.status !== 'IN_PROGRESS') continue
    const end = nowMinutes + remainingOf(task)
    result.set(task.id, {
      start: nowMinutes,
      end,
      delayMinutes: 0,
      outside: false,
      breakExcess: 0,
      dayExcess: Math.max(0, end - workEnd),
      offDay: null,
    })
    const key = machineKey(task)
    busyUntil.set(key, Math.max(busyUntil.get(key) ?? 0, end))
  }

  const scheduled = tasks
    .filter(
      (task) =>
        task.status === 'NOT_STARTED' &&
        task.schedule &&
        task.schedule.date >= today,
    )
    .sort((a, b) =>
      // Só o dia vai depois das que têm hora (GP-49)
      `${a.schedule!.date} ${a.schedule!.start ?? '99:99'}`.localeCompare(
        `${b.schedule!.date} ${b.schedule!.start ?? '99:99'}`,
      ),
    )

  // Uma sequência por máquina e por dia
  const cursors = new Map<string, number>()
  for (const task of scheduled) {
    const day = task.schedule!.date
    const key = `${machineKey(task)}|${day}`
    if (!cursors.has(key)) {
      const busy =
        day === today
          ? Math.max(
              nowMinutes,
              (busyUntil.get(machineKey(task)) ?? 0) +
                (busyUntil.has(machineKey(task)) ? intervalMinutes : 0),
            )
          : 0
      cursors.set(key, busy)
    }
    const cursor = cursors.get(key)!
    // Só o dia: entra na sequência, a partir do início do expediente
    const fixed = task.schedule!.start
    const planned = fixed ? toMinutes(fixed) : Math.max(cursor, workStart)
    const duration = Math.max(
      task.schedule!.minutes || task.estimatedMinutes,
      0,
    )

    // A sequência real da máquina, nos dois modos: é ela que diz o atraso
    const span = (from: number, pushed: boolean) => {
      let begin = from
      // Na sequência, ninguém começa dentro do intervalo: vai para o turno
      // seguinte. O horário agendado à mão fica como está (é permitido)
      if (pushed && hasBreak && begin >= breakStart! && begin < breakEnd!) {
        begin = breakEnd!
      }
      let finish = begin + duration
      let overBreak = 0
      const crosses = hasBreak && begin < breakStart! && finish > breakStart!
      if (crosses) {
        if (hours.runsThroughBreak) overBreak = finish - breakStart!
        else finish += breakEnd! - breakStart!
      }
      return { begin, finish, overBreak, crosses }
    }
    const real = span(Math.max(planned, cursor), cursor > planned)
    // Reagenda: mostra o horário novo; só avisa: o agendado, com o atraso
    const shown = liveSchedule === 'RESCHEDULE' ? real : span(planned, false)

    const off = dayOff(day, calendar)
    result.set(task.id, {
      start: shown.begin,
      end: shown.finish,
      delayMinutes: Math.max(0, real.begin - planned),
      outside: !!off || shown.begin < workStart || shown.begin >= workEnd,
      offDay: off,
      breakExcess: shown.overBreak,
      dayExcess: Math.max(0, shown.finish - workEnd),
    })

    const after = real.finish + intervalMinutes
    cursors.set(
      key,
      real.crosses && hours.runsThroughBreak
        ? Math.max(after, breakEnd!)
        : after,
    )
  }
  return result
}
