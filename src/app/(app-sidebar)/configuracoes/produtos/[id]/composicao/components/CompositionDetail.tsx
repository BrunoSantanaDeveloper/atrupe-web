'use client'

// UI
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ReviewTodo } from '@/components/common/ReviewTodo'
import { AssemblyEditor } from './AssemblyEditor'
import { ProductFields } from './ProductFields'
import { VariationTabs } from './VariationTabs'
import { FeatureGate } from '@/components/common/FeatureGate'

// Actions
import { getComposition } from '@/actions/compositions'

// Hooks / Store / Consts
import { FEATURES } from '@/consts/features'

// Third-party
import { useQuery } from '@tanstack/react-query'

interface Props {
  id: string
}

// O produto composto: a composição por etapas (o "item pronto" do legado,
// área 8 §3.4.1), os campos que o vendedor preenche e as variações.
export function CompositionDetail({ id }: Props) {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['composition', id],
    queryFn: () => getComposition({ id }),
  })

  const product = data?.data

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  if (!product) return <div className="p-4">Produto não encontrado.</div>

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title={product.name}
          previousPage="/configuracoes/produtos"
          supportText={[product.code, `vendido por ${product.unit}`]
            .filter(Boolean)
            .join(' · ')}
        />

        <FeatureGate features={[FEATURES.COSTS.COST_BASE]}>
          <AssemblyEditor productId={product.id} />
        </FeatureGate>

        <FeatureGate features={[FEATURES.COSTS.COST_BASE]}>
          <ProductFields productId={product.id} fields={product.fields} />
        </FeatureGate>

        <Card>
          <CardHeader>
            <CardTitle>Variações</CardTitle>
            <CardDescription>
              O mesmo produto em tamanhos ou modelos diferentes. A variação
              nasce igual à base e só o que for alterado nela passa a ser dela.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <VariationTabs product={product} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ReviewTodo rule="AP-1" title="Aproveitamento de folha e chapa">
            Informada a medida da peça e a da folha, o sistema diz quantas cabem
            — testando as duas orientações — e cobra o material pelo que foi
            consumido. Vale para papel, PVC e ACM. É cálculo, não IA.
          </ReviewTodo>
          <ReviewTodo rule="FQ-1" title="Preço por faixa de quantidade">
            O desconto progressivo da gráfica: até 100 um preço, de 101 a 500
            outro. A faixa é do produto e entra sozinha no orçamento.
          </ReviewTodo>
        </div>
      </div>
    </TooltipProvider>
  )
}
