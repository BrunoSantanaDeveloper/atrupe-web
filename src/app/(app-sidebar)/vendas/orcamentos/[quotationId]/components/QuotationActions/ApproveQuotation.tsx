'use client'

// Aprovar o orçamento (vira ordem de serviço). Duas travas, com mensagem
// clara (decisões de 05/10/2026), conferidas também pelo /approve:
// - a condição de pagamento é obrigatória para aprovar (concluir, não);
// - um item cujo produto foi inativado (PAD-7), ou com uma parte inativa
//   acrescentada, trava a aprovação até ser trocado ou retirado. A parte
//   da linha só o servidor confere: os itens vêm na recusa.
// E a do crédito do cliente (PO, 13 e 14/10/2026): cliente bloqueado,
// condição fora das permitidas ou acima do limite. Só o servidor confere.
// O limite estourado diz o caminho (PA-2, 12/11/2026): a recusa traz a
// entrada sugerida e o botão "Usar R$ X como entrada". A venda que precisa
// do pagamento antes (a entrada ou o cliente com pagamento antecipado) é
// aprovada com pendência: fica na aba ⚠️ Pendente, sem ordem de serviço.

// React
import { useClientBlocked } from '../useClientBlocked'
import { useState } from 'react'
import { useRouter } from '@/hooks/useRouter'

// UI
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { CustomButton } from '@/components/common/CustomButton'
import { PaymentConditionsDialog } from './PaymentConditions'

// Third-party
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

// Types
import { QuotationType } from '@/types/sales/quotation'

// Actions
import { createItemNew } from '@/actions/_cruds'
import { useQuotationCredit } from '@/hooks/queries/useQuotationCredit'
import { formatCurrencyToBrl } from '@/lib/utils'

// Hooks
import { useInactiveQuotationItems } from '@/hooks/queries/useInactiveQuotationItems'

// Icons
import {
  IconBan,
  IconCircleCheck,
  IconAlertTriangle,
} from '@tabler/icons-react'

import { QUOTATION_DATA_QUERY_KEY } from '../Quotation'

interface Props {
  data: QuotationType
}

function dateInputToSaoPauloIso(date: string) {
  return new Date(`${date}T00:00:00-03:00`).toISOString()
}

