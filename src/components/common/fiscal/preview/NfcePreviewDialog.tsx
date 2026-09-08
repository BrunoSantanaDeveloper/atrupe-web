'use client'

import type { NfcePreview } from '@/types/fiscal/nfce-preview'
import { CupomPreviewPdf } from './CupomPreviewPdf'
import { FiscalPreviewDialog, formatarReais } from './FiscalPreviewDialog'
import type { ResumoPrevia } from './FiscalPreviewDialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  previa: NfcePreview | null
  isEmitting?: boolean
  onEmit: () => void
}

export function NfcePreviewDialog({
  open,
  onOpenChange,
  previa,
  isEmitting,
  onEmit,
}: Props) {
  const doc = previa?.documento

  const resumo: ResumoPrevia[] = doc
    ? [
        {
          rotulo: 'Número previsto',
          valor: `${doc.numeroPrevisto} / ${doc.serie}`,
        },
        {
          rotulo: 'Ambiente',
          valor: doc.ambiente === 'PRODUCAO' ? 'Produção' : 'Homologação',
        },
        { rotulo: 'Itens', valor: String(previa?.itens?.length ?? 0) },
        {
          rotulo: 'Total do cupom',
          valor: formatarReais(previa?.totais?.ICMStot?.vNF),
        },
        {
          rotulo: 'Consumidor',
          valor: previa?.consumidor
            ? `${previa.consumidor.xNome_dest ?? ''} ${
                previa.consumidor.CPF_dest ?? previa.consumidor.CNPJ_dest ?? ''
              }`.trim()
            : 'Não identificado',
          largura: 'total',
        },
      ]
    : []

  return (
    <FiscalPreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      titulo="Pré-visualização da NFC-e"
      rotuloEmitir="Emitir agora"
      podeEmitir={!!previa?.podeEmitir}
      bloqueios={previa?.bloqueios ?? []}
      avisos={previa?.avisos ?? []}
      resumo={resumo}
      documentoPdf={() => <CupomPreviewPdf previa={previa as NfcePreview} />}
      isEmitting={isEmitting}
      onEmit={onEmit}
    />
  )
}
