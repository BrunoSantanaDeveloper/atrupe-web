import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { IconReceipt } from '@tabler/icons-react'

import type { EmissionResult } from './pdv-types'
import { formatBRL } from './pdv-types'

interface PdvTotalsPanelProps {
  totalItens: number
  totalDescontos: number
  totalNota: number
  totalPago: number
  troco: number
  isEmitting: boolean
  hasItems: boolean
  onEmitir: () => void
  resultDialog: boolean
  onResultDialogChange: (open: boolean) => void
  emissionResult: EmissionResult | null
}

export function PdvTotalsPanel({
  totalItens,
  totalDescontos,
  totalNota,
  totalPago,
  troco,
  isEmitting,
  hasItems,
  onEmitir,
  resultDialog,
  onResultDialogChange,
  emissionResult,
}: PdvTotalsPanelProps) {
  const isDisabled = isEmitting || !hasItems

  return (
    <>
      <Card className="border-brand/30 bg-brand-50/30">
        <CardContent className="pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span>{formatBRL(totalItens)}</span>
          </div>
          {totalDescontos > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Descontos</span>
              <span className="text-error-500">
                -{formatBRL(totalDescontos)}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatBRL(totalNota)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pago</span>
            <span
              className={
                totalPago >= totalNota
                  ? 'text-success-600'
                  : 'text-error-500'
              }
            >
              {formatBRL(totalPago)}
            </span>
          </div>
          {troco > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Troco</span>
              <span className="text-brand-600 font-medium">
                {formatBRL(troco)}
              </span>
            </div>
          )}
          <Separator />
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  className="w-full h-12 text-base"
                  onClick={onEmitir}
                  disabled={isDisabled}
                  isLoading={isEmitting}
                >
                  <IconReceipt className="h-5 w-5 mr-2" />
                  {isEmitting ? 'Emitindo...' : 'Emitir NFC-e'}
                </Button>
              </div>
            </TooltipTrigger>
            {isDisabled && !isEmitting && (
              <TooltipContent>
                Adicione ao menos um item para emitir
              </TooltipContent>
            )}
          </Tooltip>
        </CardContent>
      </Card>

      <Dialog open={resultDialog} onOpenChange={onResultDialogChange}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-success-600 flex items-center gap-2">
              <IconReceipt className="h-5 w-5" />
              NFC-e Emitida!
            </DialogTitle>
            <DialogDescription>
              A nota fiscal de consumidor foi emitida com sucesso.
            </DialogDescription>
          </DialogHeader>
          {emissionResult && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 block">Número</span>
                  <span className="font-medium">{emissionResult.numero}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Série</span>
                  <span className="font-medium">{emissionResult.serie}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Status</span>
                  <Badge variant="success">
                    {emissionResult.status === 'AUTHORIZED'
                      ? 'Autorizada'
                      : emissionResult.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500 block">Valor</span>
                  <span className="font-medium">
                    {formatBRL(emissionResult.valorTotal || 0)}
                  </span>
                </div>
              </div>
              {emissionResult.chaveAcesso && (
                <div className="text-xs break-all bg-gray-50 p-2 rounded">
                  <span className="text-gray-500 block mb-1">
                    Chave de Acesso:
                  </span>
                  {emissionResult.chaveAcesso}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {emissionResult.danfeUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      window.open(emissionResult.danfeUrl, '_blank')
                    }
                  >
                    Ver DANFE
                  </Button>
                )}
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => onResultDialogChange(false)}
                >
                  Nova Venda
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
