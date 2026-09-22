'use client'

// React / Next
import { Fragment, useState } from 'react'

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

// Components
import { ActionButton } from '@/components/common/ActionButton'

// Types
import type { SectorCost, SectorCostItem } from '../../types'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'
import { sectorAllocationObj, sectorCostOriginObj } from '@/consts/cost-base'

// Icons
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'

interface Props {
  title: string
  sectors: SectorCost[]
  isDistributing: boolean
}

// Sem custo mostra `-`; valor não calculado nunca vira R$ 0,00 (design.md §7)
const formatValue = (value: number | null) =>
  value === null ? '-' : formatCurrencyToBrl(value)

const sum = (sectors: SectorCost[], key: keyof SectorCost) =>
  sectors.reduce((total, sector) => total + ((sector[key] as number) || 0), 0)

export function SectorCostsData({ title, sectors, isDistributing }: Props) {
  const [expanded, setExpanded] = useState<string[]>([])

  const toggle = (id: string) =>
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )

  const itemsByOrigin = (items: SectorCostItem[]) =>
    [...items].sort((a, b) => a.origin.localeCompare(b.origin))

  return (
    <CardContent>
      <Table className="min-w-[1040px]">
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[4%]" />
            <TableHead className="w-[22%] min-w-[180px]">{title}</TableHead>
            <TableHead className="w-[12%] text-right">Mão de obra</TableHead>
            <TableHead className="w-[12%] text-right">Patrimônios</TableHead>
            <TableHead className="w-[12%] text-right">Depreciação</TableHead>
            <TableHead className="w-[12%] text-right">Outros custos</TableHead>
            <TableHead className="w-[13%] text-right">Custo próprio</TableHead>
            {isDistributing && (
              <>
                <TableHead className="w-[13%] text-right">
                  Administrativo recebido
                </TableHead>
                <TableHead className="w-[13%] text-right">
                  Custo total
                </TableHead>
              </>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectors.map((sector) => {
            const isExpanded = expanded.includes(sector.id)

            return (
              <Fragment key={sector.id}>
                <TableRow>
                  <TableCell>
                    <ActionButton
                      Icon={isExpanded ? IconChevronDown : IconChevronRight}
                      tooltip={
                        isExpanded
                          ? `Recolher ${sector.name}`
                          : `Detalhar ${sector.name}`
                      }
                      onClick={() => toggle(sector.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{sector.name}</p>
                    <p className="text-sm text-gray">
                      Rateio interno por{' '}
                      {sectorAllocationObj[sector.allocationCriterion]}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatValue(sector.labor)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatValue(sector.assets)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatValue(sector.depreciation)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatValue(sector.other)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatValue(sector.ownCost)}
                  </TableCell>
                  {isDistributing && (
                    <>
                      <TableCell className="text-right">
                        {formatValue(sector.receivedCost)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatValue(sector.totalCost)}
                      </TableCell>
                    </>
                  )}
                </TableRow>
                {isExpanded &&
                  (sector.items.length ? (
                    itemsByOrigin(sector.items).map((item) => (
                      <TableRow key={item.id} className="bg-gray-50">
                        <TableCell />
                        <TableCell colSpan={isDistributing ? 7 : 5}>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="neutralLight">
                              {sectorCostOriginObj[item.origin]}
                            </Badge>
                            <span className="text-sm font-medium">
                              {item.name}
                            </span>
                            <span className="text-sm text-gray">
                              {item.detail}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrencyToBrl(item.value)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow className="bg-gray-50">
                      <TableCell />
                      <TableCell
                        colSpan={isDistributing ? 8 : 6}
                        className="text-sm text-gray"
                      >
                        Nenhum custo lançado neste setor.
                      </TableCell>
                    </TableRow>
                  ))}
              </Fragment>
            )
          })}
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableCell />
            <TableCell className="font-medium">Total</TableCell>
            <TableCell className="text-right">
              {formatCurrencyToBrl(sum(sectors, 'labor'))}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrencyToBrl(sum(sectors, 'assets'))}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrencyToBrl(sum(sectors, 'depreciation'))}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrencyToBrl(sum(sectors, 'other'))}
            </TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrencyToBrl(sum(sectors, 'ownCost'))}
            </TableCell>
            {isDistributing && (
              <>
                <TableCell className="text-right">
                  {formatCurrencyToBrl(sum(sectors, 'receivedCost'))}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrencyToBrl(sum(sectors, 'totalCost'))}
                </TableCell>
              </>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  )
}
