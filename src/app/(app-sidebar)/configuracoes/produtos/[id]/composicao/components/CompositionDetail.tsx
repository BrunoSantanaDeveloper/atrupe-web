'use client'

// UI
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { AssemblyEditor, AssemblyEditorSkeleton } from './AssemblyEditor'
import { FeatureGate } from '@/components/common/FeatureGate'

// Actions
import { getItemOld } from '@/actions/_cruds'

// Types
import { unitSymbol, type UnitKind } from '../assembly'

// Hooks / Store / Consts
import { FEATURES } from '@/consts/features'

// Third-party
import { useQuery } from '@tanstack/react-query'

interface Props {
  id: string
}

// O produto composto: a composição por etapas (o "item pronto" do legado,
// área 8 §3.4.1), com as variações dentro dela, e os campos que o vendedor
// preenche.
export function CompositionDetail({ id }: Props) {
  // O cabeçalho mostra o produto do cadastro (nome, código, unidade), como
  // o diálogo do produto; o mock só serve aos exemplos sem cadastro
  const isCatalogId = /^[0-9a-f-]{32,36}$/i.test(id)
  const { data: catalogProduct, isLoading } = useQuery({
    staleTime: Infinity,
    enabled: isCatalogId,
    queryKey: ['product', id],
    queryFn: () => getItemOld({ route: 'productRoute', id }),
  })
  const unitKind: UnitKind | undefined = catalogProduct?.items?.[0]?.unitKind
  // A composição lê o cadastro na API: o produto é o do cadastro
  const product = catalogProduct?.id ? catalogProduct : null
  const title = catalogProduct?.name
  const support = [
    catalogProduct?.code,
    unitKind ? `vendido por ${unitSymbol[unitKind]}` : null,
  ]

  // O Topbar não espera a composição: o título entra quando chegar
  if (isLoading)
    return (
      <AssemblyEditorSkeleton
        topbar={{ title: title || '', previousPage: '/configuracoes/produtos' }}
      />
    )

  if (!product) return <div className="p-4">Produto não encontrado.</div>

  return (
    <TooltipProvider>
      <div className="space-y-5">
        {/* O Topbar é desenhado pelo editor, que põe a Situação no canto
            superior direito da tela */}
        <FeatureGate features={[FEATURES.COSTS.COST_BASE]}>
          <AssemblyEditor
            productId={product.id}
            topbar={{
              title: title || 'Produto',
              supportText: support.filter(Boolean).join(' · '),
              previousPage: '/configuracoes/produtos',
            }}
          />
        </FeatureGate>
      </div>
    </TooltipProvider>
  )
}
