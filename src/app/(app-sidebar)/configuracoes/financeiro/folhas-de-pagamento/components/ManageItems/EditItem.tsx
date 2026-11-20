'use client'

// React
import { InfoHint } from '@/components/common/InfoHint'
import { useEffect } from 'react'

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

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Types
import {
  hasRate as templateHasRate,
  isSystemItem,
  behaviorFields,
  behaviorOptions,
  type PayrollTemplate,
} from '../../types'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData?: PayrollTemplate
}

export function EditItemDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const { reset, handleSubmit, formState, watch, setError } = form

  useEffect(() => {
    if (open && rowData) {
      reset({
        name: rowData.name,
        behavior: rowData.behavior,
        defaultIncrease: rowData.defaultIncrease ?? 0,
        defaultDiscount: rowData.defaultDiscount ?? 0,
        rate: rowData.rate ?? null,
      })
    }
  }, [open, rowData, reset])

  // 13º e férias são da lei (F-14): só a referência muda
  const lawItem = !!rowData?.fixedByLaw
  // O salário base e os encargos da CLT (systemKey) têm o comportamento do
  // sistema, e os valores deles vêm do cadastro do colaborador e da
  // alíquota, não do padrão
  const system = !!rowData && isSystemItem(rowData)
  // Só INSS e FGTS têm alíquota
  const hasRate = !!rowData && templateHasRate(rowData)
  const { showIncrease, showDiscount } = behaviorFields(watch('behavior'))

  const onSubmit = async (data: FormType) => {
    if (!rowData) return

    if (hasRate && data.rate === null) {
      setError('rate', { message: 'Informe a alíquota' })
      return
    }

    // Vai só o que mudou: a alíquota nova refaz os encargos de todos os CLT,
    // e o comportamento novo vale para a linha de todos os colaboradores
    const fields = behaviorFields(data.behavior)
    const increase = fields.showIncrease ? data.defaultIncrease : 0
    const discount = fields.showDiscount ? data.defaultDiscount : 0
    const rate =
      hasRate && data.rate !== null ? Math.round(data.rate * 100) / 100 : null

    const result = await updateItemNew({
      route: `/financial/payroll-templates/${encodeURIComponent(rowData.id)}`,
      data: {
        name: data.name,
        ...(!system &&
          data.behavior !== rowData.behavior && { behavior: data.behavior }),
        ...(!system &&
          increase !== rowData.defaultIncrease && {
            defaultIncrease: increase,
          }),
        ...(!system &&
          discount !== rowData.defaultDiscount && {
            defaultDiscount: discount,
          }),
        ...(rate !== null && rate !== rowData.rate && { rate }),
      },
    })

    if (!result.success) {
      toast.error(result.message)
      return
    }

    toast.success('Item de custo atualizado')
    queryClient.invalidateQueries()
    handleOpenChange(false)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen(openDialog)
    if (!openDialog) reset(defaultValues)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Editar item de custo</DialogTitle>
          <DialogDescription>
            {lawItem
              ? 'Férias e 13º são calculados por lei: só a referência muda.'
              : 'A alteração vale para a folha de todos os colaboradores.'}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              id="payroll-template-form"
            >
              <div className="grid gap-4 py-4">
                <FormInput<FormType>
                  name="name"
                  label="Referência"
                  placeholder="Digite aqui"
                  width="flex-[1_0_300px]"
                />
                <FormSelect<FormType>
                  name="behavior"
                  label="Comportamento na folha"
                  options={behaviorOptions(rowData?.behavior)}
                  disabled={system}
                  width="flex-[1_0_300px]"
                />
                {system && !lawItem && (
                  <p className="-mt-2 text-sm text-gray">
                    {rowData?.isBase || rowData?.systemKey === 'BASE_SALARY'
                      ? 'O salário base é sempre acréscimo e vem do cadastro de cada colaborador.'
                      : 'Encargo da CLT: o comportamento é o da lei, e o valor sai do salário base pela alíquota.'}
                  </p>
                )}

                {hasRate && (
                  <>
                    <FormInput<FormType>
                      name="rate"
                      label="Alíquota"
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      inputMode="decimal"
                      endAdornment={<span className="text-sm">%</span>}
                      width="flex-[1_0_160px]"
                    />
                    <p className="-mt-2 text-sm text-gray">
                      Mudar a alíquota refaz o {rowData?.name} de todos os
                      colaboradores CLT, menos os que têm o valor informado à
                      mão.
                    </p>
                  </>
                )}

                {!system && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium">Valor padrão</p>
                      <InfoHint title="Valor padrão">
                        <p>
                          O valor padrão entra na folha de quem receber o item
                          daqui em diante.
                        </p>
                        <p>Quem já tem o item continua com o valor que tem.</p>
                      </InfoHint>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {showIncrease && (
                        <FormBrlInput<FormType>
                          name="defaultIncrease"
                          label="Acréscimo padrão"
                          startAdornment={<>R$</>}
                          width="flex-[1_0_160px]"
                        />
                      )}
                      {showDiscount && (
                        <FormBrlInput<FormType>
                          name="defaultDiscount"
                          label="Desconto padrão"
                          startAdornment={<>R$</>}
                          width="flex-[1_0_160px]"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
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
              RightIcon={IconCircleCheck}
              isLoading={formState.isSubmitting}
              form="payroll-template-form"
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
