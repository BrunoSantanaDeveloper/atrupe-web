'use client'

// React / Next
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// UI
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Hooks / Consts
import { FEATURES } from '@/consts/features'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Produtos e materiais convivem na mesma tela, em abas (MT-9). A aba de
// materiais é recurso do PRO. A composição não tem aba própria: ela é um
// recurso do produto, aberto pela linha da lista (CP-17). Terceirizado
// também não: com valor fixo é produto do setor, e avulso entra na
// composição (T-3 e T-4).
export function ProductAreaTabs() {
  const pathname = usePathname()
  const { hasFeature } = usePlanFeatures()

  if (!hasFeature(FEATURES.COSTS.COST_BASE)) return null

  const current = pathname.includes('/materiais')
    ? 'materiais'
    : pathname.includes('/processos')
      ? 'processos'
      : 'produtos'

  return (
    <Tabs value={current} className="overflow-x-auto">
      <TabsList>
        <TabsTrigger value="produtos" asChild>
          <Link href="/configuracoes/produtos">Produtos</Link>
        </TabsTrigger>
        <TabsTrigger value="materiais" asChild>
          <Link href="/configuracoes/produtos/materiais">Materiais</Link>
        </TabsTrigger>
        <TabsTrigger value="processos" asChild>
          <Link href="/configuracoes/produtos/processos">Processos</Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
