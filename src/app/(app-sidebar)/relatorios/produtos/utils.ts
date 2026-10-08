/** Quantidade com 2 casas decimais, como no relatório do legado (486,50). */
export function formatQuantity(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * O backend devolve a unidade no formato que a NF-e exige (ASCII, até 6
 * caracteres). Na tela e no PDF mostramos o símbolo usual.
 */
const UNIT_LABELS: Record<string, string> = {
  M2: 'M²',
}

export function formatUnit(unit: string) {
  return UNIT_LABELS[unit] || unit
}
