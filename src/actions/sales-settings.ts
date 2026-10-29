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
}

const DEFAULTS: SalesSettings = { outsourcedMarkup: 45 }

export const getSalesSettings = async () => {
  const res = await getItem({ route: '/sale/settings' })
  if (!res.success) {
    return { success: false, data: DEFAULTS, message: res.message || '' }
  }
  return { success: true, data: res.data as SalesSettings, message: '' }
}

export const updateSalesSettings = async (values: Partial<SalesSettings>) => {
  const res = await putItemNew({
    route: '/sale/settings',
    data: { outsourcedMarkup: Number(values.outsourcedMarkup) },
  })
  if (!res.success) {
    return {
      success: false,
      data: null,
      message:
        res.message ||
        'O acréscimo precisa ser um percentual entre 0 % e 1000 %',
    }
  }
  return { success: true, data: res.data as SalesSettings, message: '' }
}
