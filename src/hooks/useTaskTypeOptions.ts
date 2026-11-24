'use client'

// O tipo de tarefa da etapa, no processo e na composição (item 22 dos
// ajustes; Maicol, 23/11/2026). O modelo é o do legado: o tipo de tarefa
// pertence ao gerenciador, com as etapas, a liberação e o tempo. No ELITE o
// seletor mostra os tipos cadastrados em Configurações › Produção, e não a
// lista fixa; o nome sem tipo cadastrado avisa, porque a tarefa cairia no
// tipo padrão "Produção" sem ninguém saber. A ligação continua pelo nome
// (o tipo é casado pelo nome, sem diferença de maiúsculas), como no back.

// Third-party
import { useQuery } from '@tanstack/react-query'

// Actions
import { getManagerConfig } from '@/actions/production-manager'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Utils
import { DEMO_DATA } from '@/lib/demo'

// Consts
import { FEATURES } from '@/consts/features'
import { TASK_TYPES } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

const key = (name: string) => name.trim().toLowerCase()

export function useTaskTypeOptions(current?: string | null) {
  const { hasFeature } = usePlanFeatures()
  // Só com a flag de demonstração, como o resto da produção: ler
  // /production/config cria o fluxo padrão da empresa na primeira vez. Sem
  // ela, o seletor fica com a lista de sempre e não avisa nada
  const elite = DEMO_DATA && hasFeature(FEATURES.PRODUCTION.PRODUCTION_MANAGER)
  const { data } = useQuery({
    queryKey: ['production-config'],
    queryFn: () => getManagerConfig(),
    enabled: elite,
    staleTime: 5 * 60 * 1000,
  })
  const registered = (data?.data?.taskTypes || [])
    .filter((type) => type.active !== false)
    .map((type) => type.name)
  // Sem tipo cadastrado (ou sem acesso à configuração), a lista de sempre
  const names = registered.length ? registered : TASK_TYPES
  const options = Array.from(
    new Set([...(current ? [current] : []), ...names]),
  ).filter(Boolean)
  /** O nome que não tem tipo cadastrado (só no ELITE, com tipos lidos). */
  const missing = (name?: string | null) =>
    !!name &&
    elite &&
    registered.length > 0 &&
    !registered.some((type) => key(type) === key(name))
  return { options, missing }
}
