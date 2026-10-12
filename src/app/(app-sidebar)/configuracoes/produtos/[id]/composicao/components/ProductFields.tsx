'use client'

// Os campos do orçamento pertencem ao PRODUTO, não a cada etapa (IP-4). No
// legado, "número de letras" aparecia três vezes, com três nomes e três
// valores diferentes, e nada acusava a divergência. Aqui o campo é declarado
// uma vez; a linha cuja fórmula lê um campo aponta para ele pelo nome, e o
// vendedor preenche um valor só (IP-6). Desde 03/10/2026 isso substitui o
// campo extra da etapa. Cada campo diz se aceita fração (IP-19, 05/10/2026):
// inteiro por padrão (nº de letras, ilhoses); fracionado quando marcado
// (metros).

import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { QuoteField } from '../assembly'

// Actions
import {
  addProductField,
  removeProductField,
  updateProductField,
} from '@/actions/product-assembly'
import {
  addProcessField,
  removeProcessField,
  updateProcessField,
} from '@/actions/processes'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconTrash } from '@tabler/icons-react'

const EDIT = ['product_settings:products:edit']

interface Props {
  productId: string
  fields: (QuoteField & { usedBy: string[] })[]
  // O processo usa o mesmo card com outra explicação
  description?: string
  // Como seção dentro de outro card (o bloco Produto da composição,
  // 03/10/2026): os campos ficam junto de largura, altura e quantidade
  bare?: boolean
  // O processo lê outra consulta: avisa para ela recarregar
  onSaved?: () => void | Promise<unknown>
}

// Campo inteiro recusa decimal na simulação (IP-19)
const integerError = (allowsFraction: boolean | undefined, value: number) =>
  !allowsFraction && !Number.isInteger(value)
    ? 'Campo inteiro: sem decimais. Ligue "Aceita fração" se precisar.'
    : null

