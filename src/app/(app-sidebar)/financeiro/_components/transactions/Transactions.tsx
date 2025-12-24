'use client'

// UI
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { Topbar } from '@/components/common/Topbar'
import { TableFiltersHeader } from '@/components/common/TableHeader'
import { TransactionsData } from './TransactionsTable/TransactionsData'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { TransactionsFilter } from './TransactionsTable/TransactionsFilter'
import { NewTransaction } from '@/app/(app-sidebar)/financeiro/_components/transactions/NewTransaction'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

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
      />
      <div>
        <Card>
          {emptyData ? (
            <Skeleton className="h-[calc(100vh-150px)]" />
          ) : emptyData ? (
            <ListDataTotalEmpty
              icon={IconTrendingUp}
              title={`Sem ${typePt}s cadastradas`}
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
              <TableFiltersHeader searchParams={searchParams}>
                <TransactionsFilter searchParams={searchParams} />
              </TableFiltersHeader>
              <TransactionsData searchParams={searchParams} type={type} />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
