// Gerenciador de produção (documentação funcional §12, recurso do ELITE).
// Cada etapa pertence a um setor e vem da composição do produto (PRO).

export type StageStatus =
  | 'BLOCKED'
  | 'READY'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'DONE'

export type ProductionStage = {
  id: string
  orderNumber: string
  client: string
  product: string
  stageName: string
  sector: string
  status: StageStatus
  // Minutos previstos pela composição e realizados no apontamento
  plannedMinutes: number
  actualMinutes: number | null
  assignee: string | null
  dueDate: string
  // Etapas que precisam terminar antes desta (§12.1)
  dependsOn: string[]
  // Liberação antecipada: a etapa seguinte pode começar antes do fim (§12.3)
  releasedEarly: boolean
}

export type SectorCapacity = {
  sector: string
  dailyHours: number
  plannedHours: number
}
