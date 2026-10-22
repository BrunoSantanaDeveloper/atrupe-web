import { useQuery } from '@tanstack/react-query'

import { getQuickSaleSettings } from '@/actions/quick-sale'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

/**
 * A venda rápida está ligada em Configurações › Vendas › Venda rápida ("Usar
 * venda rápida")? A tela diz que, ligada, ela aparece no menu de Vendas: o
 * menu e o botão da lista seguem esta resposta.
 *
 * Só esconde quando a configuração foi lida e veio desligada. Sem o recurso
 * do plano não pergunta; se a leitura falhar (sem permissão de ler a
 * configuração, API fora), fica como antes: aparece pelo plano e pela
 * permissão. A chave é a mesma da tela de configuração, que a invalida ao
 * salvar.
 */
export function useQuickSaleEnabled() {
  const { canCreateQuickSale } = usePlanFeatures()
  const hasFeature = canCreateQuickSale()

  const { data } = useQuery({
    queryKey: ['quick-sale-settings'],
    queryFn: () => getQuickSaleSettings(),
    staleTime: Infinity,
    enabled: hasFeature,
  })

  if (!hasFeature) return false
  if (data?.success && data.data?.enabled === false) return false
  return true
}
