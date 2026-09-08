'use client'

import type { NfsePreview } from '@/types/fiscal/nfse-preview'
import { DanfsePreviewPdf } from './DanfsePreviewPdf'
import { FiscalPreviewDialog, formatarReais } from './FiscalPreviewDialog'
import type { ResumoPrevia } from './FiscalPreviewDialog'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  previa: NfsePreview | null
  isEmitting?: boolean
  onEmit: () => void
}

export function NfsePreviewDialog({
  open,
  onOpenChange,
  previa,
  isEmitting,
  onEmit,
}: Props) {
  const doc = previa?.documento
  const valores = previa?.valores

  const resumo: ResumoPrevia[] = doc
    ? [
        {
          rotulo: 'RPS previsto',
          valor: `${doc.rpsPrevisto} / ${doc.rpsSerie}`,
        },
        {
          rotulo: 'Ambiente',
          valor: doc.ambiente === 'HOMOLOGACAO' ? 'Homologação' : 'Produção',
        },
        {
          rotulo: 'Serviços',
          valor: formatarReais(valores?.valorServicos),
        },
        {
          rotulo: 'ISS',
          valor: formatarReais(valores?.valorIss),
        },
        {
          rotulo: 'Código do serviço',
          valor: previa?.servico?.codigoServico || '—',
          largura: 'total',
        },
      ]
    : []

  return (
    <FiscalPreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      titulo="Pré-visualização da NFS-e"
      rotuloEmitir="Emitir agora"
      podeEmitir={!!previa?.podeEmitir}
      bloqueios={previa?.bloqueios ?? []}
      avisos={previa?.avisos ?? []}
      resumo={resumo}
      documentoPdf={() => <DanfsePreviewPdf previa={previa as NfsePreview} />}
      isEmitting={isEmitting}
      onEmit={onEmit}
    />
  )
}
