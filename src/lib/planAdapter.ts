import { Plan } from '@/types/subscription'

// Tipo para os planos no formato antigo
interface OldPlan {
  id: string
  nome: string
  namesvg: React.ReactNode
  preco: number
  status: 'disponivel' | 'em_breve' | 'inativo'
  badge?: string
  badgeVariant?: 'success' | 'warning'
  svg?: React.ReactNode
  conceito: {
    descricao: string | string[]
    objetivo?: string
    principaisAcoes: string[]
    resultadosEsperados?: string
  }
  funcionalidades?: string[]
}

export function adaptPlanToNewFormat(oldPlan: OldPlan): Plan {
  // Map old status to new status
  const statusMap = {
    disponivel: 'available' as const,
    em_breve: 'coming_soon' as const,
    inativo: 'inactive' as const,
  }

  return {
    id: oldPlan.id,
    name: oldPlan.nome,
    price: oldPlan.preco,
    status: statusMap[oldPlan.status] || 'inactive',
    badge: oldPlan.badge,
    badgeVariant: oldPlan.badgeVariant,
    svg: oldPlan.svg,
    namesvg: oldPlan.namesvg,
    concept: {
      description: oldPlan.conceito.descricao,
      objective: oldPlan.conceito.objetivo,
      mainActions: oldPlan.conceito.principaisAcoes,
      expectedResults: oldPlan.conceito.resultadosEsperados,
    },
    features: oldPlan.funcionalidades,
  }
}

export function adaptPlansToNewFormat(oldPlans: OldPlan[]): Plan[] {
  return oldPlans.map(adaptPlanToNewFormat)
}
