'use client'

// A proposta impressa, com o nível de detalhe que o cliente vê (IP-12):
// sem detalhes (nome, descritivo e preço), detalhada sem valores (o que
// compõe) e detalhada com valores (o valor de cada etapa). O nível fica na
// URL (?detalhe=) e o com valores pede a permissão de ver valores, porque
// expõe parte do método (SEG-6). Custo nunca aparece (ORC-7).

// React / Next
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { Topbar } from '@/components/common/Topbar'

// Types
import type { QuotationItem } from '../types'
import type { SaleCompositionReport } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Actions
import { getQuotation } from '@/actions/quotation-composition'
import { getSaleComposition } from '@/actions/product-assembly'

// Hooks / Store / Consts
import { useCanSeeValues } from '@/hooks/useMoney'
import { updateFilterParam } from '@/lib/filter-utils'
import { itemTotal, quotationTotal } from '@/lib/quotation-calc'

// Third-party
import { useQueries, useQuery } from '@tanstack/react-query'

// Icons
import { IconPrinter } from '@tabler/icons-react'

// Utils
import { cn, formatCurrencyToBrl } from '@/lib/utils'

type Detail = 'resumo' | 'lista' | 'valores'

const detailObj: { [key in Detail]: { text: string; help: string } } = {
  resumo: {
    text: 'Sem detalhes',
    help: 'Nome do item, descritivo técnico e preço final.',
  },
  lista: {
    text: 'Detalhado sem valores',
    help: 'O que compõe cada item, sem preço por etapa.',
  },
  valores: {
    text: 'Detalhado com valores',
    help: 'O que compõe cada item, com o valor de cada etapa.',
  },
}

const num = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

const size = (item: QuotationItem) =>
  item.width && item.height
    ? ` · ${num(item.width)} × ${num(item.height)} m`
    : ''

// O que a etapa leva, em uma linha: recursos escolhidos e itens da lista
const resourcesOf = (block: SaleCompositionReport['blocks'][number]) =>
  block.lines
    .map((line) =>
      line.entries
        ? line.entries.map((entry) => entry.name).join(', ')
        : line.resource,
    )
    .filter(Boolean)
    .join(', ')

interface Props {
  quotationId: string
}

