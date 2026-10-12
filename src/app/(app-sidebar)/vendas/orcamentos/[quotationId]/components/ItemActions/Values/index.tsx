// React
import { useEffect, useRef, useMemo } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { PickValuePercentSelect } from '@/components/common/PickValuePercentSelect'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { itemValuesSchema, type FormType } from './schema'

// Icons
import { IconCircleCheck, IconCoin } from '@tabler/icons-react'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Types
import { QuotationType, QuotationItemType } from '@/types/sales/quotation'

// Libs
import { cn, parseCurrencyToBrl } from '@/lib/utils'
import { QUOTATION_DATA_QUERY_KEY } from '../../Quotation'

interface Props {
  open: boolean
  setOpen: (value: string) => void
  quotationData: QuotationType
  rowData?: QuotationItemType
}

export function ValuesDialog({ open, quotationData, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(itemValuesSchema),
  })

  const { watch, reset, setValue, handleSubmit } = form

  const baseValue = rowData?.totalValue || 0
  const discount = watch('discount') || 0
  const finalValue = watch('finalValue') || 0
  const discountType = watch('discountType') || 'VALUE'

  const isFirstRender = useRef(true)

  // Calcular o desconto atual do item em valor absoluto
  const currentItemDiscount = useMemo(() => {
    if (discountType === 'VALUE') {
      return discount
    } else if (discountType === 'PERCENT') {
      return (discount / 100) * baseValue
    }
    return 0
  }, [discount, discountType, baseValue])

  // Calcular o valor original total sem nenhum desconto (soma dos totalValue dos produtos).
  // A base no preço do cadastro (EC-2) volta quando a API devolver o preço base
  // na escala do item (ALT-8): o originalValue de hoje é o preço do cadastro na
  // medida padrão e acusava desconto que não existe (CV-1).
  const originalValue = useMemo(() => {
    return (
      quotationData?.quotationItems?.reduce(
        (sum, item) => sum + (item?.totalValue || 0),
        0,
      ) || 0
    )
  }, [quotationData?.quotationItems])

  // Calcular o desconto total dos outros itens (excluindo o item atual)
  const otherItemsDiscount = useMemo(() => {
    return (
      quotationData?.quotationItems?.reduce((sum, item) => {
        // Pular o item atual
        if (item?.id === rowData?.id) return sum
        // O acréscimo do item não desconta o desconto dele (ALT-25)
        const itemDiscount =
          (item?.totalValue || 0) +
          (item?.addition || 0) -
          (item?.finalValue || 0)
        return sum + Math.max(itemDiscount, 0)
      }, 0) || 0
    )
  }, [quotationData?.quotationItems, rowData?.id])

  // Calcular o desconto geral das condições de pagamento
  const generalDiscount = useMemo(() => {
    return quotationData?.paymentConditions?.discount?.discountTotal || 0
  }, [quotationData?.paymentConditions?.discount?.discountTotal])

  // Desconto total combinado (item atual + outros itens + desconto geral)
  const combinedDiscountTotal =
    currentItemDiscount + otherItemsDiscount + generalDiscount

  // Calcular o percentual de desconto total. Arredondado como nas condições
  // de pagamento e no checkout do backend: sem isso, R$ 7,00 de R$ 100,00 vira
  // 7.000000000000001% e um desconto exatamente no limite de 7% trava o Salvar
  const totalDiscountPercentage =
    originalValue > 0
      ? Math.round(
          ((combinedDiscountTotal / originalValue) * 100 + Number.EPSILON) *
            100,
        ) / 100
      : 0

  // Limite máximo de desconto do vendedor
  const maxDiscount = quotationData?.seller?.maxDiscount

  // Verificar se o desconto excede o limite
  const exceedsMaxDiscount =
    maxDiscount !== null &&
    maxDiscount !== undefined &&
    totalDiscountPercentage > maxDiscount

  // Resetar form quando modal abrir
  useEffect(() => {
    if (!open) return

    reset({
      totalValue: rowData?.totalValue || 0,
      discountType: rowData?.discountType || 'VALUE',
      discount: rowData?.discount || null,
      finalValue: rowData?.finalValue || 0,
    })

    isFirstRender.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Calcula o desconto ao alterar o valor total
  const handleTotalValueChange = (value: number | null) => {
    isFirstRender.current = false

    const totalValue = Number(value) || 0
    let newDiscount = 0

    if (discountType === 'VALUE') {
      newDiscount = baseValue - totalValue
    } else if (discountType === 'PERCENT') {
      newDiscount = ((baseValue - totalValue) / baseValue) * 100
    }

    setValue('discount', Number(newDiscount.toFixed(4)))
  }

  // Calcula o valor total ao alterar o desconto
  const handleDiscountChange = (value: string | number | null) => {
    isFirstRender.current = false

    const totalDiscount = Number(value) || 0

    let newTotalValue = 0

    if (discountType === 'VALUE') {
      newTotalValue = baseValue - totalDiscount
    } else if (discountType === 'PERCENT') {
      const discountPercentage = totalDiscount / 100
      newTotalValue = baseValue - baseValue * discountPercentage
    }

    setValue('finalValue', newTotalValue)
  }

  // Converte o desconto para o valor correto ao alterar o tipo de desconto
  useEffect(() => {
    // Pular a primeira renderização
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (discountType === 'PERCENT') {
      setValue('discount', discount / 100)
      handleDiscountChange(discount / 100)
    } else if (discountType === 'VALUE') {
      setValue('discount', discount * 100)
      handleDiscountChange(discount * 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountType])

  // MS-16: o vendedor ajusta o valor do item para mais, para menos ou só para
  // arredondar. Para mais, a diferença é valor agregado e vai no acréscimo do
  // item (ALT-25); para menos, é desconto e vale o limite do perfil
  const surcharge = Math.max(finalValue - baseValue, 0)
  const surchargePercent = baseValue > 0 ? (surcharge / baseValue) * 100 : 0

  const roundTotal = (direction: 'down' | 'up') => {
    // Arredonda para o real inteiro; valores em centavos
    const rounded =
      direction === 'down'
        ? Math.floor(finalValue / 100) * 100
        : Math.ceil(finalValue / 100) * 100
    setValue('finalValue', rounded)
    handleTotalValueChange(rounded)
  }

  // Atualiza os valores no submit
  const mutation = useMutation({
    mutationFn: (body: FormType) =>
      updateItemNew({
        route: `/sale/quotation/update-product/${rowData?.id}`,
        data: body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    },
  })

  const onSubmit = async (data: FormType) => {
    if (quotationData?.status === 'APPROVED') {
      toast.error('Orçamento já aprovado, não é possível editar os valores')
      return
    }

    delete data.totalValue
    delete data.finalValue

    // A diferença para mais vai como acréscimo, sem desconto; o desconto
    // negativo antigo some ao salvar
    const addition = Math.round(Math.max(finalValue - baseValue, 0))
    const body: FormType =
      addition > 0
        ? { discountType: 'VALUE', discount: 0, addition }
        : {
            ...data,
            discount:
              data.discount !== null && data.discount < 0 ? 0 : data.discount,
            addition: 0,
          }

    try {
      const result = await mutation.mutateAsync(body)
      if (result.success) {
        toast.success('Valores atualizados')
        setOpen('')
      } else {
        toast.error(result.message || 'Erro ao atualizar os valores!')
      }
    } catch (error) {
      toast.error('Erro ao atualizar os valores')
    }
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog ? 'values' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconCoin} />
            <div>
              <DialogTitle>Editar valores do item</DialogTitle>
              <DialogDescription>
                Mude o valor total para mais, para menos ou para arredondar.
                Para menos, conta como desconto e vale o seu limite.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="quotation-values"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="flex flex-wrap gap-4"
            >
              <FormBrlInput<FormType>
                name="totalValue"
                label="Valor base"
                startAdornment={<>R$</>}
                width="flex-[1_0_200px]"
                disabled
              />
              <div className="flex flex-wrap flex-[1_0_200px]">
                {discountType === 'VALUE' ? (
                  <FormBrlInput<FormType>
                    name="discount"
                    label="Desconto"
                    width="w-full"
                    className="[&>input]:-ml-1"
                    additionalOnChange={handleDiscountChange}
                    autoFocus
                    startAdornment={<PickValuePercentSelect />}
                    formatValue={(value) => (value < 0 ? 0 : value)}
                  />
                ) : (
                  <FormInput<FormType>
                    type="number"
                    name="discount"
                    label="Desconto"
                    width="w-full"
                    additionalOnChange={handleDiscountChange}
                    autoFocus
                    startAdornment={<PickValuePercentSelect />}
                    formatValue={(value) => {
                      const numValue = Number(value)
                      return numValue < 0 ? 0 : value
                    }}
                  />
                )}
                {exceedsMaxDiscount && (
                  <p className="mt-1 text-xs text-error">
                    Desconto total ({totalDiscountPercentage.toFixed(1)}%)
                    excede o limite do vendedor ({maxDiscount}%). Reduza o
                    desconto para salvar.
                  </p>
                )}
              </div>
              <div className="flex flex-[1_0_200px] flex-col gap-1">
                <FormBrlInput<FormType>
                  name="finalValue"
                  label="Valor total"
                  startAdornment={<>R$</>}
                  width="w-full"
                  additionalOnChange={handleTotalValueChange}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => roundTotal('down')}
                  >
                    Arredondar para baixo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => roundTotal('up')}
                  >
                    para cima
                  </Button>
                </div>
              </div>
              {/* ALT-25: a diferença para mais sobre o preço base é o valor
                  agregado. Fica embutido no valor do item: aparece aqui, no
                  registro, e não como linha própria na proposta */}
              <div className="flex w-full flex-col gap-1">
                <p className="text-sm font-medium text-gray-700">
                  Valor agregado
                </p>
                <p
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm',
                    surcharge > 0
                      ? 'bg-success-50 text-success-700'
                      : 'bg-gray-50 text-gray',
                  )}
                >
                  {surcharge > 0
                    ? `+ R$ ${parseCurrencyToBrl(surcharge)} (${surchargePercent.toFixed(1)}%) sobre o valor base. Fica embutido no valor do item e não conta como desconto.`
                    : 'Nenhum. Suba o valor total para registrar um acréscimo; ele fica embutido no valor do item, sem linha própria na proposta.'}
                </p>
              </div>
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            <p className="text-lg font-semibold">{`R$ ${parseCurrencyToBrl(finalValue)}`}</p>
            <p className="text-sm font-medium text-gray-700">Valor final</p>
          </div>
          <div className="space-x-4">
            <Button
              type="button"
              variant="neutralOutline"
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            {/* EC-17: o limite do perfil de vendedor passa a valer de fato —
                o aviso continua, e o salvamento fica bloqueado */}
            <Button
              type="submit"
              form="quotation-values"
              RightIcon={IconCircleCheck}
              isLoading={mutation.isPending}
              disabled={exceedsMaxDiscount}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
