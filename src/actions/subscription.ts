'use server'

import { getData } from './_cruds'

/**
 * Busca a URL de pagamento pendente para a empresa do usuário logado
 */
export async function getPendingPaymentUrl(): Promise<{
  paymentUrl: string | null
  dueDate: string | null
}> {
  try {
    const response = await getData({
      route: '/subscriptions/my-pending-payment',
    })

    return {
      paymentUrl: response?.data?.paymentUrl || null,
      dueDate: response?.data?.dueDate || null,
    }
  } catch (error) {
    console.error('Error fetching pending payment URL:', error)
    return {
      paymentUrl: null,
      dueDate: null,
    }
  }
}
