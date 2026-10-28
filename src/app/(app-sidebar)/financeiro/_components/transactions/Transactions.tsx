'use client'

// React
import { useState } from 'react'

// UI
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { Topbar } from '@/components/common/Topbar'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { TransactionsData } from './TransactionsTable/TransactionsData'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { TypeTotalsCard } from './TypeTotalsCard'
import { ExportDataButton } from '@/components/common/ExportDataButton'
import { TopActions } from '@/app/(app-sidebar)/financeiro/fluxo-financeiro/components/TopActions'
import { FinancialFlowFilter } from '@/app/(app-sidebar)/financeiro/fluxo-financeiro/components/FinancialFlowTable/FinancialFlowFilter'
import {
  FINANCIAL_FLOW_EXPORT_COLUMNS,
  type FinancialFlowExportType,
} from '@/app/(app-sidebar)/financeiro/fluxo-financeiro/components/FinancialFlow'
import { NewTransaction } from '@/app/(app-sidebar)/financeiro/_components/transactions/NewTransaction'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { getData } from '@/actions/_cruds'

// Icons
import { IconTrendingUp } from '@tabler/icons-react'

interface Props extends SearchParamsType {
  type: 'receivable' | 'payable'
}

export function Transactions({ type, searchParams }: Props) {
  const typePt = type === 'receivable' ? 'receita' : 'despesa'
  const createPermission =
    type === 'receivable'
      ? 'financial:receivable:create'
      : 'financial:payable:create'

  const emptyData = false // TODO : corrigir
  const [showTotals, setShowTotals] = useState(false)
  // A tela usa a permissão de ver dela; o fluxo também abre
  const viewPermissions = [
    'financial:flow:view',
    type === 'receivable'
      ? 'financial:receivable:view'
      : 'financial:payable:view',
  ]

  // A exportação é a do Fluxo financeiro, só do lado da tela
  const getExport = async () => {
    const result = await getData({
      route: '/financial/flow/export',
      filters: { ...searchParams, type, showValues: 'on' },
    })
    if (!result.success) throw new Error(result.message)
    return (result.data || []) as FinancialFlowExportType[]
  }

  return (
    <div className="space-y-5">
      <Topbar
        title={`Movimentações a ${type === 'receivable' ? 'receber' : 'pagar'}`}
        primaryCta={
          <PermissionGate
            permissions={[createPermission, 'financial:flow:create']}
          >
            <NewTransaction type={type} searchParams={searchParams} />
          </PermissionGate>
        }
        // Os mesmos ícones do Fluxo financeiro (LITE part3, item 2)
        secondaryCta={
          <div className="flex flex-wrap items-center gap-3">
            <PermissionGate permissions={['financial:flow:export']}>
              <ExportDataButton
                columns={FINANCIAL_FLOW_EXPORT_COLUMNS}
                fileName={
                  type === 'receivable' ? 'contas-a-receber' : 'contas-a-pagar'
                }
                getData={getExport}
                sheetName={
                  type === 'receivable' ? 'Contas a receber' : 'Contas a pagar'
                }
                emptyMessage="Nenhuma movimentação disponível para exportação"
              />
            </PermissionGate>
            <TopActions
              showTotals={showTotals}
              setShowTotals={setShowTotals}
              searchParams={searchParams}
              viewPermissions={viewPermissions}
            />
          </div>
        }
      />
      <div>
        <Card>
          {emptyData ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : emptyData ? (
            <ListDataTotalEmpty
              icon={IconTrendingUp}
              title={`Nenhuma ${typePt} cadastrada`}
              description={`Cadastre sua primeira ${typePt}`}
              cta={
                <PermissionGate
                  permissions={[createPermission, 'financial:flow:create']}
                >
                  <NewTransaction type={type} searchParams={searchParams} />
                </PermissionGate>
              }
            />
          ) : (
            <>
              {/* Os filtros do Fluxo financeiro: período, conta, status e
                  forma de pagamento (LITE part3, item 2) */}
              <TableFiltersHeader searchParams={searchParams}>
                <FinancialFlowFilter
                  searchParams={searchParams}
                  permissions={viewPermissions}
                  allowAllPeriods
                />
              </TableFiltersHeader>
              {showTotals && (
                <CardContent className="pb-0">
                  <Separator />
                  <TypeTotalsCard type={type} searchParams={searchParams} />
                </CardContent>
              )}
              <TransactionsData searchParams={searchParams} type={type} />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
