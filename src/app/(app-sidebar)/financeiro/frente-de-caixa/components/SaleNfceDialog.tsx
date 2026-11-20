'use client'

// A NFC-e da venda recebida na frente de caixa (pedido do Maicol, 20/11/2026).
// A frente de caixa não identifica o cliente: emite NFC-e, sempre à mão, pelo
// CNPJ cadastrado, com o CPF opcional. NF-e e NFS-e ficam para a venda
// transferida ao fluxo financeiro com o cliente identificado. Emitida, abre o
// cupom no layout da impressora térmica.

// React
import { useEffect, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// Actions
import { emitSaleNfce } from '@/actions/cash-front'

// Third-party
import { toast } from 'sonner'

/** O cupom da NFC-e no layout da impressora térmica (80 mm). */
export const openNfceThermal = (nfceId: string) =>
  window.open(`/api/fiscal/nfce/${nfceId}/thermal`, '_blank')

const maskCpf = (value: string) =>
  value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')

export function SaleNfceDialog({
  sale,
  onDone,
  onOpenChange,
}: {
  sale?: { saleId: string; description: string }
  onDone: () => void
  onOpenChange: (open: boolean) => void
}) {
  const [cpf, setCpf] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (sale) setCpf('')
  }, [sale])

  const digits = cpf.replace(/\D/g, '')
  const invalid = digits.length > 0 && digits.length !== 11

  const emit = async () => {
    if (!sale || invalid) return
    setSaving(true)
    const res = await emitSaleNfce(sale.saleId, digits || undefined)
    setSaving(false)

    if (!res.success || !res.data) return toast.error(res.message)

    const status = res.data.status
    if (status === 'AUTHORIZED' || status === 'CONTINGENCY') {
      toast.success(
        status === 'CONTINGENCY'
          ? 'NFC-e emitida em contingência'
          : res.data.numero
            ? `NFC-e ${res.data.numero} autorizada`
            : 'NFC-e autorizada',
      )
      openNfceThermal(res.data.id)
    } else if (status === 'REJECTED') {
      toast.error(
        'A NFC-e foi rejeitada. Veja o motivo em Nota fiscal › Notas emitidas',
      )
    } else {
      toast.info(
        'A NFC-e foi enviada e aguarda a resposta da Sefaz. O cupom fica disponível quando for autorizada.',
      )
    }
    onDone()
    onOpenChange(false)
  }

  return (
    <Dialog open={!!sale} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Emitir NFC-e</DialogTitle>
          <DialogDescription>
            {sale?.description} · a nota sai pelo CNPJ da empresa. Depois de
            autorizada, o cupom abre para a impressora térmica.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-2">
          <Label htmlFor="nfce-cpf">CPF na nota (opcional)</Label>
          <Input
            id="nfce-cpf"
            autoFocus
            inputMode="numeric"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={(event) => setCpf(maskCpf(event.target.value))}
          />
          {invalid ? (
            <p className="text-xs text-error">O CPF tem 11 números.</p>
          ) : (
            <p className="text-xs text-gray">
              Para nota com CNPJ (NF-e) ou de serviço (NFS-e), fature a venda
              para o cliente e emita pelo fluxo financeiro.
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            isLoading={saving}
            disabled={invalid}
            onClick={emit}
          >
            Emitir NFC-e
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
