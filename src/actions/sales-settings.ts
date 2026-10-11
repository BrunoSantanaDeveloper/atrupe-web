'use server'

// PROVISÓRIO: a API ainda não guarda as configurações de venda da
// composição. Dados em memória, por empresa, no formato das actions reais.

import { auth } from '@/lib/auth'

// Markup padrão do terceirizado avulso (MS-16, T-4, decisão de 05/10/2026):
// o preço de venda do terceirizado é custo ÷ (1 − markup). O legado aplicava
// 45 % sem mostrar; aqui o percentual é configurável e aparece no painel
export type SalesSettings = {
  // Percentual, de 0 a 99
  outsourcedMarkup: number
}

const DEFAULTS: SalesSettings = { outsourcedMarkup: 45 }

const byCompany = new Map<string, SalesSettings>()

const companyKey = async () => {
  const session = await auth()
  return session?.company?.id || 'sem-empresa'
}

export const getSalesSettings = async () => {
  const key = await companyKey()
  const settings = byCompany.get(key) || DEFAULTS
  return { success: true, data: settings, message: '' }
}

export const updateSalesSettings = async (values: Partial<SalesSettings>) => {
  if (values.outsourcedMarkup !== undefined) {
    const markup = Number(values.outsourcedMarkup)
    if (!Number.isFinite(markup) || markup < 0 || markup >= 100) {
      return {
        success: false,
        data: null,
        message: 'O markup precisa ser um percentual entre 0 % e 99 %',
      }
    }
  }
  const key = await companyKey()
  const settings = { ...(byCompany.get(key) || DEFAULTS), ...values }
  byCompany.set(key, settings)
  return { success: true, data: settings, message: '' }
}
