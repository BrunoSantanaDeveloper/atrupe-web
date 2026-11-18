'use client'

// As fórmulas escritas neste produto (IP-2, 03/10/2026): a conta que dá a
// quantidade do recurso quando nenhum tipo de cálculo pronto serve. São do
// produto, porque dependem dos campos dele; para reaproveitar, copia-se a
// composição de outro produto.

import { InfoHint } from '@/components/common/InfoHint'
import { useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { FormulaDialog, type FormulaValues } from './AssemblyDialogs'

// Types
import type { QuoteField, ProductFormula } from '../assembly'

// Actions
import {
  addProductFormula,
  removeProductFormula,
  updateProductFormula,
} from '@/actions/assembly'
import {
  addProcessFormula,
  removeProcessFormula,
  updateProcessFormula,
} from '@/actions/processes'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react'

const EDIT = ['product_settings:composition:edit']

interface Props {
  productId: string
  fields: QuoteField[]
  formulas: (ProductFormula & { usedBy: string[]; error: string | null })[]
  // "montante · X": o material das linhas, para a fórmula ler (MT-10.1)
  lineRefs?: string[]
  testVars: { [name: string]: number }
  // Como seção dentro do card Composição (03/10/2026): recurso avançado,
  // que só aparece depois da primeira fórmula criada pela linha
  bare?: boolean
  // O processo usa o mesmo card com outro título e explicação (05/10/2026)
  title?: string
  description?: string
  // O processo lê outra consulta: avisa para ela recarregar
  onSaved?: () => void | Promise<unknown>
}

export function ProductFormulas({
  productId,
  fields,
  formulas,
  lineRefs = [],
  testVars,
  bare = false,
  title = 'Fórmulas do produto',
  description = 'Quando nenhum tipo de cálculo pronto serve, escreva a conta: ela lê as medidas, o tempo e os campos do orçamento deste produto e passa a aparecer nos tipos de cálculo das linhas. Vale só neste produto.',
  onSaved,
}: Props) {
  const queryClient = useQueryClient()
  // O processo e o produto gravam na API
  const isProcess = productId.startsWith('processo:')
  const [dialog, setDialog] = useState<
    { kind: 'new' } | { kind: 'edit'; formula: ProductFormula } | null
  >(null)

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['assembly', productId] })
    await onSaved?.()
  }

  const { mutate: remove } = useMutation({
    mutationFn: (formulaId: string) =>
      isProcess
        ? removeProcessFormula({ hostId: productId, formulaId })
        : removeProductFormula({ productId, formulaId }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)
      toast.success('Fórmula removida')
      invalidate()
    },
    onError: () => toast.error('Erro ao remover a fórmula'),
  })

  const save = async (values: FormulaValues) => {
    const response =
      dialog?.kind === 'edit'
        ? isProcess
          ? await updateProcessFormula({
              hostId: productId,
              formulaId: dialog.formula.id,
              ...values,
            })
          : await updateProductFormula({
              productId,
              formulaId: dialog.formula.id,
              ...values,
            })
        : isProcess
          ? await addProcessFormula({ hostId: productId, ...values })
          : await addProductFormula({ productId, ...values })
    if (!response.success) {
      toast.error(response.message)
      return false
    }
    toast.success(dialog?.kind === 'edit' ? 'Fórmula salva' : 'Fórmula criada')
    await invalidate()
    return true
  }

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1 basis-80">
        <div className="flex items-center gap-1.5">
          {bare ? (
            <p className="text-sm font-semibold text-gray-700">{title}</p>
          ) : (
            <CardTitle>{title}</CardTitle>
          )}
          <InfoHint title={title}>
            <p>{description}</p>
          </InfoHint>
        </div>
      </div>
      <PermissionGate permissions={EDIT}>
        <Button
          type="button"
          size={bare ? 'sm' : 'md'}
          variant="neutralOutline"
          LeftIcon={IconPlus}
          onClick={() => setDialog({ kind: 'new' })}
        >
          Nova fórmula
        </Button>
      </PermissionGate>
    </div>
  )

  const dialogNode = (
    <FormulaDialog
      open={!!dialog}
      initial={
        dialog?.kind === 'edit'
          ? {
              name: dialog.formula.name,
              expression: dialog.formula.expression,
            }
          : undefined
      }
      fields={fields}
      lineRefs={lineRefs}
      testVars={testVars}
      onOpenChange={(open) => {
        if (!open) setDialog(null)
      }}
      onSave={save}
    />
  )

  const list = (
    <>
      {formulas.length ? (
        formulas.map((formula) => (
          <div
            key={formula.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3"
          >
            <div className="min-w-0 flex-1 basis-64">
              <p className="text-sm font-medium text-gray-800">
                {formula.name}
              </p>
              <p className="font-mono text-xs text-gray">
                {formula.expression}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {formula.processId && (
                <Badge variant="blueLight">veio do processo</Badge>
              )}
              {formula.error ? (
                <Badge variant="errorLight">{formula.error}</Badge>
              ) : formula.usedBy.length ? (
                formula.usedBy.map((step) => (
                  <Badge key={step} variant="neutralLight">
                    {step}
                  </Badge>
                ))
              ) : (
                <Badge variant="warningLight">nenhuma linha usa</Badge>
              )}
            </div>
            <PermissionGate permissions={EDIT}>
              <div className="flex gap-1">
                <ActionButton
                  Icon={IconPencil}
                  variant="neutralGhost"
                  tooltip={`Ajustar ${formula.name}`}
                  onClick={() => setDialog({ kind: 'edit', formula })}
                />
                <ActionButton
                  Icon={IconTrash}
                  variant="errorGhost"
                  tooltip={`Remover ${formula.name}`}
                  onClick={() => remove(formula.id)}
                />
              </div>
            </PermissionGate>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray">
          Nenhuma fórmula ainda. Ela também pode ser criada de dentro da linha,
          na última opção do tipo de cálculo.
        </p>
      )}
    </>
  )

  if (bare) {
    return (
      <div className="space-y-3 border-t border-gray-100 pt-5">
        {header}
        {list}
        {dialogNode}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>{header}</CardHeader>
      <CardContent className="space-y-3 px-6 pb-6">{list}</CardContent>
      {dialogNode}
    </Card>
  )
}
