'use client'

// Os quatro parâmetros de referência da empresa (PR-4). Na tela, % com uma
// casa; na API, décimos de ponto (60 = 6,0%). O markup e o preço dos itens
// de regra variável são refeitos pelo servidor ao gravar.

// React / Next
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Types
import type { PricingParameters } from '../../types'

// Actions
import { updatePricingParameters } from '@/actions/pricing'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface Props {
  parameters?: PricingParameters
  open: boolean
  onOpenChange: () => void
}

type Field = 'taxation' | 'commission' | 'financialCost' | 'desiredMargin'

const fields: { name: Field; label: string; description: string }[] = [
  {
    name: 'taxation',
    label: 'Tributação de referência',
    description: 'Alíquota total considerada para seus produtos e serviços.',
  },
  {
    name: 'commission',
    label: 'Comissão de referência',
    description: 'Percentual médio de comissão considerado.',
  },
  {
    name: 'financialCost',
    label: 'Custo financeiro de referência',
    description: 'Custo das formas de pagamento, taxas e antecipações.',
  },
  {
    name: 'desiredMargin',
    label: 'Margem desejada',
    description: 'Margem de lucro que você deseja obter.',
  },
]

// Os parâmetros que o preço variável dos itens acompanha: além da
// Precificação, a hora do setor (base de custos), o material (cadastro) e a
// configuração produtiva (detalhe do bem)
const AFFECTED_QUERIES = [
  'pricing-summary',
  'pricing-parameters',
  'pricing-items',
  'labor-sectors',
  'materials',
  'asset',
  'asset-groups',
]

const empty = {
  taxation: '',
  commission: '',
  financialCost: '',
  desiredMargin: '',
}

const toNumber = (text: string) => Number(text.replace(',', '.')) || 0
// Uma casa decimal: é como o parâmetro é guardado
const toTenths = (text: string) => Math.round(toNumber(text) * 10)
const percentText = (tenths: number) =>
  `${(tenths / 10).toFixed(1).replace('.', ',')}%`

export function EditParametersModal({ parameters, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  // Em texto, para a pessoa digitar com vírgula
  const [values, setValues] = useState<{ [key in Field]: string }>(empty)

  useEffect(() => {
    if (!parameters || !open) return

    setValues({
      taxation: (parameters.taxation / 10).toFixed(1),
      commission: (parameters.commission / 10).toFixed(1),
      financialCost: (parameters.financialCost / 10).toFixed(1),
      desiredMargin: (parameters.desiredMargin / 10).toFixed(1),
    })
  }, [parameters, open])

  const tenths = {
    taxation: toTenths(values.taxation),
    commission: toTenths(values.commission),
    financialCost: toTenths(values.financialCost),
    desiredMargin: toTenths(values.desiredMargin),
  }
  const total =
    tenths.taxation +
    tenths.commission +
    tenths.financialCost +
    tenths.desiredMargin
  // As duas recusas da API, antes de ir até lá
  const problem = Object.values(tenths).some((value) => value < 0)
    ? 'Informe percentuais maiores ou iguais a zero.'
    : total >= 1000
      ? 'A soma dos parâmetros precisa ficar abaixo de 100%.'
      : ''

  const { mutate, isPending } = useMutation({
    mutationFn: () => updatePricingParameters(tenths),
    onSuccess: (response) => {
      if (!response.success) {
        return toast.error(response.message || 'Erro ao salvar os parâmetros')
      }

      toast.success('Parâmetros salvos')
      AFFECTED_QUERIES.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] }),
      )
      onOpenChange()
    },
    onError: () => toast.error('Erro ao salvar os parâmetros'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Editar parâmetros</DialogTitle>
          <DialogDescription>
            Valem para a empresa inteira e formam o markup de referência.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form
            id="pricing-parameters-form"
            noValidate
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              // O Enter no campo também envia: um envio por vez
              if (!problem && !isPending) mutate()
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.name} className="flex flex-col">
                  <Label htmlFor={`pricing-${field.name}`} className="mb-2">
                    {field.label}
                  </Label>
                  <Input
                    id={`pricing-${field.name}`}
                    type="number"
                    min={0}
                    step="0.1"
                    inputMode="decimal"
                    endAdornment={<span className="text-sm text-gray">%</span>}
                    value={values[field.name]}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                  <p className="mt-1.5 text-xs text-gray">
                    {field.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-gray-200 px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-900">Encargos e margem</span>
                <span className="font-medium text-gray-900">
                  {percentText(total)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-gray-900">Sobra para o custo</span>
                <span className="font-medium text-gray-900">
                  {percentText(Math.max(1000 - total, 0))}
                </span>
              </div>
            </div>

            {problem ? (
              <p className="text-sm text-error-700">{problem}</p>
            ) : (
              <p className="text-sm text-gray">
                Ao salvar, o preço de todo item de preço variável é refeito com
                os novos parâmetros, preservando o lucro de cada um. O preço
                fixo não muda: muda a margem dele.
              </p>
            )}
          </form>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="submit"
            form="pricing-parameters-form"
            isLoading={isPending}
            disabled={!!problem}
          >
            Salvar parâmetros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
