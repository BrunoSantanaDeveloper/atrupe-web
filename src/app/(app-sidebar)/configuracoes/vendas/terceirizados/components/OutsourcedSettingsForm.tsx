'use client'

// O acréscimo sobre o custo do terceirizado avulso (MS-16, T-4; nome e
// conta decididos em 24/10/2026, T-5). O legado aplicava 45 % sem mostrar;
// aqui o percentual é da empresa, aparece no painel "Acrescentar a este
// item" e o vendedor pode alterar o preço na hora. "Markup" fica só na
// Precificação (PRO), que é outra conta. A API ainda chama o campo de
// outsourcedMarkup.

// React
import { InfoHint } from '@/components/common/InfoHint'
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import { getSalesSettings, updateSalesSettings } from '@/actions/sales-settings'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'
import { outsourcedPriceFromCost } from '@/lib/quotation'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const EXAMPLE_COST = 20000

export function OutsourcedSettingsForm() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['sales-settings'],
    queryFn: () => getSalesSettings(),
  })
  const settings = data?.data

  const [markup, setMarkup] = useState('45')

  useEffect(() => {
    if (settings) setMarkup(String(settings.outsourcedMarkup))
  }, [settings])

  const markupNumber = Number(markup.replace(',', '.')) || 0
  const valid = markupNumber >= 0 && markupNumber <= 1000

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateSalesSettings({ outsourcedMarkup: markupNumber }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)
      toast.success('Acréscimo do terceirizado atualizado')
      queryClient.invalidateQueries({ queryKey: ['sales-settings'] })
    },
    onError: () => toast.error('Erro ao salvar'),
  })

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  return (
    <div className="space-y-5">
      <Topbar
        title="Terceirizado avulso"
        previousPage="/configuracoes/vendas"
        supportText="Como o preço do terceirizado lançado na hora é formado"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-1.5">
            <CardTitle>Acréscimo sobre o custo do terceirizado</CardTitle>
            <InfoHint title="Acréscimo sobre o custo do terceirizado">
              <p>
                No orçamento, o vendedor informa o custo do fornecedor e o
                sistema propõe o preço de venda: custo + este percentual. O
                percentual aparece ao lado do preço e o vendedor pode alterar o
                valor na hora. O terceirizado não recebe rateio nem custo de
                estrutura: o preço é só o custo mais o acréscimo.
              </p>
            </InfoHint>
          </div>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="outsourced-markup"
                className="text-sm font-medium text-gray-700"
              >
                Acréscimo sobre o custo
              </label>
              <Input
                id="outsourced-markup"
                type="number"
                min={0}
                max={1000}
                step={1}
                inputMode="decimal"
                endAdornment={<span className="text-sm">%</span>}
                value={markup}
                onChange={(event) => setMarkup(event.target.value)}
              />
              {!valid && (
                <p className="text-xs text-error">
                  Informe um percentual entre 0 % e 1000 %.
                </p>
              )}
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <p className="font-medium">Exemplo</p>
              <p>
                Um custo de {formatCurrencyToBrl(EXAMPLE_COST)} vira{' '}
                <span className="font-semibold text-gray-900">
                  {valid
                    ? formatCurrencyToBrl(
                        outsourcedPriceFromCost(EXAMPLE_COST, markupNumber),
                      )
                    : '-'}
                </span>{' '}
                de preço de venda.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <PermissionGate permissions={['sales_settings:series:edit']}>
            <Button
              isLoading={isPending}
              disabled={!valid}
              onClick={() => save()}
            >
              Salvar
            </Button>
          </PermissionGate>
        </CardFooter>
      </Card>
    </div>
  )
}