export function ApproveQuotation({ data }: Props) {
  const [open, setOpen] = useState(false)
  const [openPayment, setOpenPayment] = useState(false)
  const [openBlocked, setOpenBlocked] = useState<
    'payment' | 'inactive' | 'credit' | null
  >(null)
  // O motivo da recusa pelo crédito, como o servidor manda
  const [creditMessage, setCreditMessage] = useState('')
  // Os itens que o servidor recusou (produto ou parte inativa)
  const [refused, setRefused] = useState<{ id: string; description: string }[]>(
    [],
  )
  const [approvedAt, setApprovedAt] = useState('')
  // A entrada da diferença do limite (centavos), da recusa (PA-2)
  const [suggestedDownPayment, setSuggestedDownPayment] = useState(0)
  // A entrada que é toda a parte a prazo: pagamento integral (Lista Lite 19/11)
  const [fullPayment, setFullPayment] = useState(false)

  const queryClient = useQueryClient()
  const router = useRouter()
  const { data: session } = useSession()

  const isAdmin = session?.user?.isAdmin
  const blocked = useClientBlocked(data)

  const hasInstallments = data?.paymentConditions?.installmentQty > 0
  const isNoInvoice = data?.paymentConditions?.billing === 'NO_INVOICE'
  const hasPaymentCondition =
    isNoInvoice ||
    (hasInstallments && !!data?.paymentConditions?.paymentCondition?.id)

  const { inactiveItems } = useInactiveQuotationItems(data)

  // O que a aprovação fará: com pendência de pagamento ou não (PA-3)
  const { data: credit } = useQuotationCredit(
    data?.id,
    open && !!data?.client?.id,
    `approve|${data?.updatedAt ?? ''}`,
  )
  const hold = credit?.issues?.length ? null : (credit?.hold ?? null)
  const holdAmount = hold ? formatCurrencyToBrl(hold.amount) : ''

  const blockedItems = refused.length
    ? refused
    : inactiveItems.map((item) => ({
        id: item.id,
        description: item.description,
      }))

  const handleTriggerClick = () => {
    // Bloqueado no limite de crédito: nunca aprova (decisão de 24/10/2026),
    // mesmo antes da data em que o servidor passa a recusar
    if (blocked) {
      setCreditMessage(
        'Este cliente está bloqueado no cadastro. Quem pode desbloquear faz isso na aba Limite de crédito do cliente.',
      )
      setOpenBlocked('credit')
      return
    }
    setRefused([])
    if (inactiveItems.length) {
      setOpenBlocked('inactive')
      return
    }
    if (!hasPaymentCondition) {
      setOpenBlocked('payment')
      return
    }
    setApprovedAt('')
    setOpen(true)
  }

  const handlePaymentConditionsSaved = () => {
    setApprovedAt('')
    setOpen(true)
  }

  const handleApprove = async () => {
    const body =
      isAdmin && approvedAt
        ? { approvedAt: dateInputToSaoPauloIso(approvedAt) }
        : undefined
    const res = await createItemNew({
      route: `/sale/quotation/${data.id}/approve`,
      data: body,
    })
    if (!res.success) {
      // Produto ou parte inativa (PAD-7): a lista do servidor, no diálogo
      const items = 'items' in res ? res.items : undefined
      if (items?.length) {
        setOpen(false)
        setRefused(
          items.map((item) => ({ id: item.itemId, description: item.name })),
        )
        setOpenBlocked('inactive')
        return
      }
      if ('errorCode' in res && res.errorCode === 'CREDIT_CHECK') {
        setOpen(false)
        setCreditMessage(res.message)
        const issues = 'issues' in res ? (res.issues ?? []) : []
        const limit = issues.find(
          (issue) => issue.code === 'CREDIT_LIMIT_EXCEEDED',
        )
        // A entrada só resolve quando o limite é o único motivo
        setSuggestedDownPayment(
          issues.length === 1 ? (limit?.suggestedDownPayment ?? 0) : 0,
        )
        setFullPayment(!!limit?.fullPayment)
        setOpenBlocked('credit')
        queryClient.invalidateQueries({ queryKey: ['quotation-credit'] })
        return
      }
      toast.error(res.message)
      return
    }

    // Aprovada com pendência (PA-4): fica em Orçamentos, na aba Pendente,
    // até o financeiro baixar o título; não há ordem de serviço ainda
    if (res?.data?.pendingPayment) {
      toast.success(
        `Venda pendente: aguarda ${formatCurrencyToBrl(res.data.holdAmount)} no financeiro para virar ordem de serviço`,
      )
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
      queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
      queryClient.invalidateQueries({ queryKey: ['quotation-credit'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-list'] })
      return
    }

    // No ELITE, a aprovação cria o projeto de produção em stand-by (PCP-4)
    const project = res?.data?.productionProject
    toast.success(
      project
        ? `Orçamento aprovado. Projeto de produção criado em stand-by, com ${project.tasks} tarefa(s)`
        : data?.quickSale
          ? 'Venda aprovada'
          : 'Orçamento aprovado',
    )

    queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    queryClient.invalidateQueries({ queryKey: ['order-data'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-totals'] })
    queryClient.invalidateQueries({ queryKey: ['quotation-list'] })
    queryClient.invalidateQueries({ queryKey: ['order-totals'] })
    queryClient.invalidateQueries({ queryKey: ['order-list'] })
    queryClient.invalidateQueries({ queryKey: ['delivery-schedule-list'] })
    queryClient.invalidateQueries({ queryKey: ['delivery-schedule-totals'] })

    const orderId = res?.data?.id

    if (orderId) {
      setTimeout(() => {
        router.replace(`/vendas/ordens-de-servico/${orderId}`)
      }, 100)
    }
  }

  return (
    <>
      <CustomButton
        icon={IconCircleCheck}
        title={data?.quickSale ? 'Aprovar venda' : 'Aprovar orçamento'}
        iconTone="success"
        onClick={handleTriggerClick}
      />

      {/* A trava, com o motivo dito */}
      <AlertDialog
        open={openBlocked !== null}
        onOpenChange={(value) => !value && setOpenBlocked(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={openBlocked === 'payment' ? IconAlertTriangle : IconBan}
              size="lg"
              tone={openBlocked !== 'payment' ? 'error' : 'warning'}
              className="mx-auto mb-2 flex"
            />
            <AlertDialogTitle>
              {openBlocked === 'credit'
                ? suggestedDownPayment > 0
                  ? fullPayment
                    ? 'Atenção! Limite de crédito excedido'
                    : 'Esta venda passa do limite de crédito do cliente'
                  : 'Aprovação bloqueada pelo crédito do cliente'
                : openBlocked === 'inactive'
                  ? 'Este orçamento não pode ser aprovado'
                  : 'Informe a condição de pagamento para aprovar'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-left">
                {openBlocked === 'credit' ? (
                  <p>{creditMessage}</p>
                ) : openBlocked === 'inactive' ? (
                  <>
                    <p>
                      {blockedItems.length === 1
                        ? 'Este item tem produto inativado:'
                        : 'Estes itens têm produto inativado:'}
                    </p>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                      {blockedItems.map((item) => (
                        <li key={item.id}>{item.description}</li>
                      ))}
                    </ul>
                    <p>
                      Troque ou retire o item em Itens para aprovar. Aprovado, o
                      orçamento viraria uma ordem de serviço com um produto que
                      a empresa não vende mais.
                    </p>
                  </>
                ) : (
                  <p>
                    A ordem de serviço nasce com as parcelas e a forma de
                    pagamento, então elas precisam estar informadas antes.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {openBlocked === 'payment' ? 'Cancelar' : 'Fechar'}
            </AlertDialogCancel>
            {openBlocked === 'credit' && suggestedDownPayment > 0 && (
              <Button
                type="button"
                RightIcon={IconCircleCheck}
                onClick={() => {
                  setOpenBlocked(null)
                  setOpenPayment(true)
                }}
              >
                {fullPayment
                  ? `Receber ${formatCurrencyToBrl(suggestedDownPayment)} à vista`
                  : `Usar ${formatCurrencyToBrl(suggestedDownPayment)} como entrada`}
              </Button>
            )}
            {openBlocked === 'payment' && (
              <Button
                type="button"
                RightIcon={IconCircleCheck}
                onClick={() => {
                  setOpenBlocked(null)
                  setOpenPayment(true)
                }}
              >
                Informar condição de pagamento
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentConditionsDialog
        quotationData={data}
        open={openPayment}
        onOpenChange={(value) => {
          setOpenPayment(value)
          if (!value) setSuggestedDownPayment(0)
        }}
        hideTrigger
        onFinish={handlePaymentConditionsSaved}
        submitLabel="Salvar e continuar"
        suggestedDownPayment={suggestedDownPayment || undefined}
      />

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <FeaturedIcon
              Icon={IconAlertTriangle}
              size="lg"
              tone="warning"
              className="mx-auto mb-2 flex"
            />
            <AlertDialogTitle>
              {hold?.reason === 'PREPAYMENT'
                ? 'Aprovar com pagamento antecipado?'
                : hold?.reason === 'CREDIT_LIMIT'
                  ? 'Aprovar com pagamento antes?'
                  : data?.quickSale
                    ? 'Deseja aprovar esta venda?'
                    : 'Deseja aprovar este orçamento?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hold?.reason === 'PREPAYMENT'
                ? `Este cliente exige pagamento antecipado. A venda fica na aba ⚠️ Pendente e o financeiro recebe ${holdAmount} num título marcado ⚠️ Pendência. Quando ele for baixado, a venda vira ordem de serviço.`
                : hold?.reason === 'CREDIT_LIMIT'
                  ? `A venda passa do limite de crédito do cliente: ${holdAmount} precisam ser pagos antes. Ela fica na aba ⚠️ Pendente até esse valor ser recebido no financeiro; depois, vira ordem de serviço.`
                  : 'Ao aprovar, este trabalho mudará de status e passará a ficar disponível na aba Ordens de Serviço.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              RightIcon={IconCircleCheck}
            >
              {hold ? 'Aprovar com pendência' : 'Aprovar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
