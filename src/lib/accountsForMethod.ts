// Qual conta vem escolhida na baixa (regra do produto, 23/10/2026)
//
// Depois da data, a pessoa escolhe a forma de pagamento; aparecem só as
// contas ativas que recebem (ou pagam) naquela forma, e a primeira já vem
// escolhida:
// - dinheiro: a Caixa Empresa (a gaveta do cadastro da empresa, banco 000);
//   sem ela, a primeira conta Caixa físico; depois as demais;
// - as outras formas: a primeira conta cadastrada que aceita a forma.
// A tela pode trocar quando há mais de uma. Sem "conta padrão" marcada.

import type { BankAccount } from '@/app/(app-sidebar)/financeiro/controle-de-caixa/types'

const isCashMethod = (name: string) => {
  // Sem acento para comparar: "Dinheiro", "Espécie"
  const plain = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  return /dinheiro|especie/.test(plain)
}

export function accountsForMethod(
  accounts: BankAccount[],
  methodId: string,
  direction: 'receivable' | 'payable' = 'receivable',
): BankAccount[] {
  if (!methodId) return []
  const accepts = (account: BankAccount) =>
    account.rules.some(
      (rule) =>
        rule.methodId === methodId &&
        (direction === 'payable' ? rule.acceptPayments : rule.acceptIncomes),
    )
  const list = accounts.filter(
    (account) => account.isActive && accepts(account),
  )
  const methodName =
    list[0]?.rules.find((rule) => rule.methodId === methodId)?.methodName ?? ''
  const cash = isCashMethod(methodName)
  const rank = (account: BankAccount) => {
    if (!cash) return 0
    if (account.bankCode === '000') return 0
    return account.kind === 'CASH' ? 1 : 2
  }
  return [...list].sort(
    (a, b) =>
      rank(a) - rank(b) || (a.createdAt ?? '').localeCompare(b.createdAt ?? ''),
  )
}
