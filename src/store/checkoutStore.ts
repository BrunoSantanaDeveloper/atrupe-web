import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * O que foi escolhido na etapa do plano e segue para as etapas do contrato e
 * do pagamento. Fica na sessão do navegador (não no localStorage): é uma
 * escolha em curso, não preferência, e não deve sobreviver a fechar a aba.
 *
 * Nada aqui é preço: o valor vem sempre do orçamento calculado no servidor.
 */
export interface CheckoutSelection {
  /**
   * Contratação nova, evolução para o próximo plano ou complementos do plano
   * atual. Na contratação e na evolução, `modules` são todos os módulos do
   * plano contratado; nos complementos, só os que entram.
   */
  mode: 'NEW' | 'EVOLUTION' | 'COMPLEMENTS'
  planId: string | null
  modules: string[]
  additionalUsers: number
  cycle: 'MONTHLY' | 'YEARLY'
}

const EMPTY: CheckoutSelection = {
  mode: 'NEW',
  planId: null,
  modules: [],
  additionalUsers: 0,
  cycle: 'MONTHLY',
}

interface CheckoutState {
  selection: CheckoutSelection
  setSelection: (patch: Partial<CheckoutSelection>) => void
  clear: () => void
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      selection: EMPTY,
      setSelection: (patch) =>
        set((state) => ({ selection: { ...state.selection, ...patch } })),
      clear: () => set({ selection: EMPTY }),
    }),
    {
      name: 'checkout-selection',
      storage: createJSONStorage(() => sessionStorage),
      // Uma escolha gravada antes de existir o `mode` é uma contratação nova.
      merge: (persisted, current) => ({
        ...current,
        selection: {
          ...EMPTY,
          ...((persisted as Partial<CheckoutState>)?.selection ?? {}),
        },
      }),
    },
  ),
)