export function ProposalPrint({ quotationId }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const canSeeValues = useCanSeeValues()

  const requested = (params.get('detalhe') as Detail) || 'resumo'
  // Sem a permissão de ver valores, o nível com valores não existe
  const detail: Detail =
    requested === 'valores' && !canSeeValues ? 'lista' : requested

  const { data, isLoading } = useQuery({
    queryKey: ['quotation-composition', quotationId],
    queryFn: () => getQuotation({ id: quotationId }),
  })
  const quotation = data?.data

  // A composição de cada item com produto composto, para o nível detalhado
  const reports = useQueries({
    queries: (quotation?.items || []).map((item) => ({
      queryKey: ['proposal-item', item.id, item.composition, item.quantity],
      enabled: !!item.productId,
      queryFn: () =>
        getSaleComposition({
          productId: item.productId!,
          measure: {
            quantity: item.quantity,
            width: item.width || 1,
            height: item.height || 1,
          },
          variationName: item.variation,
          extras: item.composition?.extras,
          times: item.composition?.times,
          choices: item.composition?.choices,
          optionals: item.composition?.optionals,
          lists: item.composition?.lists,
        }),
    })),
  })

  // Topbar já na tela (o título vem com os dados); abaixo, a forma da folha
  if (isLoading)
    return (
      <div className="space-y-5">
        <Topbar
          title=""
          previousPage={`/vendas/orcamentos/${quotationId}/composicao`}
        />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-40" />
          ))}
        </div>
        <div className="mx-auto max-w-[800px] space-y-4 rounded-xl border border-gray-200 bg-white p-8">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )
  if (!quotation) return <div className="p-4">Orçamento não encontrado.</div>

  const reportOf = (index: number) =>
    (reports[index]?.data?.data as SaleCompositionReport | null) || null

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <Topbar
          review="new"
          title={`Proposta ${quotation.reference}`}
          previousPage={`/vendas/orcamentos/${quotationId}/composicao`}
          supportText={quotation.client}
          primaryCta={
            <Button LeftIcon={IconPrinter} onClick={() => window.print()}>
              Imprimir
            </Button>
          }
        />
      </div>

      {/* O nível de detalhe, antes de imprimir */}
      <div className="flex flex-wrap gap-2 print:hidden">
        {(Object.keys(detailObj) as Detail[])
          .filter((key) => key !== 'valores' || canSeeValues)
          .map((key) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                updateFilterParam('detalhe', key === 'resumo' ? 'all' : key, {
                  router,
                  params,
                })
              }
              className={cn(
                'rounded-lg border bg-white px-4 py-2 text-left',
                detail === key
                  ? 'border-brand-500 ring-1 ring-brand-500'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <span className="block text-sm font-medium text-gray-800">
                {detailObj[key].text}
              </span>
              <span className="block text-xs text-gray">
                {detailObj[key].help}
              </span>
            </button>
          ))}
      </div>

      {/* A folha da proposta */}
      <div className="mx-auto max-w-[800px] rounded-xl border border-gray-200 bg-white p-8 print:max-w-none print:border-0 print:p-0">
        <div className="flex items-start justify-between gap-6 border-b border-gray-200 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray">
              Proposta comercial
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {quotation.reference}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray">Cliente</p>
            <p className="font-medium text-gray-800">{quotation.client}</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {quotation.items.map((item, index) => {
            const report = reportOf(index)
            const total = itemTotal(item)
            const totalSale =
              report?.blocks.reduce((sum, block) => sum + block.sale, 0) || 0

            return (
              <div key={item.id} className="space-y-2 py-4">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray">
                      {item.quantity} un{size(item)}
                      {item.variation ? ` · ${item.variation}` : ''}
                    </p>
                  </div>
                  <p className="whitespace-nowrap font-semibold text-gray-900">
                    {formatCurrencyToBrl(total)}
                  </p>
                </div>

                {report?.technicalDescription && (
                  <p className="text-sm text-gray-700">
                    {report.technicalDescription}
                  </p>
                )}

                {detail !== 'resumo' && report && (
                  <ul className="space-y-1 rounded-lg bg-gray-50 p-3 text-sm print:bg-transparent print:p-0">
                    {report.blocks
                      // Etapa que ficou vazia nesta venda (a opcional
                      // desmarcada) não aparece para o cliente
                      .filter((block) => block.lines.length || block.sale > 0)
                      .map((block) => (
                        <li
                          key={block.id}
                          className={cn(
                            'flex items-start justify-between gap-4',
                            block.role === 'FINISHING' && 'pl-4',
                          )}
                        >
                          <span className="text-gray-700">
                            {block.name}
                            {resourcesOf(block) && (
                              <span className="text-gray">
                                {' '}
                                · {resourcesOf(block)}
                              </span>
                            )}
                          </span>
                          {/* O valor do item repartido pelo peso de cada etapa:
                            as linhas somam o preço do item */}
                          {detail === 'valores' && totalSale > 0 && (
                            <span className="whitespace-nowrap text-gray-700">
                              {formatCurrencyToBrl(
                                Math.round((total * block.sale) / totalSale),
                              )}
                            </span>
                          )}
                        </li>
                      ))}
                  </ul>
                )}

                {detail !== 'resumo' && !report && item.lines.length > 0 && (
                  <ul className="space-y-1 rounded-lg bg-gray-50 p-3 text-sm print:bg-transparent print:p-0">
                    {item.lines.map((line) => (
                      <li
                        key={line.id}
                        className="flex items-start justify-between gap-4"
                      >
                        <span className="text-gray-700">{line.name}</span>
                        {detail === 'valores' && (
                          <span className="whitespace-nowrap text-gray-700">
                            {formatCurrencyToBrl(line.price * item.quantity)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex justify-end border-t border-gray-200 pt-4">
          <p className="text-right">
            <span className="block text-xs uppercase tracking-wide text-gray">
              Total
            </span>
            <span className="text-xl font-semibold text-gray-900">
              {formatCurrencyToBrl(quotationTotal(quotation.items))}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
