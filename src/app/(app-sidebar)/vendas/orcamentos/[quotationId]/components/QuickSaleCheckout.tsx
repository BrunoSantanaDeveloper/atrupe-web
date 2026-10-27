'use client'

// O recebimento da venda cuja série fatura na frente de caixa, visto pelo
// vendedor: o lugar das condições de pagamento.
//
// Nessa série o vendedor não monta condição de pagamento (FC-1). Ele cobra
// na hora, à vista (dinheiro, PIX ou cartão), ou envia ao caixa, e quem
// recebe é o caixa (VR-5, revista em 26/10/2026: vale para a venda rápida e
// para o orçamento comum). Enviar é aprovar (FC-12), e a venda enviada trava
// (FC-11).
//
// Os dados vêm da API (Fase 7.3): a situação no caixa, o "Cobrar" e o
// enviar ao caixa passam por `src/actions/cash-front.ts`.

// React
import { useClientBlocked } from './useClientBlocked'
import { useEffect, useState } from 'react'

// Next
import Link from 'next/link'

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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { PermissionGate } from '@/components/common/PermissionGate'
import { SaleReceiptDialog } from '@/app/(app-sidebar)/financeiro/frente-de-caixa/components/SaleReceiptDialog'
import {
  useCashReceipt,
  CashReceiptFields,
  CashReceiptBalance,
} from '@/app/(app-sidebar)/financeiro/frente-de-caixa/components/PaymentSplit'
import { Form } from '@/components/ui/form'

// Types
import { QuotationType } from '@/types/sales/quotation'
import {
  roundingFor,
  paymentMethodLabel,
  type PaymentMethod,
  type QuickSaleCheckout,
} from '@/app/(app-sidebar)/financeiro/frente-de-caixa/types'

// Actions
import {
  sendQuickSaleToCash,
  chargeQuickSaleNow,
  getQuickSaleCheckout,
} from '@/actions/cash-front'
import { getQuickSaleSettings } from '@/actions/quick-sale'

// Third-party
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAlertDialog } from '@/store/useAlertDialog'

// Icons
import {
  IconCheck,
  IconCircleCheck,
  IconLock,
  IconBolt,
  IconPrinter,
  IconReceipt,
  IconCashRegister,
  IconCashBanknote,
  IconReceiptRefund,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Consts
import { quickSaleCheckoutStatusObj } from '@/consts/quickSale'

// Utils
import { cn } from '@/lib/utils'
import { useMoney } from '@/hooks/useMoney'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { FEATURES } from '@/consts/features'
import { calculatePaymentTotals } from './QuotationActions/PaymentConditions/utils'

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

// O vendedor cobra à vista: dinheiro, PIX ou cartão (crédito ou débito)
const CASH_METHODS: readonly PaymentMethod[] = ['CASH', 'PIX', 'CARD']

export const QUICK_SALE_CHECKOUT_QUERY_KEY = 'quick-sale-checkout'

// Tudo o que as duas peças da tela (o botão no topo e o card) precisam saber
export function useQuickSale(data: QuotationType) {
  const { data: session } = useSession()
  const { hasFeature } = usePlanFeatures()

  const { data: settingsRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['quick-sale-settings'],
    queryFn: () => getQuickSaleSettings(),
  })

  // O caixa recebe em outra tela, então a situação é consultada de novo de
  // tempos em tempos: o vendedor vê a venda passar a "recebida" sem recarregar
  const { data: checkoutRes, isLoading } = useQuery({
    queryKey: [QUICK_SALE_CHECKOUT_QUERY_KEY, data.id],
    queryFn: () => getQuickSaleCheckout(data.id),
    refetchInterval: 15000,
  })

  const settings = settingsRes?.success ? settingsRes.data : undefined
  // O vendedor com "Somente enviar ao caixa" no perfil (FC-12.1) não cobra:
  // a venda vai sempre para a frente de caixa
  const onlySendToCash = !!data?.seller?.onlySendToCash
  // Sem a frente de caixa no plano, só resta cobrar na hora: a venda enviada
  // ficaria numa fila que ninguém atende
  const canSend = hasFeature(FEATURES.FINANCIAL.PDV_SCREEN)
  const canCharge = !onlySendToCash || !canSend

  // Cliente bloqueado no limite de crédito: nem cobra nem envia ao caixa
  // (decisão de 24/10/2026)
  const blocked = useClientBlocked(data)
  // Orçamento e frente de caixa trabalham em centavos
  const total = Math.round(calculatePaymentTotals(data).finalValue)
  const itemCount = data?.quotationItems?.length ?? 0

  const origin = {
    quotationId: data.id,
    reference: `VR #${data?.serie?.quotation ?? ''}-${data?.serie?.code ?? ''}`,
    client: data?.client?.name || 'Consumidor',
    seller: data?.seller?.name || session?.user?.name || '',
    total,
  }

  return {
    canSend,
    canCharge,
    // O cliente padrão da configuração: a venda com ele não tem "cliente
    // informado", então não há proposta a mostrar (26/10/2026)
    defaultClientId: settings?.clientId || null,
    // O arredondamento no balcão da frente padrão (FC-18)
    roundingLimit: roundingFor(
      settings?.roundingLimit,
      settings?.roundingType,
      total,
    ),
    methods: CASH_METHODS,
    total,
    itemCount,
    origin,
    checkout: checkoutRes?.data ?? null,
    isLoading,
    blocked,
  }
}

