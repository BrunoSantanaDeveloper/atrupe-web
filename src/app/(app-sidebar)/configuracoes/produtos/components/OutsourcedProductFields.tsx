'use client'

// O bloco do produto terceirizado (T-5, 24/10/2026): comprado de fornecedor
// e revendido. Fornecedor obrigatório (um ou mais, de Cadastros ›
// Fornecedores) e o custo do fornecedor por unidade de venda; o preço de
// venda continua o campo de sempre, com a sugestão pelo acréscimo sobre o
// custo. Cada venda aprovada gera a conta a pagar ao fornecedor.

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { IconX } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { FormSwitch } from '@/components/common/form/FormSwitch'
import { FormBrlInput } from '@/components/common/form/FormBrlInput'
import { SupplierSelector } from '@/components/common/form/global-inputs/SupplierAsyncSelect'
import { convertUnitCostToRaw } from '@/components/common/form/global-inputs/products/UnitCostInput'

import { getSalesSettings } from '@/actions/sales-settings'
import { outsourcedPriceFromCost } from '@/lib/quotation'
import { formatCurrencyToBrl } from '@/lib/utils'
import type { NewProductsFormType } from './schema'

const UNIT_NAME: Record<string, string> = {
  AREA: 'm²',
  LENGTH: 'metro',
  CAPACITY: 'litro',
  WEIGHT: 'kg',
  DISTANCE: 'km',
  DURATION: 'hora',
}

type Pick = { value?: string; label?: string } | null | undefined

export function OutsourcedProductFields() {
  const form = useFormContext<NewProductsFormType>()
  const { watch, setValue } = form
  const on = watch('isOutsourced')
  const suppliers = watch('suppliers') || []
  const cost = watch('outsourcedCost') || 0
  const unitKind = watch('items.0.unitKind') || 'UNITY'
  const pick = watch('supplierPick') as Pick

  // O fornecedor escolhido entra na lista e a busca volta vazia
  useEffect(() => {
    if (!pick?.value) return
    if (!suppliers.some((supplier) => supplier.id === pick.value)) {
      setValue(
        'suppliers',
        [...suppliers, { id: pick.value, name: pick.label || '' }],
        { shouldDirty: true },
      )
    }
    setValue('supplierPick', null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick?.value])

  // O acréscimo da empresa, para sugerir o preço (quem não configura
  // vendas não vê a sugestão)
  const { data: settings } = useQuery({
    queryKey: ['sales-settings'],
    queryFn: () => getSalesSettings(),
    staleTime: Infinity,
    enabled: !!on,
  })
  const markup = settings?.success ? settings.data.outsourcedMarkup : null
  const suggested =
    markup !== null && cost > 0 ? outsourcedPriceFromCost(cost, markup) : null

  const useSuggested = () => {
    if (suggested === null) return
    setValue('items.0.unitCost', convertUnitCostToRaw(unitKind, suggested), {
      shouldDirty: true,
    })
  }

  const unit = UNIT_NAME[unitKind] || 'unidade'

  return (
    <div className="w-full rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center gap-1.5">
        <FormSwitch name="isOutsourced" label="Produto terceirizado" />
      </div>
      <p className="text-sm text-gray">
        Comprado de fornecedor e revendido: ao aprovar a venda, o sistema gera a
        conta a pagar ao fornecedor com o custo informado aqui.
      </p>
      {on ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <SupplierSelector
              name="supplierPick"
              label="Fornecedor"
              width="flex-[1_0_280px]"
            />
            <FormBrlInput<NewProductsFormType>
              name="outsourcedCost"
              label={`Custo do fornecedor por ${unit}`}
              startAdornment={<>R$</>}
              width="flex-[1_0_200px]"
            />
          </div>
          {suppliers.length ? (
            <div className="flex flex-wrap gap-2">
              {suppliers.map((supplier) => (
                <Badge key={supplier.id} variant="neutralLight">
                  {supplier.name}
                  <button
                    type="button"
                    aria-label={`Retirar ${supplier.name}`}
                    className="ml-1 inline-flex"
                    onClick={() =>
                      setValue(
                        'suppliers',
                        suppliers.filter((item) => item.id !== supplier.id),
                        { shouldDirty: true },
                      )
                    }
                  >
                    <Icon icon={IconX} size="sm" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-error">
              Escolha pelo menos um fornecedor.
            </p>
          )}
          {suggested !== null ? (
            <p className="text-xs text-gray">
              Preço de venda sugerido pelo acréscimo de {markup} % sobre o
              custo: {formatCurrencyToBrl(suggested)} por {unit}.{' '}
              <Button
                type="button"
                size="sm"
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={useSuggested}
              >
                usar o sugerido
              </Button>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
