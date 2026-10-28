'use client'

// O recebimento do caixa com o MESMO formulário da baixa do Fluxo financeiro
// (`financeiro/_components/transactions/Actions/Payment`): forma de
// pagamento, banco, conta, valor e valor recebido, com o bloco de saldo
// quando o recebido é diferente do valor. Sem a data: no balcão o
// recebimento é agora, e a data é a do caixa aberto (decisão de 01/10/2026). O que o caixa
// acrescenta por cima: o pagamento misto (FC-9) como mais de uma forma no
// mesmo recebimento — a divisão de parcela do Fluxo —, o troco (FC-2) e o
// arredondamento no balcão (FC-18).
//
// É um componente só, usado pelo caixa (receber a venda) e pelo vendedor
// (cobrar a venda rápida na hora), para as duas contas nunca divergirem.

// React
import { useEffect, useMemo } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Components
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { SelectBankAccountField } from '@/components/common/form/global-inputs/BankAccountSelectField'
import { SelectBankFilterConditionField } from '@/components/common/form/global-inputs/BanksFilterConditionSelectField'

// Types
import {
  paymentMethodLabel,
  DEFAULT_ROUNDING_LIMIT,
  type PaymentPart,
  type PaymentMethod,
} from '../types'

// Hooks / Store / Consts
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useBankAccount } from '@/hooks/queries/useBankAccount'
import { useBankFilterCondition } from '@/hooks/queries/useBankFilterCondition'
import { useAvailablePaymentConditions } from '@/hooks/queries/useAvailablePaymentConditions'

// Third-party
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm, useFormContext } from 'react-hook-form'

// Icons
import {
  IconPlus,
  IconTrash,
  IconRefreshDot,
  IconCornerRightDown,
} from '@tabler/icons-react'

// Utils
import { cn, formatMoney } from '@/lib/utils'

export const allPaymentMethods: PaymentMethod[] = ['CASH', 'PIX', 'CARD']

// A forma de pagamento do cadastro vira a forma do caixa pelo nome: o caixa
// só precisa saber se é dinheiro (vai para a gaveta), PIX ou cartão
export const methodOfCondition = (name?: string): PaymentMethod => {
  const lower = (name || '').toLowerCase()
  if (lower.includes('pix')) return 'PIX'
  if (
    lower.includes('cart') ||
    lower.includes('crédito') ||
    lower.includes('credito') ||
    lower.includes('débito') ||
    lower.includes('debito')
  ) {
    return 'CARD'
  }
  return 'CASH'
}

const partSchema = z.object({
  paymentConditionId: z.string().min(1, 'Campo obrigatório'),
  bankId: z.string().optional(),
  bankAccountId: z.string().optional(),
  amount: z.number(),
})

export const receiptSchema = z.object({
  totalValue: z.number(),
  // Uma parte por forma: o pagamento misto é mais de uma (FC-9)
  parts: z.array(partSchema).min(1),
})

export type ReceiptValues = z.infer<typeof receiptSchema>

