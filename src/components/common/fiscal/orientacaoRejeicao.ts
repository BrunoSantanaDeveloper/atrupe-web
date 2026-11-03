/**
 * Quando a providência de uma recusa está fora da nota (habilitação na SEFAZ,
 * licença no provedor fiscal, CSC), o backend grava depois do retorno da
 * autorizadora um parágrafo que começa com "O que fazer (<onde>): ...". Na
 * NFC-e ele vem depois de uma linha em branco; na NF-e, na mesma linha.
 *
 * Separar os dois deixa o modal mostrar o retorno como veio e destacar a
 * orientação — sem ela, quem lia "Emissor nao habilitado" achava que a falha
 * era do Atrupe.
 */
const MARCADOR = 'O que fazer ('

export interface MotivoSeparado {
  retorno: string
  orientacao: { onde: string | null; texto: string } | null
}

export function separarOrientacao(motivo: string): MotivoSeparado {
  const inicio = motivo.indexOf(MARCADOR)
  if (inicio < 0) return { retorno: motivo, orientacao: null }

  const retorno = motivo.slice(0, inicio).replace(/[\s.]+$/, '')
  const paragrafo = motivo.slice(inicio).trim()
  const partes = /^O que fazer \(([^)]*)\):\s*([\s\S]*)$/.exec(paragrafo)
  const texto = partes ? partes[2] : paragrafo

  return {
    retorno,
    orientacao: {
      onde: partes ? partes[1] : null,
      texto: texto.charAt(0).toUpperCase() + texto.slice(1),
    },
  }
}
