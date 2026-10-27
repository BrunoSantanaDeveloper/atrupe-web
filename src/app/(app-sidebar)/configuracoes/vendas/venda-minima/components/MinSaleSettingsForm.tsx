'use client'

// Venda mínima por item da empresa (GR-4, decidida em 27/10/2026): R$ 15 é o
// usual na gráfica rápida. No orçamento, o item abaixo desse valor é cobrado
// pelo mínimo, com aviso. Vale junto com a quantidade mínima do produto: o
// maior dos dois. Guardada em centavos no GET/PUT /sale/settings (patch 14).

// React
import { useEffect, useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

// Components
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'

// Actions
import { getSalesSettings, updateSalesSettings } from '@/actions/sales-settings'

// Libs
import { formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const EXAMPLE_ITEM = 900

export function MinSaleSettingsForm() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['sales-settings'],
    queryFn: () => getSalesSettings(),
  })
  const settings = data?.data

  // Na tela em reais; na API em centavos
  const [minValueText, setMinValueText] = useState('0')
  const minValue = Math.max(
    0,
    Math.round((Number(minValueText.replace(',', '.')) || 0) * 100),
  )

  useEffect(() => {
    if (settings) setMinValueText(String((settings.minItemValue ?? 0) / 100))
  }, [settings])

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => updateSalesSettings({ minItemValue: minValue }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)
      toast.success('Venda mínima atualizada')
      queryClient.invalidateQueries({ queryKey: ['sales-settings'] })
    },
    onError: () => toast.error('Erro ao salvar'),
  })

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  return (
    <div className="space-y-5">
      <Topbar
        title="Venda mínima por item"
        previousPage="/configuracoes/vendas"
        supportText="O menor valor que um item do orçamento pode ter"
      />

      <Card>
        <CardHeader>
          <CardTitle>Venda mínima por item</CardTitle>
          <CardDescription>
            Abaixo deste valor, o item é cobrado pelo mínimo e a tela avisa o
            vendedor. Vale junto com a quantidade mínima do produto: quando o
            mínimo do produto dá menos do que a venda mínima, fica valendo a
            venda mínima. Em branco ou zero, não há mínimo.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="min-item-value"
                className="text-sm font-medium text-gray-700"
              >
                Venda mínima por item
              </label>
              <Input
                id="min-item-value"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                startAdornment={<span className="text-sm">R$</span>}
                value={minValueText}
                onChange={(event) => setMinValueText(event.target.value)}
              />
            </div>
            <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <p className="font-medium">Exemplo</p>
              <p>
                Um adesivo de 0,3 × 0,3 m a R$ 100,00 o m² dá{' '}
                {formatCurrencyToBrl(EXAMPLE_ITEM)}. Com a venda mínima de{' '}
                {formatCurrencyToBrl(minValue)}, o item sai por{' '}
                <span className="font-semibold text-gray-900">
                  {formatCurrencyToBrl(Math.max(EXAMPLE_ITEM, minValue))}
                </span>
                .
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <PermissionGate permissions={['sales_settings:series:edit']}>
            <Button isLoading={isPending} onClick={() => save()}>
              Salvar
            </Button>
          </PermissionGate>
        </CardFooter>
      </Card>
    </div>
  )
}