type QuickSale = ReturnType<typeof useQuickSale>

function useRefresh(quotationId: string) {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: [QUICK_SALE_CHECKOUT_QUERY_KEY, quotationId],
      }),
      queryClient.invalidateQueries({ queryKey: ['cash-front'] }),
      queryClient.invalidateQueries({ queryKey: ['quotation-list'] }),
    ])
}

/* ---------------------------------------------------------------------------
 * Cobrar na hora
 * ------------------------------------------------------------------------- */

function ChargeNowDialog({
  sale,
  open,
  onOpenChange,
}: {
  sale: QuickSale
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const money = useMoney()
  const [saving, setSaving] = useState(false)
  const [rounding, setRounding] = useState(false)
  // O mesmo formulário da baixa do Fluxo financeiro e do caixa, restrito às
  // formas aceitas na configuração da venda rápida
  const receipt = useCashReceipt(sale.total, {
    methods: sale.methods,
    roundingLimit: sale.roundingLimit,
    rounding,
  })
  const refresh = useRefresh(sale.origin.quotationId)

  useEffect(() => {
    if (open) {
      receipt.reset(sale.total)
      setRounding(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const save = receipt.form.handleSubmit(async () => {
    setSaving(true)
    const res = await chargeQuickSaleNow(
      sale.origin,
      receipt.parts(),
      receipt.discount,
      receipt.change,
    )
    setSaving(false)

    if (!res.success) return toast.error(res.message)

    toast.success(
      receipt.change > 0
        ? `Venda cobrada · troco de ${money(receipt.change)}`
        : 'Venda cobrada',
    )
    await refresh()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[644px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="min-w-0">
              <DialogTitle className="mb-1">Recebimento</DialogTitle>
              <DialogDescription className="truncate">
                {sale.origin.client} - {sale.origin.reference} · à vista, pelo
                total. Para parcelar ou cobrar depois, envie ao caixa.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <Form {...receipt.form}>
            <form
              id="charge-now"
              onSubmit={save}
              noValidate
              className="flex flex-wrap gap-4"
            >
              <CashReceiptFields receipt={receipt} />
              <CashReceiptBalance
                receipt={receipt}
                onRoundingChange={setRounding}
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div />
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="charge-now"
              RightIcon={IconCircleCheck}
              isLoading={saving}
              // A venda cobrada aqui não fica em aberto: sem o total, não
              // cobra (VR-5)
              disabled={receipt.missing > 0}
            >
              {receipt.missing > 0
                ? `Faltam ${money(receipt.missing)}`
                : 'Confirmar recebimento'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * O gesto principal — o mesmo no topo e no card
 * ------------------------------------------------------------------------- */

export function QuickSaleCheckoutButton({
  sale,
  size,
}: {
  sale: QuickSale
  size?: 'lg'
}) {
  const money = useMoney()
  const [charging, setCharging] = useState(false)
  const alertDialog = useAlertDialog()
  const refresh = useRefresh(sale.origin.quotationId)

  const empty = sale.itemCount === 0 || sale.total <= 0

  const sendToCash = () =>
    alertDialog.open({
      title: `Enviar ${money(sale.total)} ao caixa?`,
      description:
        'A venda entra na fila da frente de caixa e trava: quem recebe e escolhe a forma de pagamento é o caixa. Se algo mudar depois, lance um item novo ou cancele e faça outra venda.',
      confirmLabel: 'Enviar ao caixa',
      cancelLabel: 'Cancelar',
      onConfirm: async () => {
        const res = await sendQuickSaleToCash(sale.origin)

        if (!res.success) throw new Error(res.message)

        await refresh()
      },
      toastMsg: {
        success: 'Venda enviada ao caixa',
        error: 'Erro ao enviar a venda ao caixa',
      },
    })

  // Os dois gestos da série da frente de caixa (VR-5): cobrar à vista agora
  // ou enviar ao caixa. O perfil e o plano podem deixar só um deles
  return (
    <PermissionGate permissions={['sale:order:create']}>
      {sale.blocked && (
        <p className="mb-2 text-sm text-error-600">
          Cliente bloqueado no cadastro: esta venda não pode ser cobrada nem
          enviada ao caixa.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {sale.canSend && (
          <Button
            type="button"
            size={size}
            variant={sale.canCharge ? 'neutralOutline' : 'default'}
            disabled={empty || sale.blocked}
            title={empty ? 'Adicione um item para continuar' : undefined}
            RightIcon={IconCashRegister}
            onClick={sendToCash}
          >
            {`Enviar ${money(sale.total)} ao caixa`}
          </Button>
        )}
        {sale.canCharge && (
          <Button
            type="button"
            size={size}
            disabled={empty || sale.blocked}
            title={empty ? 'Adicione um item para continuar' : undefined}
            RightIcon={IconCashBanknote}
            onClick={() => setCharging(true)}
          >
            {`Cobrar ${money(sale.total)}`}
          </Button>
        )}
      </div>
      {sale.canCharge && (
        <ChargeNowDialog
          sale={sale}
          open={charging}
          onOpenChange={setCharging}
        />
      )}
    </PermissionGate>
  )
}

/* ---------------------------------------------------------------------------
 * Antes de sair: o fechamento da venda
 * ------------------------------------------------------------------------- */

export function QuickSaleCheckoutCard({ sale }: { sale: QuickSale }) {
  const money = useMoney()
  if (sale.isLoading) return <Skeleton className="h-40 w-full" />

  const both = sale.canSend && sale.canCharge

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex gap-4">
          <FeaturedIcon
            Icon={sale.canSend ? IconCashRegister : IconBolt}
            tone="brand"
          />
          <div className="space-y-2">
            <div>
              <p className="text-base font-semibold text-gray-700">
                {both
                  ? 'Recebimento: na hora ou no caixa'
                  : sale.canSend
                    ? 'Recebimento na frente de caixa'
                    : 'Cobrança na hora'}
              </p>
              <p className="text-sm text-gray">
                {both
                  ? 'Cobre à vista agora, pelo total, ou envie ao caixa: aí a forma de pagamento é o caixa quem define.'
                  : sale.canSend
                    ? 'Você envia, o caixa recebe. A forma de pagamento é o caixa quem define.'
                    : 'À vista, pelo total, e a venda se encerra aqui mesmo no atendimento.'}
              </p>
            </div>
            {sale.canCharge && (
              <div className="flex flex-wrap gap-1.5">
                {sale.methods.map((method) => (
                  <Badge key={method} variant="neutralLight">
                    {paymentMethodLabel[method]}
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-gray">
              {sale.canSend
                ? 'Parcelar ou faturar para o cliente? Envie ao caixa.'
                : 'Parcelar ou faturar para o cliente? Use uma série que fatura no pedido.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="md:text-right">
            <p className="text-sm text-gray">
              Total · {sale.itemCount} {sale.itemCount === 1 ? 'item' : 'itens'}
            </p>
            <p className="text-3xl font-semibold text-gray-900">
              {money(sale.total)}
            </p>
          </div>
          <QuickSaleCheckoutButton sale={sale} size="lg" />
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------------------------------------------------------------------------
 * Depois de sair: onde a venda está
 * ------------------------------------------------------------------------- */

type Step = { label: string; detail: string; done: boolean }

type Money = (value: number) => string

function stepsOf(checkout: QuickSaleCheckout, money: Money): Step[] {
  if (checkout.path === 'CASH_ONLY') {
    return [
      {
        label: 'Cobrada na hora',
        detail: `às ${hora(checkout.sentAt)}`,
        done: true,
      },
      { label: 'Entregue', detail: 'no atendimento', done: true },
    ]
  }

  const paidAll = checkout.paid >= checkout.total
  const partial = checkout.paid > 0 && !paidAll

  return [
    {
      label: 'Enviada ao caixa',
      detail: `às ${hora(checkout.sentAt)}`,
      done: true,
    },
    {
      label: partial ? 'Sinal recebido' : 'Recebida',
      detail: paidAll
        ? money(checkout.paid)
        : partial
          ? `${money(checkout.paid)} de ${money(checkout.total)}`
          : 'aguardando o caixa',
      done: checkout.paid > 0,
    },
    {
      label: 'Entregue',
      detail: checkout.delivered
        ? 'ao cliente'
        : checkout.paid > 0
          ? 'aguardando retirada'
          : '—',
      done: checkout.delivered,
    },
  ]
}

function headlineOf(checkout: QuickSaleCheckout, money: Money) {
  if (checkout.cancelled) {
    return {
      title: 'Venda cancelada no caixa',
      text: 'O estorno ficou registrado no caixa, com a justificativa e quem o fez.',
      badge: quickSaleCheckoutStatusObj.CANCELLED,
    }
  }

  const remaining = Math.max(0, checkout.total - checkout.paid)

  if (checkout.paid >= checkout.total && checkout.delivered) {
    return {
      title: 'Venda encerrada',
      text: 'Paga e entregue. Não há mais nada a fazer por aqui.',
      badge: quickSaleCheckoutStatusObj.FINISHED,
    }
  }

  if (checkout.paid > 0) {
    return {
      title: 'Aguardando retirada',
      text: `O cliente paga os ${money(remaining)} restantes quando vier buscar.`,
      badge: quickSaleCheckoutStatusObj.DOWN_PAYMENT,
    }
  }

  return {
    title: 'Na fila do caixa',
    text: 'A venda está travada enquanto espera o recebimento. Se algo mudar, lance um item novo ou cancele e faça outra venda.',
    badge: quickSaleCheckoutStatusObj.AT_CASH,
  }
}

export function QuickSaleStatusCard({
  sale,
  checkout,
}: {
  sale: QuickSale
  checkout: QuickSaleCheckout
}) {
  const money = useMoney()
  const [openPrint, setOpenPrint] = useState(false)

  const steps = stepsOf(checkout, money)
  const headline = headlineOf(checkout, money)
  const paid = checkout.paid > 0
  const finished = checkout.paid >= checkout.total && checkout.delivered

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <FeaturedIcon
              Icon={
                checkout.cancelled
                  ? IconReceiptRefund
                  : finished
                    ? IconCircleCheck
                    : IconLock
              }
              tone={
                checkout.cancelled ? 'error' : finished ? 'success' : 'brand'
              }
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-gray-700">
                  {headline.title}
                </p>
                <Badge variant={headline.badge.variant}>
                  {headline.badge.text}
                </Badge>
              </div>
              <p className="mt-0.5 max-w-xl text-sm text-gray">
                {headline.text}
              </p>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-sm text-gray">Total</p>
            <p className="text-3xl font-semibold text-gray-900">
              {money(checkout.total)}
            </p>
          </div>
        </div>

        {/* O caminho da venda, para o vendedor responder ao cliente sem
            perguntar ao caixa */}
        {!checkout.cancelled && (
          <ol className="grid gap-3 sm:grid-flow-col sm:auto-cols-fr">
            {steps.map((step, index) => (
              <li
                key={step.label}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3',
                  step.done
                    ? 'border-success-200 bg-success-50'
                    : 'border-gray-200 bg-white',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                    step.done
                      ? 'bg-success-600 text-white'
                      : 'bg-gray-100 text-gray-500',
                  )}
                >
                  {step.done ? (
                    <IconCheck aria-hidden size={ICON_SIZE.sm} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span>
                  <span className="block text-sm font-medium text-gray-800">
                    {step.label}
                  </span>
                  <span className="block text-sm text-gray">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        )}

        {checkout.parts.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-gray-200 pt-4 text-sm">
            {checkout.parts.map((part, index) => (
              <span key={index} className="text-gray">
                {paymentMethodLabel[part.method]}{' '}
                <span className="font-medium text-gray-800">
                  {money(part.amount)}
                </span>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          {/* O comprovante sai a pedido, não automático: a maioria das
              gráficas não tem impressora no balcão (FC-16) */}
          {paid && !checkout.cancelled && (
            <Button
              type="button"
              variant="neutralOutline"
              LeftIcon={IconPrinter}
              onClick={() => setOpenPrint(true)}
            >
              Comprovante
            </Button>
          )}
          <Button type="button" asChild RightIcon={IconReceipt}>
            <Link href="/vendas/orcamentos?novo=venda-rapida">
              Nova venda rápida
            </Link>
          </Button>
        </div>
      </CardContent>
      {/* A4 em duas vias ou térmica 80 mm (FC-16, 26/10/2026) */}
      <SaleReceiptDialog
        quotationId={sale.origin.quotationId}
        open={openPrint}
        onOpenChange={setOpenPrint}
      />
    </Card>
  )
}
