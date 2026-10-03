'use client'

// As fórmulas escritas neste produto (IP-2, 03/10/2026): a conta que dá a
// quantidade do recurso quando nenhum tipo de cálculo pronto serve. São do
// produto, porque dependem dos campos dele; para reaproveitar, copia-se a
// composição de outro produto.

import { useState } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
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
} from '@/actions/product-assembly'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconPencil, IconTrash } from '@tabler/icons-react'

const EDIT = ['product_settings:products:edit']

interface Props {
  productId: string
  fields: QuoteField[]
  formulas: (ProductFormula & { usedBy: string[]; error: string | null })[]
  testVars: { [name: string]: number }
}

export function ProductFormulas({
  productId,
  fields,
  formulas,
  testVars,
}: Props) {
  const queryClient = useQueryClient()
  const [dialog, setDialog] = useState<
    { kind: 'new' } | { kind: 'edit'; formula: ProductFormula } | null
  >(null)

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['assembly', productId] })

  const { mutate: remove } = useMutation({
    mutationFn: (formulaId: string) =>
      removeProductFormula({ productId, formulaId }),
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
        ? await updateProductFormula({
            productId,
            formulaId: dialog.formula.id,
            ...values,
          })
        : await addProductFormula({ productId, ...values })
    if (!response.success) {
      toast.error(response.message)
      return false
    }
    toast.success(dialog?.kind === 'edit' ? 'Fórmula salva' : 'Fórmula criada')
    await invalidate()
    return true
  }

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 space-y-0">
        <div className="min-w-0 flex-1 basis-80">
          <CardTitle>Fórmulas do produto</CardTitle>
          <CardDescription>
            Quando nenhum tipo de cálculo pronto serve, escreva a conta: ela lê
            as medidas, o tempo e os campos do orçamento deste produto e passa a
            aparecer nos tipos de cálculo das linhas. Vale só neste produto.
          </CardDescription>
        </div>
        <PermissionGate permissions={EDIT}>
          <Button
            type="button"
            size="md"
            variant="neutralOutline"
            LeftIcon={IconPlus}
            onClick={() => setDialog({ kind: 'new' })}
          >
            Nova fórmula
          </Button>
        </PermissionGate>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6">
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
            Nenhuma fórmula ainda. Ela também pode ser criada de dentro da
            linha, na última opção do tipo de cálculo.
          </p>
        )}
      </CardContent>
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
        testVars={testVars}
        onOpenChange={(open) => {
          if (!open) setDialog(null)
        }}
        onSave={save}
      />
    </Card>
  )
}
