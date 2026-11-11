'use client'

// As formas de pagamento liberadas para o cliente do orçamento (correção do
// LITE, 11/11/2026): a forma de pagamento, a entrada e as parcelas só
// oferecem as do cadastro do cliente. Nulo: o cliente não restringe (ou o
// plano não confere crédito), e valem todas.

import { createContext, useContext } from 'react'

export const AllowedConditionsContext = createContext<string[] | null>(null)

export const useAllowedConditions = () => useContext(AllowedConditionsContext)
