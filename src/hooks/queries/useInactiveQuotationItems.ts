// Itens do orçamento cujo produto foi inativado (PAD-7, regra do Maicol em
// 05/10/2026): o orçamento aberto fica marcado e não pode ser aprovado até o
// item ser trocado ou retirado. A conferência é pelo lado do orçamento: o
// detalhe do produto na API (`isActive`), um por produto distinto. O mock
// `getOpenQuotationsUsingProduct` responde pelos orçamentos de exemplo, não
// pelos da API, então não serve aqui.

import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import { getItemOld } from '@/actions/_cruds'
import { DEMO_DATA } from '@/lib/demo'
import type { QuotationType, QuotationItemType } from '@/types/sales/quotation'

// Só enquanto o orçamento ainda pode ser aprovado; aprovado ou rejeitado, a
// marca não muda nada
const WATCHED = ['OPEN', 'DONE', 'OVERDUE']

export function useInactiveQuotationItems(data?: QuotationType) {
  const items = useMemo(() => data?.quotationItems || [], [data])
  // Sem a flag de demonstração a regra fica desligada, como em produção hoje:
  // a API aprova orçamento com produto inativado e não devolve o isActive do
  // item, e o PAD-7 ainda espera a decisão do dono. Sai a trava do Aprovar, a
  // faixa dos itens, o aviso do Concluir e as consultas de produto. Para ligar
  // em produção, tirar o `&& DEMO_DATA` (e avisar no diálogo de inativar).
  const watched = WATCHED.includes(data?.status || '') && DEMO_DATA

  const productIds = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((item) => item.product?.originalProductId)
            .filter((id): id is string => !!id),
        ),
      ),
    [items],
  )

  const results = useQueries({
    queries: productIds.map((id) => ({
      // A mesma chave do useProductDetail, para dividir o cache
      queryKey: ['product', id],
      queryFn: () => getItemOld({ route: 'productRoute', id }),
      enabled: watched,
      staleTime: Infinity,
      retry: false,
    })),
  })

  // Uma marca por produto, para o memo não refazer a cada render
  const activeFlags = results
    .map((result) => (result.data as { isActive?: boolean })?.isActive)
    .join()

  const inactiveProductIds = useMemo(() => {
    const set = new Set<string>()
    // A chave é dividida com o useProductDetail: com a regra desligada, um
    // produto já em cache não pode marcar o item
    if (!watched) return set
    productIds.forEach((id, index) => {
      const product = results[index]?.data as { isActive?: boolean } | undefined
      if (product && product.isActive === false) set.add(id)
    })
    return set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds, activeFlags, watched])

  const inactiveItems: QuotationItemType[] = items.filter((item) =>
    inactiveProductIds.has(item.product?.originalProductId),
  )

  return {
    inactiveItems,
    hasInactive: inactiveItems.length > 0,
    isItemInactive: (item: QuotationItemType) =>
      inactiveProductIds.has(item.product?.originalProductId),
    isLoading: watched && results.some((result) => result.isLoading),
  }
}
