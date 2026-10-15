// Os dois modos do relatório de comissões (ALT-23).
//
// A empresa paga a comissão de um de dois jeitos, e cada um é um relatório:
// - pelo valor VENDIDO no mês pelo vendedor, recebido ou não;
// - pelo valor RECEBIDO no mês, das vendas desse vendedor — inclusive vendas
//   de meses anteriores que só foram pagas agora.
//
// O que muda entre eles é a data que o período filtra e a base da comissão.

// Utils
import {
  formatDateToISO,
  calculatePeriodDates,
  type PeriodType,
} from '@/lib/filter-utils'

// Types
import type { CommissionRecord } from './types'

export type CommissionMode = 'sold_value' | 'received_value'

// O modo "pelo valor recebido" (ALT-23): a API traz um registro por
// recebimento no período, inclusive de vendas de meses anteriores
export const commissionModeOf = (value?: string | null): CommissionMode =>
  value === 'received_value' ? 'received_value' : 'sold_value'

export const commissionModeCopy: Record<
  CommissionMode,
  {
    label: string
    description: string
    dateLabel: string
    baseLabel: string
  }
> = {
  sold_value: {
    label: 'Pelo valor vendido',
    description: 'O que o vendedor vendeu no período, recebido ou não.',
    dateLabel: 'Vendas de',
    baseLabel: 'Vendido',
  },
  received_value: {
    label: 'Pelo valor recebido',
    description:
      'O que entrou no período, das vendas do vendedor — inclusive vendas de meses anteriores.',
    dateLabel: 'Recebimentos de',
    baseLabel: 'Recebido',
  },
}

// A base sobre a qual o percentual do vendedor incide
export const commissionBase = (
  record: Pick<CommissionRecord, 'saleValue' | 'receivedValue'>,
  mode: CommissionMode,
) => (mode === 'received_value' ? record.receivedValue : record.saleValue)

export const commissionOf = (
  record: Pick<CommissionRecord, 'saleValue' | 'receivedValue' | 'percentage'>,
  mode: CommissionMode,
) => commissionBase(record, mode) * (record.percentage / 100)

type Params = {
  commissionType?: string | null
  period?: string | null
  startDate?: string | null
  endDate?: string | null
  receivedStartDate?: string | null
  receivedEndDate?: string | null
  sellerId?: string | null
}

// As três consultas (resumo, tabela e impressão) usam sempre os mesmos filtros
export function commissionFilters(params: Params, restrictedSellerId?: string) {
  const sellerId =
    restrictedSellerId ||
    (params.sellerId && params.sellerId !== 'all' ? params.sellerId : undefined)

  // O período da tela é um só e o modo decide se ele filtra a data da venda
  // ou a do recebimento (ALT-23). Sem datas na URL, vale o período escolhido
  // (o mês atual por padrão)
  const mode = commissionModeOf(params.commissionType)

  let startDate = params.startDate || undefined
  let endDate = params.endDate || undefined

  if (!startDate || !endDate) {
    const dates = calculatePeriodDates(
      (params.period || 'current_month') as PeriodType,
    )
    if (dates) {
      startDate = formatDateToISO(dates.startDate)
      endDate = formatDateToISO(dates.endDate)
    }
  }

  return mode === 'received_value'
    ? {
        commissionType: mode,
        receivedStartDate: startDate,
        receivedEndDate: endDate,
        sellerId,
      }
    : { commissionType: mode, startDate, endDate, sellerId }
}