export function useCashReceipt(
  remaining: number,
  options: {
    // Limite do arredondamento no balcão (FC-18), em centavos
    roundingLimit?: number
    // Formas aceitas (a venda rápida "cobrar na hora" restringe)
    methods?: readonly PaymentMethod[]
    rounding?: boolean
  } = {},
) {
  const roundingLimit = options.roundingLimit ?? DEFAULT_ROUNDING_LIMIT
  const form = useForm<ReceiptValues>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      totalValue: remaining,
      parts: [
        {
          paymentConditionId: '',
          bankId: '',
          bankAccountId: '',
          amount: remaining,
        },
      ],
    },
  })
  const { watch, setValue, reset } = form
  const fields = useFieldArray({ control: form.control, name: 'parts' })
  const { data: conditions } = useAvailablePaymentConditions('receivable')

  // A forma só existe se alguma conta a aceita (27/10/2026): sem nenhuma
  // condição liberada para receber, o caixa oferece só dinheiro, que vai
  // para a gaveta e, no fechamento, para a conta Caixa. PIX ou cartão sem
  // conta não têm onde dar baixa
  const conditionOptions = useMemo(() => {
    const list = conditions?.length
      ? conditions.map((condition) => ({
          value: condition.id,
          label: condition.name,
        }))
      : [{ value: 'CASH', label: paymentMethodLabel.CASH }]
    if (!options.methods) return list
    return list.filter((option) =>
      options.methods!.includes(methodOfCondition(option.label)),
    )
  }, [conditions, options.methods])

  const conditionName = (id: string) =>
    conditionOptions.find((option) => option.value === id)?.label

  const parts = watch('parts') || []
  // O balcão abre em Dinheiro (CX-2; decisão do produto, 26/10/2026): a
  // primeira parte nasce na forma de dinheiro, sem banco nem conta a
  // escolher; as outras formas já vêm com o primeiro banco e a primeira conta
  const firstConditionId = parts[0]?.paymentConditionId
  useEffect(() => {
    if (firstConditionId || !conditionOptions.length) return
    const cash =
      conditionOptions.find(
        (option) => methodOfCondition(option.label) === 'CASH',
      ) ?? conditionOptions[0]
    setValue('parts.0.paymentConditionId', cash.value)
  }, [firstConditionId, conditionOptions, setValue])
  const totalValue = watch('totalValue') || 0
  const received = parts.reduce((total, part) => total + (part.amount || 0), 0)
  const change = Math.max(0, received - totalValue)
  const rawMissing = Math.max(0, totalValue - received)
  // Falta pouco: dá para arredondar e registrar a diferença como desconto
  const canRound = rawMissing > 0 && rawMissing <= roundingLimit
  const rounding = !!options.rounding
  const discount = canRound && rounding ? rawMissing : 0
  const missing = rawMissing - discount

  // Cada parte vira uma forma do caixa; o troco sai do dinheiro (FC-2)
  const paymentParts = (): PaymentPart[] => {
    let changeLeft = change
    return parts
      .map((part) => {
        const method = methodOfCondition(conditionName(part.paymentConditionId))
        let amount = part.amount || 0
        if (method === 'CASH' && changeLeft > 0) {
          const taken = Math.min(amount, changeLeft)
          amount -= taken
          changeLeft -= taken
        }
        // A forma do cadastro e a conta vão junto: a API guarda as duas
        // em cada parte (FC-9)
        return {
          method,
          amount,
          paymentConditionId: part.paymentConditionId,
          bankAccountId: part.bankAccountId || undefined,
        }
      })
      .filter((part) => part.amount > 0)
  }

  const resetTo = (value: number) =>
    reset({
      totalValue: value,
      parts: [
        {
          paymentConditionId: '',
          bankId: '',
          bankAccountId: '',
          amount: value,
        },
      ],
    })

  // Repassar o que falta para a parte, como "Repassar saldo para esta
  // parcela" no Fluxo financeiro
  const passBalance = (index: number) =>
    setValue(`parts.${index}.amount`, (parts[index]?.amount || 0) + rawMissing)

  const addPart = () =>
    fields.append({
      paymentConditionId: '',
      bankId: '',
      bankAccountId: '',
      amount: rawMissing,
    })

  return {
    form,
    fields,
    received,
    change,
    missing,
    rawMissing,
    canRound,
    rounding,
    discount,
    roundingLimit,
    totalValue,
    parts: paymentParts,
    reset: resetTo,
    passBalance,
    addPart,
    removePart: (index: number) => fields.remove(index),
    conditionOptions,
    conditionName,
  }
}

export type CashReceipt = ReturnType<typeof useCashReceipt>

