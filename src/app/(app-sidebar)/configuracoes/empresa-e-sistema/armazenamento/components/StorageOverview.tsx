'use client'

// O armazenamento da empresa (GP-49; Maicol, 22/11/2026: "bem parecido com
// o iCloud"), em todos os planos e só para o administrador. No alto, o
// espaço usado numa barra dividida pelo que ocupa (arquivos de produção e
// arquivos das O.S.); a recomendação de liberar o que está em O.S.
// entregues; as O.S. que mais ocupam; e a limpeza, com a prévia, a
// confirmação digitada e o automático.

// React / Next
import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { StorageCleanupCard } from '../../../producao/components/StorageCleanup'

// Actions
import { getStorageOverview } from '@/actions/production-manager'

// Utils
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/production-upload'

// Third-party
import { useQuery } from '@tanstack/react-query'

const KINDS = [
  {
    key: 'production',
    label: 'Arquivos de produção',
    hint: 'Artes, provas e versões anexadas nas etapas dos gerenciadores',
    color: 'bg-brand-600',
  },
  {
    key: 'orders',
    label: 'Arquivos das O.S.',
    hint: 'Os arquivos guardados na ordem de serviço',
    color: 'bg-brand-300',
  },
] as const

const STATUS: Record<string, string> = {
  IN_PRODUCTION: 'Em produção',
  DELIVERY: 'Em entrega',
  COMPLETED: 'Concluída',
  FINISHED: 'Finalizada',
  CANCELED: 'Cancelada',
  PENDING: 'Pendente',
}

export function StorageOverviewClient() {
  const { data, isLoading } = useQuery({
    queryKey: ['company-storage'],
    queryFn: () => getStorageOverview(),
  })
  const overview = data?.data
  const used = overview?.storage.usedBytes ?? 0
  const quota = overview?.storage.quotaBytes ?? null
  // Sem limite, a barra é dividida só entre os tipos
  const total = quota && quota > 0 ? Math.max(quota, used) : used || 1
  const share = (bytes: number) => `${Math.max((bytes / total) * 100, 0)}%`

  return (
    <div className="space-y-5">
      <Topbar
        title="Armazenamento"
        previousPage="/configuracoes/empresa-e-sistema"
        supportText="O espaço dos arquivos da empresa: o que ocupa e como liberar."
      />

      {isLoading ? (
        <Skeleton className="h-[200px] rounded-xl" />
      ) : !overview ? (
        <Card>
          <CardContent className="p-6 text-sm text-gray">
            {data?.message || 'Não foi possível ler o armazenamento.'}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-gray">
                    {overview.storage.tier
                      ? overview.storage.tier.name
                      : 'Espaço incluído no plano'}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatBytes(used)}
                    <span className="text-base font-normal text-gray">
                      {quota ? ` de ${formatBytes(quota)} usados` : ' usados'}
                    </span>
                  </p>
                </div>
                <Button asChild variant="neutralOutline">
                  <Link href="/assinatura/contratacao?modo=complementos">
                    Mais espaço
                  </Link>
                </Button>
              </div>

              {/* A barra dividida pelo que ocupa, como no iCloud */}
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
                {KINDS.map((kind) => (
                  <div
                    key={kind.key}
                    className={cn('h-full', kind.color)}
                    style={{ width: share(overview.byKind[kind.key]) }}
                  />
                ))}
              </div>

              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {KINDS.map((kind) => (
                  <li key={kind.key} className="flex items-start gap-2">
                    <span
                      className={cn(
                        'mt-1.5 size-2.5 shrink-0 rounded-full',
                        kind.color,
                      )}
                    />
                    <span>
                      <span className="block text-sm font-medium text-gray-900">
                        {kind.label} · {formatBytes(overview.byKind[kind.key])}
                      </span>
                      <span className="block text-xs text-gray">
                        {kind.hint}
                      </span>
                    </span>
                  </li>
                ))}
                {quota && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-gray-200" />
                    <span className="block text-sm font-medium text-gray-900">
                      Livre · {formatBytes(Math.max(quota - used, 0))}
                    </span>
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>

          {/* A recomendação: o que dá para liberar sem tocar na produção */}
          {overview.cleanableBytes > 0 && (
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-6">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Liberar até {formatBytes(overview.cleanableBytes)}
                  </p>
                  <p className="text-sm text-gray">
                    São arquivos de O.S. entregues (finalizadas). Nada dos
                    cadastros e nada de O.S. ainda não entregue.
                  </p>
                </div>
                <Button asChild variant="neutralOutline">
                  <a href="#limpeza">Ver a limpeza</a>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>O.S. que mais ocupam</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {overview.largest.length ? (
                <ul className="divide-y divide-gray-100">
                  {overview.largest.map((row) => (
                    <li
                      key={row.quotationId}
                      className="flex flex-wrap items-center gap-x-3 gap-y-1 px-6 py-3 text-sm"
                    >
                      {row.orderId ? (
                        <Link
                          href={`/vendas/ordens-de-servico/${row.orderId}`}
                          className="font-medium text-brand-700 hover:underline"
                        >
                          O.S. {row.number}
                        </Link>
                      ) : (
                        <span className="font-medium text-gray-900">
                          Venda {row.number}
                        </span>
                      )}
                      <span className="text-gray-800">{row.client}</span>
                      {row.status && (
                        <Badge variant="neutralLight">
                          {STATUS[row.status] ?? row.status}
                        </Badge>
                      )}
                      <span className="ml-auto tabular-nums text-gray-900">
                        {formatBytes(row.bytes)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-6 pb-6 text-sm text-gray">
                  Nenhum arquivo guardado ainda.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <div id="limpeza">
        <StorageCleanupCard />
      </div>
    </div>
  )
}
