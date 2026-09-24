// EC-12 — totais do dia somam movimentação cancelada
//
// Os totais de cada dia (`expectedRevenue`, `realizedRevenue`, e os de
// despesa) vêm prontos da API, e ela continua somando parcela cancelada. O
// resumo do topo da mesma tela, que vem de outro endpoint, já exclui — então
// a tela mostra dois números diferentes para o mesmo dia.
//
// Enquanto a API não corrige, o front **desconta do total o que a própria
// listagem do dia mostra como cancelado**. É paliativo, e de propósito ele
// não recalcula o total do zero: subtrair só as canceladas mantém os dias sem
// cancelamento exatamente como a API devolveu, sem risco de divergir dela por
// alguma regra que o front não conhece.
//
// **Quando a API for corrigida, este arquivo tem de sair**, senão o valor
// cancelado passa a ser descontado duas vezes. A conferência é simples:
// cancelar uma venda já recebida e ver se o total do dia bate com o resumo do
// topo sem este ajuste.
import type {
  TransactionDataType,
  TransactionListType,
} from '@/types/financial/financialFlow'

const isCanceled = (item: TransactionListType) =>
  item?.status === 'CANCELED' || item?.currentInstallment?.status === 'CANCELED'

// A linha da tabela mostra `value` como previsto e `paidValue` como realizado:
// o desconto usa os mesmos campos, para bater com o que está à vista.
const sum = (
  transactions: TransactionListType[],
  type: TransactionListType['type'],
  field: 'value' | 'paidValue',
) =>
  transactions
    .filter((item) => item?.type === type && isCanceled(item))
    .reduce(
      (total, item) => total + (item?.currentInstallment?.[field] || 0),
      0,
    )

// Quanto o dia tem de cancelado, para ser descontado de um total já pronto.
// A tela de "A receber" e "A pagar" guarda o previsto sempre no mesmo campo,
// mudando só o tipo das movimentações — por isso ela desconta por aqui.
export const canceledInDay = (
  group: TransactionDataType,
  type: TransactionListType['type'],
  field: 'value' | 'paidValue',
) => sum(group?.transactions || [], type, field)

export type DayTotals = Pick<
  TransactionDataType,
  'expectedRevenue' | 'realizedRevenue' | 'expectedExpense' | 'realizedExpense'
>

export function dayTotalsWithoutCanceled(
  group: TransactionDataType,
): DayTotals {
  const transactions = group?.transactions || []

  return {
    expectedRevenue:
      (group?.expectedRevenue || 0) - sum(transactions, 'receivable', 'value'),
    realizedRevenue:
      (group?.realizedRevenue || 0) -
      sum(transactions, 'receivable', 'paidValue'),
    expectedExpense:
      (group?.expectedExpense || 0) - sum(transactions, 'payable', 'value'),
    realizedExpense:
      (group?.realizedExpense || 0) - sum(transactions, 'payable', 'paidValue'),
  }
}
