'use server'

// PROVISÓRIO: a API ainda não tem os endpoints da venda rápida (ALT-22).
// Dados de exemplo em memória, no formato das actions reais.

// Types
import type { QuickSaleSettings } from '@/app/(app-sidebar)/configuracoes/vendas/venda-rapida/types'

let settings: QuickSaleSettings = {
  enabled: true,
  payment: 'CASH_ONLY',
  cashMethods: ['dinheiro', 'pix', 'cartao'],
  clientId: '',
  clientName: '',
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
  // Sem cliente padrão a venda rápida não consegue criar o orçamento, que é
  // justamente o que ela existe para fazer (ALT-22)
  if (values.enabled && values.clientId !== undefined && !values.clientId) {
    return {
      success: false,
      data: null,
      message: 'Escolha o cliente padrão da venda rápida',
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
