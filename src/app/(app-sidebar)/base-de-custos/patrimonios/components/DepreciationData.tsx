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
import { TableSkeletonRows } from '@/components/common/TableSkeleton'

// Types
import type {
  AssetItem,
  AssetKind,
} from '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/patrimonios/types'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { assetKindObj, assetLifeStatusObj } from '@/consts/assets'

interface Props {
  // Os bens do cadastro de patrimônios, como a API de /asset devolve (P-23)
  assets: AssetItem[]
  isLoading?: boolean
}

// Sem depreciação calculada (vida útil ou residual faltando) mostra `-`,
// nunca R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

const kindOrder: AssetKind[] = ['MACHINES', 'FURNITURE', 'VEHICLES']

export function DepreciationData({ assets, isLoading }: Props) {
  const groups = kindOrder
    .map((kind) => ({
      kind,
      assets: assets.filter((asset) => asset.kind === kind),
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
          {isLoading ? (
            <TableSkeletonRows cols={9} />
          ) : (
            groups.map(({ kind, assets: kindAssets }) => (
              <Fragment key={kind}>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableCell colSpan={9}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{assetKindObj[kind]}</span>
                      <Badge variant="neutralLight">{kindAssets.length}</Badge>
                    </div>
                  </TableCell>
                </TableRow>
                {kindAssets.map((asset) => {
                  // Sem vida útil não há o que medir (bem inconsistente, P-26)
                  const progress = asset.usefulLifeMonths
                    ? Math.min(
                        Math.round(
                          (asset.elapsedMonths / asset.usefulLifeMonths) * 100,
                        ),
                        100,
                      )
                    : null

                  return (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        {asset.name}
                      </TableCell>
                      <TableCell>{asset.sector || '-'}</TableCell>
                      <TableCell numeric>
                        {formatCurrencyToBrl(asset.acquisitionValue)}
                      </TableCell>
                      <TableCell numeric>
                        {formatValue(asset.depreciableValue)}
                      </TableCell>
                      <TableCell numeric>
                        {formatValue(asset.monthlyDepreciation)}
                      </TableCell>
                      <TableCell numeric>
                        {formatValue(asset.depreciatedValue)}
                      </TableCell>
                      <TableCell numeric>
                        {formatValue(asset.remainingValue)}
                      </TableCell>
                      <TableCell>
                        {progress === null ? (
                          <p className="text-sm text-gray">Não calculada</p>
                        ) : (
                          <>
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
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          status
                          variant={assetLifeStatusObj[asset.status].variant}
                        >
                          {assetLifeStatusObj[asset.status].text}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </CardContent>
  )
}
