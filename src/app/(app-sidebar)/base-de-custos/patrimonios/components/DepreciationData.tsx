'use client'

// React / Next
import { Fragment } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { CardContent } from '@/components/ui/card'

// Types
import type { AssetGroup, DepreciationAsset } from '../../types'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { assetGroupObj, assetStatusObj } from '@/consts/cost-base'

interface Props {
  assets: DepreciationAsset[]
}

// Sem depreciação calculada mostra `-`, nunca R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

const groupOrder: AssetGroup[] = ['MACHINES', 'FURNITURE', 'VEHICLES']

export function DepreciationData({ assets }: Props) {
  const groups = groupOrder
    .map((group) => ({
      group,
      assets: assets.filter((asset) => asset.group === group),
    }))
    .filter((item) => item.assets.length)

  return (
    <CardContent>
      <Table className="min-w-[1100px]">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[22%] min-w-[180px]">Patrimônio</TableHead>
            <TableHead className="w-[12%]">Setor</TableHead>
            <TableHead numeric className="w-[12%]">
              Valor aquisição
            </TableHead>
            <TableHead numeric className="w-[12%]">
              Valor depreciável
            </TableHead>
            <TableHead className="w-[12%] text-right">
              Depreciação mensal
            </TableHead>
            <TableHead className="w-[12%] text-right">Já depreciado</TableHead>
            <TableHead numeric className="w-[10%]">
              Valor restante
            </TableHead>
            <TableHead className="w-[14%]">Vida útil</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map(({ group, assets: groupAssets }) => (
            <Fragment key={group}>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableCell colSpan={9}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{assetGroupObj[group]}</span>
                    <Badge variant="neutralLight">{groupAssets.length}</Badge>
                  </div>
                </TableCell>
              </TableRow>
              {groupAssets.map((asset) => {
                const progress = Math.min(
                  Math.round(
                    (asset.elapsedMonths / asset.usefulLifeMonths) * 100,
                  ),
                  100,
                )

                return (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{asset.sector}</TableCell>
                    <TableCell numeric>
                      {formatCurrencyToBrl(asset.acquisitionValue)}
                    </TableCell>
                    <TableCell numeric>
                      {formatCurrencyToBrl(asset.depreciableValue)}
                    </TableCell>
                    <TableCell numeric>
                      {formatValue(asset.monthlyDepreciation)}
                    </TableCell>
                    <TableCell numeric>
                      {formatCurrencyToBrl(asset.depreciatedValue)}
                    </TableCell>
                    <TableCell numeric>
                      {formatCurrencyToBrl(asset.remainingValue)}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray">
                        {asset.usefulLifeMonths} meses · {progress}%
                      </p>
                      <div
                        role="img"
                        aria-label={`Vida útil de ${asset.name}: ${progress}%`}
                        className="mt-1 h-1.5 w-full max-w-[120px] rounded-full bg-gray-100"
                      >
                        <div
                          className="h-1.5 rounded-full bg-brand"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        status
                        variant={assetStatusObj[asset.status].variant}
                      >
                        {assetStatusObj[asset.status].text}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  )
}
