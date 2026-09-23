'use client'

// React
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { ProductField } from '../types'

// Actions
import {
  addProductField,
  removeProductField,
  updateProductField,
} from '@/actions/compositions'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconTrash } from '@tabler/icons-react'

interface Props {
  productId: string
  fields: ProductField[]
}

// Os campos do orçamento pertencem ao PRODUTO, não a cada processo (IP-4).
// No legado, "número de letras" aparecia três vezes, com três nomes e três
// valores diferentes, e nada acusava a divergência.
export function ProductFields({ productId, fields }: Props) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [defaultValue, setDefaultValue] = useState('')

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['composition', productId] })

  const { mutate: add, isPending } = useMutation({
    mutationFn: () =>
      addProductField({
        productId,
        name,
        defaultValue: Number(defaultValue || 0),
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Campo acrescentado')
      setName('')
      setDefaultValue('')
      invalidate()
    },
    onError: () => toast.error('Erro ao acrescentar o campo'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: (fieldId: string) => removeProductField({ productId, fieldId }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Campo removido')
      invalidate()
    },
    onError: () => toast.error('Erro ao remover o campo'),
  })

  const { mutate: rename } = useMutation({
    mutationFn: ({ fieldId, value }: { fieldId: string; value: string }) =>
      updateProductField({ productId, fieldId, name: value }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      invalidate()
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campos do orçamento</CardTitle>
        <CardDescription>
          Além de largura, altura e quantidade, estes são os valores que o
          vendedor informa. Cada um existe uma vez e vale para todas as etapas
          que precisam dele.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-3">
        {fields.length ? (
          fields.map((field) => (
            <div
              key={field.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3"
            >
              <Input
                className="w-full sm:w-[220px]"
                defaultValue={field.name}
                aria-label={`Nome do campo ${field.name}`}
                onBlur={(event) => {
                  const value = event.target.value.trim()

                  if (value && value !== field.name) {
                    rename({ fieldId: field.id, value })
                  }
                }}
              />
              <span className="text-sm text-gray">
                valor padrão {field.defaultValue}
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-1">
                {field.usedBy.length ? (
                  field.usedBy.map((step) => (
                    <Badge key={step} variant="neutralLight">
                      {step}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="warningLight">nenhuma etapa usa</Badge>
                )}
              </div>
              <PermissionGate permissions={['product_settings:products:edit']}>
                <ActionButton
                  Icon={IconTrash}
                  tooltip={`Remover ${field.name}`}
                  onClick={() => remove(field.id)}
                />
              </PermissionGate>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray">
            Este produto ainda não tem campos próprios. Eles aparecem sozinhos
            quando uma etapa precisa de um valor, e podem ser acrescentados aqui
            quando a conta for do produto.
          </p>
        )}

        <PermissionGate permissions={['product_settings:products:edit']}>
          <div className="flex flex-wrap items-end gap-3 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="field-name" className="text-sm font-medium">
                Novo campo
              </label>
              <Input
                id="field-name"
                value={name}
                className="w-full sm:w-[220px]"
                placeholder="Ex.: Número de letras"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="field-value" className="text-sm font-medium">
                Valor padrão
              </label>
              <Input
                id="field-value"
                type="number"
                min={0}
                className="w-[140px]"
                value={defaultValue}
                onChange={(event) => setDefaultValue(event.target.value)}
              />
            </div>
            <Button
              LeftIcon={IconPlus}
              isLoading={isPending}
              disabled={!name}
              onClick={() => add()}
            >
              Acrescentar
            </Button>
          </div>
        </PermissionGate>
      </CardContent>
      <CardFooter className="text-sm text-gray">
        No orçamento, o vendedor vê só estes campos — a composição, as etapas e
        os insumos ficam fora da tela dele.
      </CardFooter>
    </Card>
  )
}
