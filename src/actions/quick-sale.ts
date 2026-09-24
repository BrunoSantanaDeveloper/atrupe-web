'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da venda rápida (ALT-22).
// Dados de exemplo em memória, no formato das actions reais.

// Types
import type { QuickSaleSettings } from '@/app/(app-sidebar)/configuracoes/vendas/venda-rapida/types'

let settings: QuickSaleSettings = {
  enabled: true,
  payment: 'CASH_ONLY',
  cashMethods: ['dinheiro', 'pix', 'cartao'],
  clientName: 'Consumidor',
  description: '',
  seriesId: 't1',
  serviceTypeId: 'venda-direta',
  responsibleId: null,
}

export const getQuickSaleSettings = async () => ({
  success: true,
  data: settings,
  message: '',
})

export const updateQuickSaleSettings = async (
  values: Partial<QuickSaleSettings>,
) => {
  if (
    values.enabled &&
    values.clientName !== undefined &&
    !values.clientName.trim()
  ) {
    return {
      success: false,
      data: null,
      message: 'Informe o nome que identifica a venda de balcão',
    }
  }

  settings = { ...settings, ...values }

  return { success: true, data: settings, message: '' }
}

// Opções vindas dos cadastros de Vendas, para a tela escolher os padrões
export const getQuickSaleOptions = async () => ({
  success: true,
  data: {
    series: [
      { value: 't1', label: 'T1 - Treinamento' },
      { value: 'v1', label: 'V1 - Vendas' },
    ],
    serviceTypes: [
      { value: 'venda-direta', label: 'Venda Direta' },
      { value: 'orcamento', label: 'Orçamento' },
      { value: 'indicacao', label: 'Indicação' },
    ],
    cashMethods: [
      { value: 'dinheiro', label: 'Dinheiro' },
      { value: 'pix', label: 'PIX' },
      { value: 'cartao', label: 'Cartão' },
    ],
    users: [
      { value: 'none', label: 'Sem responsável' },
      { value: 'maicol', label: 'Maicol Igor de Souza' },
    ],
  },
  message: '',
})
