'use client'

import type { NfePreview } from '@/types/fiscal/nfe-preview'
import { DanfePreviewPdf } from './DanfePreviewPdf'
import { FiscalPreviewDialog, formatarReais } from './FiscalPreviewDialog'
import type { ResumoPrevia } from './FiscalPreviewDialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  previa: NfePreview | null
  isEmitting?: boolean
  onEmit: () => void
}

export function NfePreviewDialog({
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
          valor: doc.ambiente === 'HOMOLOGACAO' ? 'Homologação' : 'Produção',
        },
        { rotulo: 'Itens', valor: String(previa?.itens?.length ?? 0) },
        {
          rotulo: 'Total da nota',
          valor: formatarReais(previa?.totais?.ICMStot?.vNF),
        },
        {
          rotulo: 'Natureza da operação',
          valor: doc.naturezaOperacao,
          largura: 'total',
        },
      ]
    : []

  return (
    <FiscalPreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      titulo="Pré-visualização da NF-e"
      rotuloEmitir="Emitir agora"
      podeEmitir={!!previa?.podeEmitir}
      bloqueios={previa?.bloqueios ?? []}
      avisos={previa?.avisos ?? []}
      resumo={resumo}
      documentoPdf={() => <DanfePreviewPdf previa={previa as NfePreview} />}
      isEmitting={isEmitting}
      onEmit={onEmit}
    />
  )
}
