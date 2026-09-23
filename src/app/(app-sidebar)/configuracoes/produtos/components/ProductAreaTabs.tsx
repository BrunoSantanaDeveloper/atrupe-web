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
// materiais é recurso do PRO.
export function ProductAreaTabs() {
  const pathname = usePathname()
  const { hasFeature } = usePlanFeatures()

  if (!hasFeature(FEATURES.COSTS.COST_BASE)) return null

  const current = pathname.includes('/materiais')
    ? 'materiais'
    : pathname.includes('/processos')
      ? 'processos'
      : pathname.includes('/composicoes')
        ? 'composicoes'
        : pathname.includes('/terceirizados')
          ? 'terceirizados'
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
        <TabsTrigger value="composicoes" asChild>
          <Link href="/configuracoes/produtos/composicoes">Composições</Link>
        </TabsTrigger>
        <TabsTrigger value="terceirizados" asChild>
          <Link href="/configuracoes/produtos/terceirizados">
            Terceirizados
          </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
