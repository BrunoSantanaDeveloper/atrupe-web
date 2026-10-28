'use client'

// O comprovante da venda de balcão (FC-16; decisão do produto, 26/10/2026):
// sai a pedido, em dois formatos — A4 com duas vias na mesma folha (cliente
// e empresa, corte no meio) e impressora térmica de 80 mm. Não é a proposta:
// a "Prévia da proposta" fica para o orçamento com cliente informado.
// O HTML é montado aqui e impresso numa janela própria, fora do CSS do app.

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconFileTypePdf, IconReceipt } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { getData, getItemOld } from '@/actions/_cruds'
import { getQuickSaleCheckout } from '@/actions/cash-front'
import { formatMoney } from '@/lib/utils'
import type { QuotationType } from '@/types/sales/quotation'
import type { QuickSaleCheckout } from '../types'
import { paymentMethodLabel } from '../types'

type Layout = 'a4' | 'thermal'

type Company = {
  isActive?: boolean
  general?: {
    name?: string
    legalName?: string
    cnpj?: string
    phone?: string
    mobile?: string
  }
  address?: {
    street?: string
    number?: string
    neighborhood?: string
    city?: string
    state?: string
  } | null
}

const esc = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const when = (iso?: string) =>
  new Date(iso || Date.now()).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

/** O conteúdo de uma via: cabeçalho da empresa, itens, total e pagamento. */
function viaHtml(
  quotation: QuotationType,
  checkout: QuickSaleCheckout | null,
  company: Company | undefined,
  via: 'Via do cliente' | 'Via da empresa',
) {
  const general = company?.general ?? {}
  const address = company?.address
  const addressLine = address
    ? [
        [address.street, address.number].filter(Boolean).join(', '),
        address.neighborhood,
        [address.city, address.state].filter(Boolean).join(' - '),
      ]
        .filter(Boolean)
        .join(' · ')
    : ''
  const items = quotation.quotationItems ?? []
  const rows = items
    .map((item) => {
      const quantity = item.product?.quantity || 1
      const total = item.finalValue ?? 0
      const lines = (item.lines ?? [])
        .map(
          (line) =>
            `<tr class="line"><td colspan="3">&nbsp;&nbsp;+ ${esc(line.name)}</td><td class="r">${formatMoney(line.price ?? 0)}</td></tr>`,
        )
        .join('')
      return `<tr><td class="r">${quantity}</td><td>${esc(item.description || item.product?.name || 'Item')}</td><td class="r">${formatMoney(Math.round(total / quantity))}</td><td class="r">${formatMoney(total)}</td></tr>${lines}`
    })
    .join('')
  const total = checkout?.total ?? quotation.totalValue ?? 0
  const paid = checkout?.paid ?? 0
  const parts = (checkout?.parts ?? [])
    .map(
      (part) =>
        `<tr><td colspan="3">${esc(paymentMethodLabel[part.method] ?? part.method)}</td><td class="r">${formatMoney(part.amount)}</td></tr>`,
    )
    .join('')
  const reference = `${quotation.serie?.quotation ?? ''}-${quotation.serie?.code ?? ''}`
  return `
  <section class="via">
    <header>
      <div class="company">${esc(general.name || general.legalName || '')}</div>
      <div class="muted">${general.cnpj ? `CNPJ ${esc(general.cnpj)}` : ''}${general.phone ? ` · ${esc(general.phone)}` : ''}</div>
      ${addressLine ? `<div class="muted">${esc(addressLine)}</div>` : ''}
    </header>
    <div class="title">Comprovante de venda <span class="muted">nº ${esc(reference)}</span></div>
    <div class="meta">${esc(when(checkout?.sentAt))}${quotation.client?.name ? ` · Cliente: ${esc(quotation.client.name)}` : ''}${quotation.seller?.name ? ` · Vendedor: ${esc(quotation.seller.name)}` : ''}</div>
    <table>
      <thead><tr><th class="r">Qtd</th><th>Item</th><th class="r">Unit.</th><th class="r">Total</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr class="total"><td colspan="3">Total</td><td class="r">${formatMoney(total)}</td></tr>
        ${parts}
        ${paid < total ? `<tr><td colspan="3">Em aberto</td><td class="r">${formatMoney(total - paid)}</td></tr>` : ''}
      </tfoot>
    </table>
    <footer>${via}</footer>
  </section>`
}

