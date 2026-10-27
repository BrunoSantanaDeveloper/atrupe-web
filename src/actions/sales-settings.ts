'use server'

// Configurações de venda (MS-16, T-4): o markup do terceirizado avulso, nas
// rotas GET/PUT /sale/settings da API (contrato, módulo 2, com o nome da D35). O preço de venda
// do terceirizado é custo ÷ (1 − markup). O legado aplicava 45 % sem
// mostrar; aqui o percentual é configurável e aparece no painel

// Actions
import { getItem, putItemNew } from '@/actions/_cruds'

export type SalesSettings = {
  // Percentual, de 0 a 1000, com até duas casas
  outsourcedMarkup: number
  // Venda mínima por item, em centavos (GR-4, 27/10/2026); 0 = sem mínimo
  minItemValue: number
}

const DEFAULTS: SalesSettings = { outsourcedMarkup: 45, minItemValue: 0 }

export const getSalesSettings = async () => {
  const res = await getItem({ route: '/sale/settings' })
  if (!res.success) {
    return { success: false, data: DEFAULTS, message: res.message || '' }
  }
  return {
    success: true,
    data: { ...DEFAULTS, ...(res.data as Partial<SalesSettings>) },
    message: '',
  }
}

// Cada tela manda só o que muda (a API do patch 14 aceita os campos em
// separado; a anterior exige o acréscimo e não conhece a venda mínima)
export const updateSalesSettings = async (values: Partial<SalesSettings>) => {
  const data: Partial<SalesSettings> = {}
  if (values.outsourcedMarkup !== undefined) {
    data.outsourcedMarkup = Number(values.outsourcedMarkup)
  }
  if (values.minItemValue !== undefined) {
    data.minItemValue = Math.max(0, Math.round(Number(values.minItemValue)))
  }
  const res = await putItemNew({ route: '/sale/settings', data })
  if (!res.success) {
    const message = String(res.message || '')
    return {
      success: false,
      data: null,
      message: /minItemValue/.test(message)
        ? 'A API ainda não aceita a venda mínima por item (patch 14).'
        : message || 'O acréscimo precisa ser um percentual entre 0 % e 1000 %',
    }
  }
  return { success: true, data: res.data as SalesSettings, message: '' }
}
