type PdfFileNameData = {
  quotation?: {
    number?: number | string | null
    seriesCode?: string | null
  } | null
  client?: { name?: string | null } | null
}

const sanitize = (value: string) =>
  value
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .trim()

/**
 * Monta o nome do arquivo PDF a partir do retorno de
 * `sale/quotation/:id/pdf-data`, única fonte que traz número e série juntos.
 * Usar o objeto da O.S. aqui gera `undefined` no nome, pois lá o número fica
 * em `quotation.serie.quotation`, não em `quotation.quotationNumber`.
 */
export function buildPdfFileName(
  data: PdfFileNameData,
  type: 'quotation' | 'order' | 'production',
) {
  const prefix = type === 'quotation' ? 'ORC' : 'OS'
  const clientName = sanitize(data?.client?.name ?? '')
  const osCode = [data?.quotation?.seriesCode, data?.quotation?.number]
    .filter((part) => part !== null && part !== undefined && part !== '')
    .join('-')

  return `${prefix}${osCode ? `-${osCode}` : ''}${clientName ? `_${clientName}` : ''}.pdf`
}
