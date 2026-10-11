'use client'

// UI
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { TableData } from './TableData'
import {
  ListDataTotalEmpty,
  ListDataStatusEmpty,
} from '@/components/common/TableEmptyState'
import { NewEmployeeDialog } from './NewEmployee'
import { UsersQuotaNotice } from './UsersQuotaNotice'
import { TabNavType, Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { TableFiltersHeader } from '@/components/common/TableHeader'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { UsersQuotaType } from '@/types/settings/employee'

// Actions
import { getDataOld } from '@/actions/_cruds'

// Auth
import { useSession } from 'next-auth/react'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconIdBadge, IconNews, IconUserShield } from '@tabler/icons-react'

import Link from 'next/link'

export function Main({ searchParams }: SearchParamsType) {
  const { data: session } = useSession()

  // O limite de usuários da sessão entra na chave para a cota ser relida
  // quando o plano muda fora desta tela: a compra de usuário adicional ou a
  // troca de plano, também em outra aba, e o refresh depois de um erro de
  // plano atualizam a sessão. Com a chave fixa e o cache sem prazo, a cota
  // velha deixava "Novo usuário" desabilitado até recarregar a página.
  const sessionUserLimit = session?.company?.plan?.limits?.max_users ?? null

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['employees-totals', sessionUserLimit],
    queryFn: () => getDataOld({ route: 'employeeTotalsRoute' }),
    // Com a tela aberta, a troca de chave mostra os números anteriores até
    // a cota nova chegar, sem desmontar a tabela.
    placeholderData: (previous) => previous,
  })

  const totals: { [key: string]: number } = {
    ativos: data?.ACTIVES,
    inativos: data?.INACTIVES,
    todos: data?.TOTAL,
  }

  // A cota conta a empresa inteira no servidor: a conta feita no front só
  // via a página e o filtro carregados.
  const usersQuota: UsersQuotaType | undefined = data?.USERS

  const status = searchParams.status
  const statusEmpty = totals?.[status] === 0

  const tabs: TabNavType[] = [
    {
      value: 'ACTIVE',
      tab: 'ativos',
      label: 'Ativos',
      count: totals?.ativos,
    },
    {
      value: 'INACTIVE',
      tab: 'inativos',
      label: 'Inativos',
      count: totals?.inativos,
    },
    {
      value: '',
      tab: 'todos',
      label: 'Todos',
      count: totals?.todos,
    },
  ]

  const statusLabel =
    tabs?.find((tab) => tab.tab === searchParams.status)?.label || ''

  return (
    <PermissionGate permissions={['company_settings:users:view']}>
      <div className="space-y-5">
        <Topbar
          title="Colaboradores e usuários"
          tabs={tabs}
          previousPage="/configuracoes/empresa-e-sistema"
          activeTab={searchParams?.status || 'todos'}
          paramName="status"
          primaryCta={
            <PermissionGate permissions={['company_settings:users:create']}>
              <NewEmployeeDialog />
            </PermissionGate>
          }
          secondaryCta={
            <PermissionGate permissions={['company_settings:users:edit']}>
              <Button
                asChild
                type="button"
                variant="neutralOutline"
                LeftIcon={IconIdBadge}
              >
                <Link href="/configuracoes/empresa-e-sistema/cargos">
                  Cargos
                </Link>
              </Button>
            </PermissionGate>
          }
        />
        {usersQuota ? <UsersQuotaNotice quota={usersQuota} /> : null}
        <div>
          <Card>
            {isLoading ? (
              <Skeleton className="h-[calc(100vh-150px)]" />
            ) : totals?.todos && totals?.todos > 0 ? (
              statusEmpty ? (
                <ListDataStatusEmpty
                  title={`Nenhum colaborador para o status: ${statusLabel}`}
                  icon={IconNews}
                />
              ) : (
                <>
                  <TableFiltersHeader searchParams={searchParams}>
                    {/* <EmployeeFilter searchParams={searchParams} /> */}
                  </TableFiltersHeader>
                  <TableData
                    searchParams={searchParams}
                    tabs={tabs}
                    usersQuota={usersQuota}
                  />
                </>
              )
            ) : (
              <ListDataTotalEmpty
                icon={IconUserShield}
                title="Nenhum colaborador cadastrado"
                description="Cadastre seu primeiro colaborador"
                cta={
                  <PermissionGate
                    permissions={['company_settings:users:create']}
                  >
                    <NewEmployeeDialog />
                  </PermissionGate>
                }
              />
            )}
          </Card>
        </div>
      </div>
    </PermissionGate>
  )
}
