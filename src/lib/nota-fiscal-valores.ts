/**
 * Valores de item e totais da nota fiscal, como o backend manda ao XML
 * (atrupe-back/src/core/fiscal/utils/fiscal-line-values.util.ts): cada item
 * com a quantidade em 4 casas e vProd/vDesc em 2, e os totais somando os
 * itens já arredondados — a SEFAZ confere cada total com a soma dos itens.
 *
 * Somar sem arredondar fazia a tela mostrar um centavo diferente do vNF
 * (0,5 x 45,99 = 22,995 vira 23,00 no item), e na NFC-e o pagamento da tela
 * ficava abaixo da nota.
 */

/**
 * Arredonda meio para cima em `casas` decimais. O `toPrecision` tira o ruído
 * binário antes (1,005 x 100 dá 100,49999…, e o `Math.round` puro erraria).
 */
export function arredondar(valor: number, casas: number): number {
  const fator = 10 ** casas
  return Math.round(Number((valor * fator).toPrecision(15))) / fator
}

interface ItemDaNota {
  quantity: number
  unitValue: number
  discount?: number | null
}

/** vProd e vDesc do item, em reais, como vão ao XML. */
export function valoresDoItemNaNota(item: ItemDaNota): {
  valorProduto: number
  desconto: number
} {
  const quantidade = arredondar(item.quantity || 0, 4)
  return {
    valorProduto: arredondar(quantidade * (item.unitValue || 0), 2),
    desconto: arredondar(item.discount || 0, 2),
  }
}

/** Produtos, descontos e o líquido (sem frete e seguro) da nota. */
export function totaisDosItensNaNota(itens: ItemDaNota[]): {
  valorProdutos: number
  valorDesconto: number
  valorTotal: number
} {
  let produtos = 0
  let desconto = 0
  for (const item of itens) {
    const valores = valoresDoItemNaNota(item)
    produtos += valores.valorProduto
    desconto += valores.desconto
  }
  const valorProdutos = arredondar(produtos, 2)
  const valorDesconto = arredondar(desconto, 2)
  return {
    valorProdutos,
    valorDesconto,
    valorTotal: arredondar(valorProdutos - valorDesconto, 2),
  }
}
