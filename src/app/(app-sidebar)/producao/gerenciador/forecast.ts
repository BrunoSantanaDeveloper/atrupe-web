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
// - A manutenção que bloqueia a agenda (GP-49 item 6): a sequência da
//   máquina pula o período; o agendado à mão dentro dele fica em vermelho.
// - Os blocos de agenda (GP-52): a tarefa dividida entra na sequência de
//   cada dia em que tem bloco, com os minutos daquele bloco. A previsão do
//   bloco 1 fica na chave da tarefa; a dos outros, em forecastKey.

import {
  blocksOf,
  type LiveSchedule,
  type ManagerHours,
  type TaskBlock,
  type TaskView,
} from './manager'
import type { ProductionCalendar } from '@/actions/production-manager'

// A manutenção do patrimônio que bloqueia a máquina (GP-49 item 6). A tarefa
// não guarda o patrimônio: guarda a configuração vendida (machineSetupId) e o
// nome da opção vendida em `machine` ("Bem · Configuração", às vezes com a
// variação, ou o nome do grupo). Por isso o bloqueio leva o bem e as
// configurações dele.
export type MaintenanceBlock = {
  costId: string
  name: string
  assetId: string
  // O nome do bem, para a tela e para a tarefa antiga
  machine: string
  setupIds: string[]
  date: string
  start: string
  minutes: number
}

/**
 * A manutenção para a máquina da tarefa, como o servidor faz (blocksTask):
 * pela configuração vendida; na tarefa antiga, sem ela, pelo nome do bem
 * igual ou pelo prefixo "Bem · ". A tarefa do grupo de máquinas não casa.
 */
export const blocksTask = (
  block: Pick<MaintenanceBlock, 'machine' | 'setupIds'>,
  task: Pick<TaskView, 'machine' | 'machineSetupId'>,
) => {
  if (task.machineSetupId) {
    return (block.setupIds || []).includes(task.machineSetupId)
  }
  const machine = task.machine?.trim()
  const asset = block.machine?.trim()
  if (!machine || !asset) return false
  return machine === asset || machine.startsWith(`${asset} · `)
}

// O dia é feriado ou não é de trabalho (GP-49)
export type DayOff = 'HOLIDAY' | 'NO_WORK' | null

export type Forecast = {
  // A tarefa: a dividida tem uma previsão por bloco (GP-52)
  taskId: string
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
  // Cai na manutenção da máquina: o nome dela (GP-49 item 6)
  maintenance?: string | null
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

/**
 * A chave da previsão no mapa: o bloco 1 (e a tarefa em andamento) pelo id
 * da tarefa; os outros blocos de agenda, pela tarefa e pelo bloco (GP-52).
 */
export const forecastKey = (
  taskId: string,
  block?: Pick<TaskBlock, 'slotId'> | null,
) => (block?.slotId ? `${taskId}:${block.slotId}` : taskId)

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
    // As manutenções que bloqueiam as máquinas
    maintenance?: MaintenanceBlock[]
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
      taskId: task.id,
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

  // Bloco a bloco (GP-52): cada bloco no dia dele, com os minutos dele, e
  // não o total da tarefa no primeiro dia
  const scheduled = tasks
    .filter((task) => task.status === 'NOT_STARTED')
    .flatMap((task) =>
      blocksOf(task)
        .filter((block) => block.date >= today)
        .map((block) => ({ task, block })),
    )
    .sort((a, b) =>
      // Só o dia vai depois das que têm hora (GP-49)
      `${a.block.date} ${a.block.start ?? '99:99'}`.localeCompare(
        `${b.block.date} ${b.block.start ?? '99:99'}`,
      ),
    )

  // Uma sequência por máquina e por dia
  const cursors = new Map<string, number>()
  for (const { task, block: taskBlock } of scheduled) {
    const day = taskBlock.date
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
    const fixed = taskBlock.start
    const planned = fixed ? toMinutes(fixed) : Math.max(cursor, workStart)
    // O bloco 1 sem minutos vale o previsto; os outros, os minutos deles
    const duration = Math.max(
      taskBlock.slotId === null
        ? taskBlock.minutes || task.estimatedMinutes
        : taskBlock.minutes,
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
    // A manutenção da máquina naquele dia: a sequência pula o período
    const blocks = (options.maintenance || [])
      .filter((block) => block.date === day && blocksTask(block, task))
      .map((block) => ({
        name: block.name,
        from: toMinutes(block.start),
        to: toMinutes(block.start) + block.minutes,
      }))
    const hit = (begin: number, finish: number) =>
      blocks.find((block) => begin < block.to && finish > block.from)
    let real = span(Math.max(planned, cursor), cursor > planned)
    for (let guard = 0; guard < blocks.length; guard++) {
      const block = hit(real.begin, real.finish)
      if (!block) break
      real = span(block.to, true)
    }
    // Reagenda: mostra o horário novo; só avisa: o agendado, com o atraso
    const shown = liveSchedule === 'RESCHEDULE' ? real : span(planned, false)
    const inMaintenance = hit(shown.begin, shown.finish)?.name ?? null

    const off = dayOff(day, calendar)
    result.set(forecastKey(task.id, taskBlock), {
      taskId: task.id,
      start: shown.begin,
      end: shown.finish,
      delayMinutes: Math.max(0, real.begin - planned),
      outside: !!off || shown.begin < workStart || shown.begin >= workEnd,
      offDay: off,
      breakExcess: shown.overBreak,
      dayExcess: Math.max(0, shown.finish - workEnd),
      maintenance: inMaintenance,
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