export function ProductFields({
  productId,
  fields,
  description,
  bare = false,
  onSaved,
}: Props) {
  const queryClient = useQueryClient()
  // O processo (`processo:<id>`) já grava na API; o produto, no exemplo
  const isProcess = productId.startsWith('processo:')
  const [name, setName] = useState('')
  const [defaultValue, setDefaultValue] = useState('')
  const [allowsFraction, setAllowsFraction] = useState(false)
  const [valueError, setValueError] = useState<string | null>(null)

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['assembly', productId] })
    await onSaved?.()
  }

  const { mutate: add, isPending } = useMutation({
    mutationFn: () => {
      const values = {
        name,
        defaultValue: Number(defaultValue || 0),
        allowsFraction,
      }
      return isProcess
        ? addProcessField({ hostId: productId, ...values })
        : addProductField({ productId, ...values })
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)
      toast.success('Campo acrescentado')
      setName('')
      setDefaultValue('')
      setAllowsFraction(false)
      setValueError(null)
      invalidate()
    },
    onError: () => toast.error('Erro ao acrescentar o campo'),
  })

  const { mutate: remove } = useMutation({
    mutationFn: (fieldId: string) =>
      isProcess
        ? removeProcessField({ hostId: productId, fieldId })
        : removeProductField({ productId, fieldId }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)
      toast.success('Campo removido')
      invalidate()
    },
    onError: () => toast.error('Erro ao remover o campo'),
  })

  const { mutate: update } = useMutation({
    mutationFn: (values: {
      fieldId: string
      name?: string
      defaultValue?: number
      allowsFraction?: boolean
    }) =>
      isProcess
        ? updateProcessField({ hostId: productId, ...values })
        : updateProductField({ productId, ...values }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)
      invalidate()
    },
  })

  const newValueError = integerError(allowsFraction, Number(defaultValue || 0))

  const title = 'Campos do orçamento'
  const help =
    description ||
    'Além de largura, altura e quantidade, estes são os valores que o vendedor informa. Crie o campo aqui e ele passa a aparecer nos tipos de cálculo das linhas ("Por perímetro ÷ nome do campo"). Cada um existe uma vez e vale para todas as etapas que precisam dele.'

  const body = (
    <>
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
                  update({ fieldId: field.id, name: value })
                }
              }}
            />
            <label className="flex items-center gap-2 text-sm text-gray">
              valor padrão
              <Input
                key={`${field.id}-${field.allowsFraction ? 'dec' : 'int'}-${field.defaultValue}`}
                type="number"
                min={0}
                step={field.allowsFraction ? '0.01' : '1'}
                className="w-[110px]"
                defaultValue={field.defaultValue}
                aria-label={`Valor padrão de ${field.name}`}
                onBlur={(event) => {
                  const value = Number(event.target.value || 0)
                  const error = integerError(field.allowsFraction, value)
                  if (error) {
                    toast.error(`${field.name}: ${error}`)
                    event.target.value = String(field.defaultValue)
                    return
                  }
                  if (value !== field.defaultValue) {
                    update({ fieldId: field.id, defaultValue: value })
                  }
                }}
              />
            </label>
            {/* Inteiro ou fracionado (IP-19): o padrão é inteiro */}
            <PermissionGate
              permissions={EDIT}
              fallback={
                <Badge variant="neutralLight">
                  {field.allowsFraction ? 'aceita fração' : 'inteiro'}
                </Badge>
              }
            >
              <label className="flex items-center gap-2 text-sm text-gray">
                <Switch
                  checked={!!field.allowsFraction}
                  onCheckedChange={(checked) =>
                    update({ fieldId: field.id, allowsFraction: checked })
                  }
                  aria-label={`${field.name} aceita fração`}
                />
                Aceita fração
              </label>
            </PermissionGate>
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
            <PermissionGate permissions={EDIT}>
              <ActionButton
                Icon={IconTrash}
                variant="errorGhost"
                tooltip={`Remover ${field.name}`}
                onClick={() => remove(field.id)}
              />
            </PermissionGate>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray">
          Nenhum campo ainda. Crie um campo aqui (nº de letras, perímetro,
          distância entre ilhoses) e os tipos de cálculo que leem esse valor
          passam a aparecer nas linhas.
        </p>
      )}

      <PermissionGate permissions={EDIT}>
        <div className="flex flex-wrap items-end gap-3 pt-2">
          <div className="flex flex-col">
            <label htmlFor="field-name" className="mb-2 text-sm font-medium">
              Novo campo
            </label>
            <Input
              id="field-name"
              autoComplete="off"
              value={name}
              className="w-full sm:w-[220px]"
              placeholder="Ex.: Número de letras"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="field-value" className="mb-2 text-sm font-medium">
              Valor padrão
            </label>
            <Input
              id="field-value"
              type="number"
              min={0}
              step={allowsFraction ? '0.01' : '1'}
              className="w-[140px]"
              value={defaultValue}
              onChange={(event) => {
                setDefaultValue(event.target.value)
                setValueError(null)
              }}
            />
          </div>
          <label className="flex h-10 items-center gap-2 text-sm text-gray">
            <Switch
              checked={allowsFraction}
              onCheckedChange={setAllowsFraction}
              aria-label="O novo campo aceita fração"
            />
            Aceita fração
          </label>
          <Button
            type="button"
            LeftIcon={IconPlus}
            isLoading={isPending}
            disabled={!name || !!newValueError}
            onClick={() => add()}
          >
            Acrescentar
          </Button>
        </div>
        {(newValueError || valueError) && (
          <p className="text-sm text-error-700">
            {newValueError || valueError}
          </p>
        )}
        <p className="text-xs text-gray">
          Inteiro por padrão (nº de letras, ilhoses): a venda recusa decimal.
          Ligue &quot;Aceita fração&quot; para medidas (metros).
        </p>
      </PermissionGate>
    </>
  )

  if (bare) {
    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <p className="text-sm text-gray">{help}</p>
        </div>
        {body}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{help}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6">{body}</CardContent>
      <CardFooter className="text-sm text-gray">
        No orçamento, o vendedor vê só estes campos. A composição, as etapas e
        os insumos ficam fora da tela dele.
      </CardFooter>
    </Card>
  )
}
