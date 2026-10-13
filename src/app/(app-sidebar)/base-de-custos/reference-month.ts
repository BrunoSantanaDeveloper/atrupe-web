// O mês de referência que a API manda em toda resposta da base de custos: o
// último mês completo, em AAAA-MM (DC-17). Na tela, "ago/2026"
export const formatReferenceMonth = (month?: string) => {
  const [year, monthNumber] = (month || '').split('-').map(Number)

  if (!year || !monthNumber) return ''

  return new Date(year, monthNumber - 1, 1)
    .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    .replace('.', '')
    .replace(' de ', '/')
}