// Uma forma do recebimento: os mesmos campos da baixa do Fluxo financeiro,
// com banco e conta pré-selecionados como lá
function PartRow({
  index,
  receipt,
  canRemove,
}: {
  index: number
  receipt: CashReceipt
  canRemove: boolean
}) {
  const { watch, setValue } = useFormContext<ReceiptValues>()
  const { canCreateBankAccount } = usePlanFeatures()
  const conditionId = watch(`parts.${index}.paymentConditionId`) || ''
  const bankId = watch(`parts.${index}.bankId`) || ''
  const bankAccountId = watch(`parts.${index}.bankAccountId`) || ''
  // Dinheiro fica na gaveta do caixa até o fechamento: não há banco nem conta
  // a escolher. PIX e cartão vão para a conta, como na baixa do Fluxo
  const isCash =
    !!conditionId &&
    methodOfCondition(receipt.conditionName(conditionId)) === 'CASH'

  const { data: banks } = useBankFilterCondition(conditionId)
  const { data: bankAccounts } = useBankAccount({
    filters: { bankId },
    isBankRequired: true,
  })

  // O primeiro banco e a primeira conta já vêm marcados (CX-2: a conta
  // padrão é pré-selecionada, não obrigatória)
  useEffect(() => {
    if (banks?.length && conditionId && !bankId) {
      setValue(`parts.${index}.bankId`, banks[0].id)
    }
  }, [banks, conditionId, bankId, index, setValue])

  useEffect(() => {
    if (bankAccounts?.length && bankId && !bankAccountId) {
      setValue(`parts.${index}.bankAccountId`, bankAccounts[0].id)
    }
  }, [bankAccounts, bankId, bankAccountId, index, setValue])

  return (
    <div className="flex w-full flex-wrap gap-4">
      <FormSelect<ReceiptValues>
        name={`parts.${index}.paymentConditionId`}
        label="Forma de pagamento"
        placeholder="Forma de pagamento"
        width="flex-[1_0_200px]"
        options={receipt.conditionOptions}
      />
      {isCash ? (
        <div className="flex-[1_0_336px] space-y-2">
          <p className="text-sm font-medium">Conta</p>
          <p className="flex h-10 items-center rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
            Gaveta do caixa · vai para a conta Caixa no fechamento
          </p>
        </div>
      ) : (
        <>
          <SelectBankFilterConditionField<ReceiptValues>
            name={`parts.${index}.bankId`}
            label="Banco"
            width="flex-[1_0_160px]"
            conditionId={conditionId}
            disabled={!conditionId || !canCreateBankAccount()}
          />
          <SelectBankAccountField<ReceiptValues>
            name={`parts.${index}.bankAccountId`}
            label="Conta"
            width="flex-[1_0_160px]"
            bankId={bankId}
            disabled={!bankId || !canCreateBankAccount()}
          />
        </>
      )}
      <FormBrlInput<ReceiptValues>
        name={`parts.${index}.amount`}
        placeholder="0,00"
        label="Valor recebido"
        startAdornment={<>R$</>}
        width="flex-[1_0_140px]"
      />
      <div className="mt-6 flex gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              LeftIcon={IconRefreshDot}
              size="icon"
              variant="neutralGhost"
              disabled={receipt.rawMissing === 0}
              aria-label="Repassar o que falta para esta forma"
              onClick={() => receipt.passBalance(index)}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p>Repassar o que falta para esta forma</p>
          </TooltipContent>
        </Tooltip>
        {canRemove && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                LeftIcon={IconTrash}
                size="icon"
                variant="neutralGhost"
                aria-label="Remover esta forma"
                onClick={() => receipt.removePart(index)}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Remover esta forma</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

// Os campos, na mesma ordem da baixa do Fluxo financeiro. Renderizar dentro
// de <Form {...receipt.form}>
export function CashReceiptFields({ receipt }: { receipt: CashReceipt }) {
  // As dicas dos botões de cada forma precisam de um TooltipProvider. A
  // frente de caixa tem o dela, mas a venda rápida (Cobrar) não tinha, e a
  // tela caía em "Algo deu errado!": o formulário traz o seu
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-4">
        <FormBrlInput<ReceiptValues>
          name="totalValue"
          placeholder="0,00"
          label="Valor"
          startAdornment={<>R$</>}
          width="flex-[1_0_250px]"
          disabled
        />
        {receipt.fields.fields.map((field, index) => (
          <PartRow
            key={field.id}
            index={index}
            receipt={receipt}
            canRemove={receipt.fields.fields.length > 1}
          />
        ))}
        {/* Pagamento misto (FC-9): mais de uma forma no mesmo recebimento,
          cada parte indo para a sua conta */}
        <Button
          type="button"
          size="sm"
          variant="neutralOutline"
          LeftIcon={IconPlus}
          onClick={receipt.addPart}
        >
          Dividir em outra forma
        </Button>
      </div>
    </TooltipProvider>
  )
}

// O bloco de saldo da baixa do Fluxo financeiro: aqui ele diz se é troco
// (recebeu a mais, em dinheiro) ou o que ainda falta (sinal), e oferece o
// arredondamento no balcão (FC-18) quando falta pouco
export function CashReceiptBalance({
  receipt,
  onRoundingChange,
}: {
  receipt: CashReceipt
  onRoundingChange?: (rounding: boolean) => void
}) {
  const {
    received,
    totalValue,
    change,
    missing,
    canRound,
    rounding,
    discount,
  } = receipt
  if (received === totalValue && !discount) return null
  const over = change > 0

  return (
    <div className="w-full rounded-lg border bg-gray-50 p-4">
      <div
        className={cn(
          'flex justify-between gap-5 rounded-lg p-3',
          over
            ? 'bg-success-200 text-success-900'
            : missing > 0
              ? 'bg-error-200 text-error-900'
              : 'bg-success-200 text-success-900',
        )}
      >
        <div className="flex items-center gap-2">
          <FeaturedIcon
            tone={over || missing === 0 ? 'success' : 'error'}
            size="sm"
            Icon={IconCornerRightDown}
          />
          <p className="text-sm font-medium">
            {over ? 'Troco' : missing > 0 ? 'Ainda falta' : 'Arredondado'}
          </p>
        </div>
        <p className="text-sm font-semibold">
          {formatMoney(over ? change : missing > 0 ? missing : discount)}
        </p>
      </div>
      {canRound && onRoundingChange && (
        <>
          <Separator className="my-4" />
          <label className="flex items-start gap-3">
            <Checkbox
              checked={rounding}
              onCheckedChange={(checked) => onRoundingChange(!!checked)}
              aria-label="Arredondar"
            />
            <span>
              <span className="text-sm font-medium">
                Arredondar: desconto de {formatMoney(receipt.rawMissing)} na
                venda
              </span>
              <span className="mt-0.5 block text-sm text-gray">
                Registrado na hora como desconto, até{' '}
                {formatMoney(receipt.roundingLimit)}. Não vira diferença de
                caixa.
              </span>
            </span>
          </label>
        </>
      )}
    </div>
  )
}
