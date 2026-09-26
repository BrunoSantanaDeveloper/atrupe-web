// Formatador de dinheiro que respeita a permissão de valores (design.md §9).
//
// Custo, preço, saldo e margem dependem de `values:values:view` somada à
// permissão da tela. Em telas de cadastro (materiais, processos, contas),
// bloquear a rota inteira esconderia o cadastro de quem só não pode ver os
// números; aqui o cadastro continua acessível e só o valor fica oculto, com
// a mesma máscara que o perfil de vendedor já usa.

// React
import { useCallback } from 'react'

// Hooks
import { usePermissions } from '@/hooks/usePermissions'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

export const HIDDEN_VALUE = '••••••'

export function useCanSeeValues() {
  const { hasAnyPermission } = usePermissions()
  return hasAnyPermission(['values:values:view'])
}

// Valores em centavos. Valor não calculado nunca vira R$ 0,00 (§7)
export function useMoney() {
  const canSee = useCanSeeValues()

  return useCallback(
    (value: number | null | undefined, empty = '-') => {
      if (!canSee) return HIDDEN_VALUE
      if (value === null || value === undefined) return empty
      return formatCurrencyToBrl(value)
    },
    [canSee],
  )
}
