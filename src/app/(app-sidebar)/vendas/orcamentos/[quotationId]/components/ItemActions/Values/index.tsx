// React
import { useEffect, useRef } from 'react'

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
import { updateItem } from '@/actions/_cruds'

// Types
import { QuotationType, QuotationItemType } from '@/types/sales/quotation'

// Libs
import { parseCurrencyToBrl } from '@/lib/utils'

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

  // Atualiza os valores no submit
  const mutation = useMutation({
    mutationFn: (body: FormType) =>
      updateItem('quotationRoute', `update-product/${rowData?.id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async (data: FormType) => {
    if (quotationData?.status === 'APPROVED') {
      toast.error('Orçamento já aprovado, não é possível editar os valores')
      return
    }

    delete data.totalValue
    delete data.finalValue

    try {
      await mutation.mutateAsync(data)
      toast.success('Valores atualizados!')
      setOpen('')
    } catch (error) {
      toast.error('Erro ao atualizar os valores!')
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
            <DialogTitle>Editar valores do item</DialogTitle>
          </div>
          <DialogDescription hidden></DialogDescription>
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
              {discountType === 'VALUE' ? (
                <FormBrlInput<FormType>
                  name="discount"
                  label="Desconto"
                  width="flex-[1_0_200px]"
                  className="[&>input]:-ml-1"
                  additionalOnChange={handleDiscountChange}
                  autoFocus
                  startAdornment={<PickValuePercentSelect />}
                />
              ) : (
                <FormInput<FormType>
                  type="number"
                  name="discount"
                  label="Desconto"
                  width="flex-[1_0_200px]"
                  additionalOnChange={handleDiscountChange}
                  autoFocus
                  startAdornment={<PickValuePercentSelect />}
                />
              )}
              <FormBrlInput<FormType>
                name="finalValue"
                label="Valor total"
                startAdornment={<>R$</>}
                width="flex-[1_0_200px]"
                additionalOnChange={handleTotalValueChange}
              />
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
            <Button
              type="submit"
              form="quotation-values"
              RightIcon={IconCircleCheck}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
