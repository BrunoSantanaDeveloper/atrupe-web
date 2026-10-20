'use client'

// React / Next
import { useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import { formatHoursLabel } from '@/components/common/RateInput'
import { WorkloadModal } from './WorkloadModal'
import { LoadError } from '../../components/LoadError'
import { FeatureGate } from '@/components/common/FeatureGate'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { EditPriceModal } from '@/app/(app-sidebar)/precificacao/components/EditPriceModal'

// Types
import type { LaborSector } from '../../types'
import type { PricingItem } from '@/app/(app-sidebar)/precificacao/types'

// Actions
import { getPricingItem } from '@/actions/pricing'
import { getLaborSectors } from '@/actions/cost-base'

// Hooks / Store / Consts
import { FEATURES } from '@/consts/features'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { formatReferenceMonth } from '../../reference-month'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery } from '@tanstack/react-query'

// Icons
import { IconClock, IconUsers, IconCurrencyReal } from '@tabler/icons-react'

// Sem número mostra `-`; valor não calculado nunca vira R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

export function LaborCosts() {
  const [workload, setWorkload] = useState<LaborSector>()

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['labor-sectors'],
    queryFn: () => getLaborSectors(),
  })

  const sectors = data?.data?.sectors || []
  const referenceMonth = formatReferenceMonth(data?.data?.referenceMonth)

  // O preço da hora é o item do setor na Precificação (DC-6). A regra e o
  // lucro gravados não vêm na lista da mão de obra: o item é lido ao abrir
  const [pricing, setPricing] = useState<PricingItem>()
  const {
    mutate: openPricing,
    isPending: isOpeningPricing,
    variables: openingSector,
  } = useMutation({
    mutationFn: (sector: LaborSector) =>
      getPricingItem({ group: 'labor', id: sector.id, name: sector.name }),
    onSuccess: (response) => {
      if (!response.success || !response.data) {
        return toast.error(response.message || 'Erro ao abrir a precificação')
      }

      setPricing(response.data)
    },
    onError: () => toast.error('Erro ao abrir a precificação'),
  })

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>Mão de obra por setor</CardTitle>
          <CardDescription>
            O custo hora sai do custo do setor dividido pela carga horária dos
            colaboradores. A margem mostra o resultado do preço praticado sobre
            esse custo.
            {referenceMonth ? ` Mês de referência: ${referenceMonth}.` : ''}
          </CardDescription>
        </CardHeader>
        {isLoading ? (
          <TableSkeleton cols={7} rows={6} />
        ) : data && !data.success ? (
          <LoadError message={data.message} />
        ) : !sectors.length ? (
          <ListDataTotalEmpty
            icon={IconUsers}
            title="Nenhum setor produtivo cadastrado"
            description="Cadastre os setores da empresa para precificar a hora de mão de obra."
          />
        ) : (
          <CardContent>
            <Table className="min-w-[860px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[24%] min-w-[160px]">Setor</TableHead>
                  <TableHead numeric className="w-[16%]">
                    Custo distribuído
                  </TableHead>
                  <TableHead numeric className="w-[14%]">
                    Carga horária
                  </TableHead>
                  <TableHead numeric className="w-[14%]">
                    Custo hora
                  </TableHead>
                  <TableHead numeric className="w-[14%]">
                    Preço hora
                  </TableHead>
                  <TableHead numeric className="w-[12%]">
                    Margem atual
                  </TableHead>
                  <TableHead className="w-[6%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sectors.map((sector) => (
                  <TableRow key={sector.id}>
                    <TableCell className="font-medium">{sector.name}</TableCell>
                    <TableCell numeric>
                      {formatValue(sector.distributedCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      {sector.hours === null
                        ? '-'
                        : formatHoursLabel(sector.hours)}
                    </TableCell>
                    <TableCell numeric>
                      {formatValue(sector.costPerHour)}
                    </TableCell>
                    <TableCell numeric>
                      {formatValue(sector.salePrice)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        sector.margin !== null &&
                          sector.margin < 0 &&
                          'text-error-700',
                      )}
                    >
                      {sector.margin === null
                        ? '-'
                        : `${sector.margin.toString().replace('.', ',')}%`}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <ActionButton
                          Icon={IconClock}
                          tooltip={`Carga de produção — ${sector.name}`}
                          onClick={() => setWorkload(sector)}
                        />
                        {/* O mesmo modal da Precificação, para o setor. Só
                            aparece com a Precificação no plano e para quem
                            pode gravar preço: sem isso a API recusa */}
                        <FeatureGate features={[FEATURES.COSTS.PRICING_CENTER]}>
                          <PermissionGate permissions={['cost:pricing:edit']}>
                            <ActionButton
                              Icon={IconCurrencyReal}
                              tooltip={`Precificar a hora de ${sector.name}`}
                              isLoading={
                                isOpeningPricing &&
                                openingSector?.id === sector.id
                              }
                              disabled={isOpeningPricing}
                              onClick={() => openPricing(sector)}
                            />
                          </PermissionGate>
                        </FeatureGate>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
      <WorkloadModal
        sector={workload}
        open={!!workload}
        onOpenChange={() => setWorkload(undefined)}
      />
      {/* Ao salvar, o modal invalida a mão de obra: o preço e a margem da
          linha voltam da API */}
      <EditPriceModal
        group="labor"
        item={pricing}
        open={!!pricing}
        onOpenChange={() => setPricing(undefined)}
      />
    </TooltipProvider>
  )
}
