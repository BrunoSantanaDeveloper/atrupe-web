'use client'

// O serviço terceirizado avulso como item do orçamento (T-6, 24/10/2026):
// o botão "Terceirizado" do "Qual item deseja adicionar?", como no legado.
// Nome, fornecedor do cadastro, quantidade e custo unitário; o preço vem
// sugerido pela API (custo + acréscimo sobre o custo) e quem vê valores
// pode alterar. Vira um item do orçamento; ao aprovar, a conta a pagar ao
// fornecedor nasce como a do terceirizado dentro do item.

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormInput } from '@/components/common/form/FormInput'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { PermissionGate } from '@/components/common/PermissionGate'
import { SupplierSelector } from '@/components/common/form/global-inputs/SupplierAsyncSelect'

import {
  addOutsourcedItem,
  previewOutsourcedItem,
} from '@/actions/outsourced-item'
import { usePermissions } from '@/hooks/usePermissions'
import { formatCurrencyToBrl } from '@/lib/utils'
import { QUOTATION_DATA_QUERY_KEY } from '../../[quotationId]/components/Quotation'

const schema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do serviço').max(200),
  supplier: z
    .object({ value: z.string(), label: z.string() })
    .nullable()
    .refine((value) => !!value?.value, 'Informe o fornecedor'),
  quantity: z.coerce.number().int().min(1, 'Informe a quantidade'),
  cost: z.number().min(1, 'Informe o custo do terceirizado'),
  price: z.number().min(0).optional().nullable(),
})
type FormType = z.infer<typeof schema>

const EMPTY: FormType = {
  name: '',
  supplier: null,
  quantity: 1,
  cost: 0,
  price: null,
}

interface Props {
  open: boolean
  quotationId: string
  onClose: () => void
}

export function QuotationOutsourcedModal({
  open,
  quotationId,
  onClose,
}: Props) {
  const queryClient = useQueryClient()
  const { hasPermission } = usePermissions()
  const canSeeValues = hasPermission('values:values:view')
  const [priceEdited, setPriceEdited] = useState(false)

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  })
  const { watch, setValue, reset } = form
  const cost = watch('cost') || 0
  const quantity = Number(watch('quantity')) || 1
  const price = watch('price') || 0

  useEffect(() => {
    if (open) {
      reset(EMPTY)
      setPriceEdited(false)
    }
  }, [open, reset])

  // O preço sugerido vem da API: a tela não calcula preço (SEG-1)
  const { data: previewRes } = useQuery({
    queryKey: ['outsourced-preview', quotationId, cost],
    queryFn: () => previewOutsourcedItem({ quotationId, cost }),
    enabled: open && cost > 0,
  })
  const preview = previewRes?.success ? previewRes.data : null
  const suggested: number | null = preview?.suggestedPrice ?? null
  const markup: number | null = preview?.markup ?? null

  // O preço acompanha o sugerido até o vendedor mexer nele
  useEffect(() => {
    if (priceEdited || suggested === null) return
    setValue('price', suggested)
  }, [suggested, priceEdited, setValue])

  const submit = form.handleSubmit(async (values) => {
    const res = await addOutsourcedItem({
      quotationId,
      data: {
        name: values.name,
        supplierId: values.supplier!.value,
        quantity: values.quantity,
        cost: values.cost,
        ...(canSeeValues && values.price != null
          ? { price: values.price }
          : {}),
      },
    })
    if (!res.success) {
      toast.error(res.message || 'Não foi possível lançar o terceirizado.')
      return
    }
    toast.success('Terceirizado lançado.')
    queryClient.invalidateQueries({ queryKey: [QUOTATION_DATA_QUERY_KEY] })
    onClose()
  })

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Terceirizado</DialogTitle>
          <DialogDescription>
            Um serviço contratado de fornecedor só para esta venda. Ao aprovar o
            orçamento, a conta a pagar ao fornecedor é gerada com o custo
            informado. O custo não aparece no orçamento.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form onSubmit={submit} className="flex flex-wrap gap-4">
              <FormInput
                name="name"
                label="Serviço"
                placeholder="Ex.: instalação da fachada"
                width="w-full"
              />
              <SupplierSelector
                name="supplier"
                label="Fornecedor"
                width="flex-[1_0_280px]"
              />
              <FormInput
                name="quantity"
                label="Quantidade"
                type="number"
                min={1}
                width="flex-[1_0_120px]"
              />
              <FormBrlInput<FormType>
                name="cost"
                label="Custo unitário"
                startAdornment={<>R$</>}
                width="flex-[1_0_160px]"
              />
              <PermissionGate permissions={['values:values:view']}>
                <div className="flex-[1_0_200px] space-y-1">
                  <FormBrlInput<FormType>
                    name="price"
                    label="Preço de venda unitário"
                    startAdornment={<>R$</>}
                    width="w-full"
                    additionalOnChange={() => setPriceEdited(true)}
                  />
                  <p className="text-xs text-gray">
                    {suggested === null
                      ? 'Informe o custo para ver o preço sugerido pelo acréscimo da empresa.'
                      : `Acréscimo de ${markup} % sobre o custo = ${formatCurrencyToBrl(suggested)}`}
                    {priceEdited && suggested !== null ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="link"
                        className="ml-1 h-auto p-0 text-xs"
                        onClick={() => {
                          setPriceEdited(false)
                          setValue('price', suggested)
                        }}
                      >
                        usar o sugerido
                      </Button>
                    ) : null}
                  </p>
                  {quantity > 1 ? (
                    <p className="text-xs text-gray">
                      Total do item: {formatCurrencyToBrl(price * quantity)}
                    </p>
                  ) : null}
                </div>
              </PermissionGate>
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="neutralOutline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={submit}
            isLoading={form.formState.isSubmitting}
          >
            Lançar no orçamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