function receiptHtml(
  layout: Layout,
  quotation: QuotationType,
  checkout: QuickSaleCheckout | null,
  company: Company | undefined,
) {
  const base = `
    *{box-sizing:border-box} body{margin:0;color:#111;font-family:Arial,Helvetica,sans-serif}
    .via{display:flex;flex-direction:column} header{margin-bottom:6px}
    .company{font-weight:700} .muted{color:#555} .title{font-weight:700;margin:6px 0 2px}
    .meta{margin-bottom:6px} table{width:100%;border-collapse:collapse}
    th,td{padding:2px 4px;vertical-align:top;text-align:left} th{border-bottom:1px solid #999}
    td.r,th.r{text-align:right;white-space:nowrap} tr.line td{color:#555}
    tfoot tr.total td{border-top:1px solid #999;font-weight:700}
    footer{margin-top:auto;padding-top:8px;text-align:center;color:#555;font-weight:700;letter-spacing:.04em;text-transform:uppercase}`
  const a4 = `
    @page{size:A4;margin:10mm} body{font-size:12px}
    .via{height:135mm;padding:2mm 0} .cut{border-top:1px dashed #999;margin:3mm 0;text-align:center;color:#999;font-size:10px;line-height:0}
    .cut span{background:#fff;padding:0 6px;position:relative;top:-7px}`
  const thermal = `
    @page{size:80mm auto;margin:3mm} body{width:74mm;font-size:11px}
    .via{min-height:auto} th,td{padding:1px 2px} footer{margin-top:10px}`
  const vias =
    layout === 'a4'
      ? viaHtml(quotation, checkout, company, 'Via do cliente') +
        '<div class="cut"><span>corte aqui</span></div>' +
        viaHtml(quotation, checkout, company, 'Via da empresa')
      : viaHtml(quotation, checkout, company, 'Via do cliente')
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Comprovante</title><style>${base}${layout === 'a4' ? a4 : thermal}</style></head><body>${vias}<script>window.onload=function(){window.print()}</script></body></html>`
}

interface Props {
  quotationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaleReceiptDialog({ quotationId, open, onOpenChange }: Props) {
  const [printing, setPrinting] = useState<Layout | null>(null)

  const { data: quotationRes } = useQuery({
    enabled: open && !!quotationId,
    queryKey: ['receipt-quotation', quotationId],
    queryFn: () =>
      getItemOld({
        route: 'quotationRoute',
        id: quotationId,
      }) as Promise<QuotationType | null>,
  })
  const { data: checkoutRes } = useQuery({
    enabled: open && !!quotationId,
    queryKey: ['receipt-checkout', quotationId],
    queryFn: () => getQuickSaleCheckout(quotationId),
  })
  const { data: companyRes } = useQuery({
    enabled: open,
    staleTime: Infinity,
    queryKey: ['receipt-company'],
    queryFn: () => getData({ route: '/company' }),
  })

  const print = (layout: Layout) => {
    const quotation = quotationRes
    if (!quotation) return toast.error('A venda ainda está carregando.')
    const companies = (companyRes?.data ?? []) as Company[]
    const company = companies.find((item) => item.isActive) ?? companies[0]
    const checkout = checkoutRes?.success ? checkoutRes.data : null
    setPrinting(layout)
    // Janela própria: o navegador abre a impressão com o papel certo
    const win = window.open('', '_blank', 'width=720,height=900')
    if (!win) {
      setPrinting(null)
      return toast.error('O navegador bloqueou a janela do comprovante.')
    }
    win.document.open()
    win.document.write(receiptHtml(layout, quotation, checkout, company))
    win.document.close()
    setPrinting(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Comprovante</DialogTitle>
          <DialogDescription>
            Em A4 saem duas vias na mesma folha, uma para o cliente e outra para
            a empresa, com a linha de corte no meio. Na térmica sai a via do
            cliente, em 80 mm.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="neutralOutline"
            LeftIcon={IconFileTypePdf}
            isLoading={printing === 'a4'}
            disabled={!quotationRes}
            onClick={() => print('a4')}
          >
            A4 · duas vias
          </Button>
          <Button
            type="button"
            variant="neutralOutline"
            LeftIcon={IconReceipt}
            isLoading={printing === 'thermal'}
            disabled={!quotationRes}
            onClick={() => print('thermal')}
          >
            Térmica 80 mm
          </Button>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
