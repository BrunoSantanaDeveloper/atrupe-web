'use client'

// As abas Configurações produtivas e Custos da janela do bem (28/10/2026).
// Cada linha edita e exclui: na antiga página do bem só dava para lançar, e
// um rendimento digitado errado não tinha conserto pela tela.

// React
import { InfoHint } from '@/components/common/InfoHint'
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

// Components
import { CostModal } from './CostModal'
import { SetupModal } from './SetupModal'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { AssetRecord, AssetCostItem, AssetSetupItem } from '../../types'

// Actions
import { deleteAssetCost, deleteAssetSetup } from '@/actions/asset'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { useAlertDialog } from '@/store/useAlertDialog'
import { costNatureObj, assetUnitShort } from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPencil, IconTrash, IconCurrencyReal } from '@tabler/icons-react'

const EDIT = ['cost:base:edit']

// Sem valor calculado mostra `-`, nunca R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

const formatDate = (date: string | null) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR') : '-'

const num = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

// 1,5 min, 45 min, 1 h 30 min: antes saía "00:1.5" com minuto fracionado
const formatTime = (minutes: number) => {
  if (minutes < 60) return `${num(minutes)} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes - hours * 60
  return rest ? `${hours} h ${num(rest)} min` : `${hours} h`
}

function useRefresh(assetId: string) {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] }),
      queryClient.invalidateQueries({ queryKey: ['assets'] }),
    ])
}

export function SetupsTab({
  asset,
  isInactive,
}: {
  asset: AssetRecord
  isInactive: boolean
}) {
  const alertDialog = useAlertDialog()
  const refresh = useRefresh(asset.id)
  const [editing, setEditing] = useState<AssetSetupItem>()
  const unit = asset.unit ? assetUnitShort[asset.unit] : 'un'

  const remove = (setup: AssetSetupItem) =>
    alertDialog.open({
      title: 'Excluir configuração',
      description: `A configuração "${setup.name}" sai do bem, e o custo da máquina passa a ser repartido entre as outras.`,
      confirmLabel: 'Excluir',
      confirmVariant: 'error',
      onConfirm: async () => {
        const response = await deleteAssetSetup({
          assetId: asset.id,
          setupId: setup.id,
        })
        // Usada em composição, a configuração não sai (P-16)
        if (response.compositions.length) {
          toast.error('A configuração é usada em composições', {
            description: response.compositions
              .map((item) => item.name)
              .join(', '),
          })
          return
        }
        if (!response.success) {
          toast.error(response.message)
          return
        }
        toast.success('Configuração excluída')
        await refresh()
      },
    })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray">
          Como funciona
          <InfoHint title="Configurações produtivas">
            <p>
              Os modos de trabalho do equipamento, cada um com o seu tempo e o
              seu volume mensal. Exemplo: uma impressora em alta qualidade e em
              modo rápido.
            </p>
            <p>
              O volume mensal previsto do bem é a soma das configurações, e o
              custo da máquina é repartido entre elas pelo tempo de atividade.
            </p>
          </InfoHint>
        </div>
        {!isInactive && (
          <PermissionGate permissions={EDIT}>
            <SetupModal asset={asset} />
          </PermissionGate>
        )}
      </div>
      {asset.setups.length ? (
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[24%]">Configuração</TableHead>
              <TableHead className="w-[16%]">Tempo por unidade</TableHead>
              <TableHead className="w-[16%] text-right">
                Volume previsto
              </TableHead>
              <TableHead className="w-[14%] text-right">
                Tempo em atividade
              </TableHead>
              <TableHead numeric className="w-[10%]">
                Custo
              </TableHead>
              <TableHead numeric className="w-[10%]">
                Preço de venda
              </TableHead>
              <TableHead className="w-[10%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {asset.setups.map((setup) => (
              <TableRow key={setup.id}>
                <TableCell>
                  <p className="font-medium">{setup.name}</p>
                  <p className="text-sm text-gray">{setup.abbreviation}</p>
                </TableCell>
                <TableCell className="text-sm">
                  {formatTime(setup.timePerUnit)} por{' '}
                  {assetUnitShort[setup.unit]}
                </TableCell>
                <TableCell className="text-right text-sm">
                  {`${num(setup.monthlyProductivity)} ${assetUnitShort[setup.unit]}/mês`}
                </TableCell>
                <TableCell className="text-right text-sm text-gray">
                  {Math.round(setup.activityHours)} h/mês
                </TableCell>
                <TableCell numeric>{formatValue(setup.unitCost)}</TableCell>
                <TableCell numeric>{formatValue(setup.salePrice)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <ActionButton
                      Icon={IconCurrencyReal}
                      tooltip={`Precificar ${setup.name}`}
                      link="/precificacao/maquinas"
                    />
                    {!isInactive && (
                      <PermissionGate permissions={EDIT}>
                        <ActionButton
                          Icon={IconPencil}
                          tooltip={`Editar ${setup.name}`}
                          onClick={() => setEditing(setup)}
                        />
                        <ActionButton
                          Icon={IconTrash}
                          variant="errorGhost"
                          tooltip={`Excluir ${setup.name}`}
                          onClick={() => remove(setup)}
                        />
                      </PermissionGate>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray">
          Nenhuma configuração produtiva cadastrada. Sem ela, o bem usa o volume
          mensal previsto da aba Patrimônio, em {unit}/mês.
        </p>
      )}
      <SetupModal
        asset={asset}
        setup={editing}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(undefined)}
      />
    </div>
  )
}

export function CostsTab({
  asset,
  isInactive,
}: {
  asset: AssetRecord
  isInactive: boolean
}) {
  const alertDialog = useAlertDialog()
  const refresh = useRefresh(asset.id)
  const [editing, setEditing] = useState<AssetCostItem>()

  const costsByNature = (
    ['FIXED', 'MACHINE_VARIABLE', 'SETUP_VARIABLE'] as const
  ).map((nature) => ({
    nature,
    costs: asset.costs.filter((cost) => cost.nature === nature),
  }))

  const remove = (cost: AssetCostItem) =>
    alertDialog.open({
      title: 'Excluir custo',
      description: `O custo "${cost.name}" sai do bem e do custo do setor.`,
      confirmLabel: 'Excluir',
      confirmVariant: 'error',
      onConfirm: async () => {
        const response = await deleteAssetCost({
          assetId: asset.id,
          costId: cost.id,
        })
        if (!response.success) {
          toast.error(response.message)
          return
        }
        toast.success('Custo excluído')
        await refresh()
      },
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray">
          Como funciona
          <InfoHint title="Custos do bem">
            <p>
              Os custos próprios do equipamento: manutenção, energia, peças,
              seguro.
            </p>
            <p>
              Cada custo aponta para uma conta do plano de contas. Assim o
              comparativo da base de custos mostra o previsto e o que foi
              lançado de verdade.
            </p>
          </InfoHint>
        </div>
        {!isInactive && (
          <PermissionGate permissions={EDIT}>
            <CostModal asset={asset} />
          </PermissionGate>
        )}
      </div>
      {costsByNature.map(({ nature, costs }) => (
        <div key={nature} className="space-y-2">
          <p className="text-sm font-medium">{costNatureObj[nature]}</p>
          {costs.length ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[26%]">Custo</TableHead>
                  <TableHead className="w-[22%]">Regra</TableHead>
                  <TableHead className="w-[22%]">Plano de contas</TableHead>
                  <TableHead className="w-[12%]">Última ocorrência</TableHead>
                  <TableHead className="w-[10%] text-right">Por mês</TableHead>
                  <TableHead className="w-[8%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {costs.map((cost) => (
                  <TableRow key={cost.id}>
                    <TableCell className="font-medium">{cost.name}</TableCell>
                    <TableCell className="text-sm text-gray">
                      {formatCurrencyToBrl(cost.unitCost)} a cada{' '}
                      {num(cost.yieldAmount)}{' '}
                      {cost.yieldUnit === 'MONTH'
                        ? cost.yieldAmount === 1
                          ? 'mês'
                          : 'meses'
                        : asset.unit
                          ? assetUnitShort[asset.unit]
                          : 'unidades'}
                    </TableCell>
                    <TableCell className="text-sm text-gray">
                      {cost.chartAccount || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-gray">
                      {formatDate(cost.lastOccurrence)}
                    </TableCell>
                    <TableCell numeric>
                      {formatCurrencyToBrl(cost.monthlyCost)}
                    </TableCell>
                    <TableCell>
                      {!isInactive && (
                        <PermissionGate permissions={EDIT}>
                          <div className="flex justify-end gap-1">
                            <ActionButton
                              Icon={IconPencil}
                              tooltip={`Editar ${cost.name}`}
                              onClick={() => setEditing(cost)}
                            />
                            <ActionButton
                              Icon={IconTrash}
                              variant="errorGhost"
                              tooltip={`Excluir ${cost.name}`}
                              onClick={() => remove(cost)}
                            />
                          </div>
                        </PermissionGate>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="py-2 text-sm text-gray">Nenhum custo lançado.</p>
          )}
        </div>
      ))}
      <CostModal
        asset={asset}
        cost={editing}
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(undefined)}
      />
    </div>
  )
}
