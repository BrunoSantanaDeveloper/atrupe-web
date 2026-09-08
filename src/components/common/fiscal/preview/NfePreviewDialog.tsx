'use client'

import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { toast } from 'sonner'
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconFileTypePdf,
  IconInfoCircle,
} from '@tabler/icons-react'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { ScrollArea } from '@/components/ui/scroll-area'

import type { NfePreview } from '@/types/fiscal/nfe-preview'
import { DanfePreviewPdf } from './DanfePreviewPdf'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  previa: NfePreview | null
  isEmitting?: boolean
  onEmit: () => void
}

/**
 * Conferência antes de emitir: bloqueios e avisos em tela, e a nota completa
 * num PDF no formato da DANFE, sem valor fiscal.
 *
 * O PDF é gerado aqui no navegador (mesmo caminho do recibo e dos relatórios)
 * a partir do payload que o backend montou — não é uma segunda versão dos
 * dados, é o que seria transmitido.
 */
export function NfePreviewDialog({
  open,
  onOpenChange,
  previa,
  isEmitting,
  onEmit,
}: Props) {
  const [gerandoPdf, setGerandoPdf] = useState(false)

  const abrirPdf = async () => {
    if (!previa) return
    setGerandoPdf(true)
    try {
      const blob = await pdf(<DanfePreviewPdf previa={previa} />).toBlob()
      const url = URL.createObjectURL(blob)
      const aba = window.open(url, '_blank')
      if (!aba) {
        toast.error('Permita a abertura de pop-ups para ver a pré-visualização')
      }
    } catch (error) {
      toast.error('Não foi possível gerar a pré-visualização')
      console.error(error)
    } finally {
      setGerandoPdf(false)
    }
  }

  const doc = previa?.documento
  const bloqueios = previa?.bloqueios ?? []
  const avisos = previa?.avisos ?? []
  const totalDaNota = previa?.totais?.ICMStot?.vNF

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconFileTypePdf} />
              <span>Pré-visualização da NF-e</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            Confira antes de transmitir. Nada foi enviado à SEFAZ e nenhum
            número de nota foi consumido.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <ScrollArea className="max-h-[55vh]">
            <div className="space-y-4 pr-2">
              {bloqueios.length > 0 && (
                <div className="rounded-lg border border-error-200 bg-error-50 p-4">
                  <div className="flex items-start gap-3">
                    <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-error-600" />
                    <div>
                      <p className="text-sm font-semibold text-error-800">
                        A nota não pode ser emitida assim
                      </p>
                      <ul className="mt-1 space-y-1">
                        {bloqueios.map((bloqueio, i) => (
                          <li key={i} className="text-xs text-error-700">
                            {bloqueio}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {doc && (
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-4">
                  <Resumo
                    rotulo="Número previsto"
                    valor={`${doc.numeroPrevisto} / ${doc.serie}`}
                  />
                  <Resumo
                    rotulo="Ambiente"
                    valor={
                      doc.ambiente === 'HOMOLOGACAO'
                        ? 'Homologação'
                        : 'Produção'
                    }
                  />
                  <Resumo
                    rotulo="Itens"
                    valor={String(previa?.itens?.length ?? 0)}
                  />
                  <Resumo
                    rotulo="Total da nota"
                    valor={new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(Number(totalDaNota ?? 0) || 0)}
                  />
                  <div className="col-span-2 sm:col-span-4">
                    <Resumo
                      rotulo="Natureza da operação"
                      valor={doc.naturezaOperacao}
                    />
                  </div>
                </div>
              )}

              {avisos.length > 0 && (
                <div className="rounded-lg border border-warning-200 bg-warning-50 p-4">
                  <div className="flex items-start gap-3">
                    <IconInfoCircle className="mt-0.5 size-5 shrink-0 text-warning-600" />
                    <div>
                      <p className="text-sm font-semibold text-warning-800">
                        Confira antes de emitir
                      </p>
                      <ul className="mt-1 space-y-1">
                        {avisos.map((aviso, i) => (
                          <li key={i} className="text-xs text-warning-700">
                            {aviso}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {previa?.podeEmitir && (
                <p className="text-xs text-gray-500">
                  Abra o PDF para conferir emitente, destinatário, itens com
                  NCM, CFOP e impostos, totais e informações complementares
                  exatamente como sairão na nota.
                </p>
              )}
            </div>
          </ScrollArea>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Ajustar
          </Button>
          <Button
            type="button"
            variant="neutralOutline"
            LeftIcon={IconFileTypePdf}
            onClick={abrirPdf}
            disabled={!previa || gerandoPdf}
            isLoading={gerandoPdf}
          >
            Abrir PDF
          </Button>
          <Button
            type="button"
            RightIcon={IconCircleCheck}
            onClick={onEmit}
            disabled={!previa?.podeEmitir || isEmitting}
            isLoading={isEmitting}
          >
            Emitir agora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-gray-500">
        {rotulo}
      </p>
      <p className="text-sm font-medium text-gray-800">{valor}</p>
    </div>
  )
}
