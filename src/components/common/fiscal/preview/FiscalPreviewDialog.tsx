'use client'

import { useState, type ReactElement } from 'react'
// EC-3: o @react-pdf/renderer não entra no topo do arquivo — só o tipo, que
// some na compilação. A biblioteca é carregada dentro do clique
import type { DocumentProps } from '@react-pdf/renderer'
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

export interface ResumoPrevia {
  rotulo: string
  valor: string
  /** Ocupa a linha inteira; use para textos longos, como a natureza. */
  largura?: 'total'
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  titulo: string
  rotuloEmitir: string
  podeEmitir: boolean
  bloqueios: string[]
  avisos: string[]
  resumo: ResumoPrevia[]
  /** Só é montado quando o usuário pede o PDF. */
  documentoPdf: () => ReactElement<DocumentProps>
  isEmitting?: boolean
  onEmit: () => void
}

/**
 * Conferência antes de emitir: bloqueios e avisos em tela, e o documento
 * completo num PDF sem valor fiscal.
 *
 * O PDF é gerado no navegador (mesmo caminho do recibo e dos relatórios) a
 * partir do payload que o backend montou — não é uma segunda versão dos
 * dados, é o que seria transmitido.
 */
export function FiscalPreviewDialog({
  open,
  onOpenChange,
  titulo,
  rotuloEmitir,
  podeEmitir,
  bloqueios,
  avisos,
  resumo,
  documentoPdf,
  isEmitting,
  onEmit,
}: Props) {
  const [gerandoPdf, setGerandoPdf] = useState(false)

  const abrirPdf = async () => {
    setGerandoPdf(true)
    try {
      const { pdf } = await import('@react-pdf/renderer')
      const blob = await pdf(documentoPdf()).toBlob()
      const url = URL.createObjectURL(blob)
      if (!window.open(url, '_blank')) {
        toast.error('Permita a abertura de pop-ups para ver a pré-visualização')
      }
    } catch (error) {
      toast.error('Não foi possível gerar a pré-visualização')
      console.error(error)
    } finally {
      setGerandoPdf(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconFileTypePdf} />
              <span>{titulo}</span>
            </div>
          </DialogTitle>
          <DialogDescription>
            Confira antes de transmitir. Nada foi enviado ainda e nenhum número
            de documento foi consumido.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
          <ScrollArea className="max-h-[55vh]">
            <div className="space-y-4 pr-2">
              {bloqueios.length > 0 && (
                <Painel
                  variante="erro"
                  Icone={IconAlertTriangle}
                  titulo="A nota não pode ser emitida assim"
                  itens={bloqueios}
                />
              )}

              {resumo.length > 0 && (
                <div className="grid grid-cols-2 gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-4">
                  {resumo.map((campo) => (
                    <div
                      key={campo.rotulo}
                      className={
                        campo.largura === 'total'
                          ? 'col-span-2 sm:col-span-4'
                          : undefined
                      }
                    >
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">
                        {campo.rotulo}
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {campo.valor}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {avisos.length > 0 && (
                <Painel
                  variante="aviso"
                  Icone={IconInfoCircle}
                  titulo="Confira antes de emitir"
                  itens={avisos}
                />
              )}

              {podeEmitir && (
                <p className="text-xs text-gray-500">
                  Abra o PDF para conferir o documento completo exatamente como
                  ele sairá.
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
            disabled={gerandoPdf}
            isLoading={gerandoPdf}
          >
            Abrir PDF
          </Button>
          <Button
            type="button"
            RightIcon={IconCircleCheck}
            onClick={onEmit}
            disabled={!podeEmitir || isEmitting}
            isLoading={isEmitting}
          >
            {rotuloEmitir}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Painel({
  variante,
  Icone,
  titulo,
  itens,
}: {
  variante: 'erro' | 'aviso'
  Icone: typeof IconAlertTriangle
  titulo: string
  itens: string[]
}) {
  const erro = variante === 'erro'
  return (
    <div
      className={
        erro
          ? 'rounded-lg border border-error-200 bg-error-50 p-4'
          : 'rounded-lg border border-warning-200 bg-warning-50 p-4'
      }
    >
      <div className="flex items-start gap-3">
        <Icone
          className={`mt-0.5 size-5 shrink-0 ${
            erro ? 'text-error-600' : 'text-warning-600'
          }`}
        />
        <div>
          <p
            className={`text-sm font-semibold ${
              erro ? 'text-error-800' : 'text-warning-800'
            }`}
          >
            {titulo}
          </p>
          <ul className="mt-1 space-y-1">
            {itens.map((item, i) => (
              <li
                key={i}
                className={`text-xs ${
                  erro ? 'text-error-700' : 'text-warning-700'
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/** Reais no formato brasileiro; a prévia recebe valores já em reais. */
export const formatarReais = (valor?: string | number | null) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor ?? 0) || 0)
