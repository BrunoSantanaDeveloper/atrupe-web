'use client'

// PROVISÓRIO nos dados: a API ainda não tem os endpoints da frente de caixa.
// A tela implementa as regras FC-1 a FC-20 lendo `src/actions/cash-front.ts`.

// React / Next
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import {
  OpenCashDialog,
  CashMovementDialog,
  CloseCashDialog,
} from './CashDialogs'
import { ReceiveSaleDialog } from './ReceiveSaleDialog'
import { BillingDialog } from './BillingDialog'

// Types
import {
  saleRemaining,
  cashMovementLabel,
  paymentMethodLabel,
  type PendingSale,
} from '../types'

// Actions
import { claimSale, getCashFront, reverseSale } from '@/actions/cash-front'

// Third-party
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAlertDialog } from '@/store/useAlertDialog'

// Icons
// Mesmos ícones do Fluxo financeiro: o polegar é o recebimento (para baixo,
// previsto; para cima, com parte recebida), o ciclo é mudar as parcelas
import {
  IconTrash,
  IconThumbUp,
  IconUserCheck,
  IconThumbDown,
  IconRefreshDot,
  IconPackageExport,
  IconSortAscending,
  IconSortDescending,
  IconDeviceImacCancel,
} from '@tabler/icons-react'

// Consts
import { cashFrontClaimObj } from '@/consts/cashFront'

// Utils
import { updateFilterParam } from '@/lib/filter-utils'
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Os valores estão em centavos, que é o que formatCurrencyToBrl recebe
const money = (value: number) => formatCurrencyToBrl(value)

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

type Aba = 'caixa' | 'receber' | 'retirada'

export function PDV() {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()

  // A aba fica na URL (design.md §5.1): o link guarda onde o caixa estava
  const router = useRouter()
  const params = useSearchParams()
  const abas: Aba[] = ['receber', 'caixa', 'retirada']
  const aba: Aba = abas.includes(params.get('aba') as Aba)
    ? (params.get('aba') as Aba)
    : 'receber'
  const setAba = (value: Aba) =>
    updateFilterParam('aba', value, { router, params })
  const [receiving, setReceiving] = useState<PendingSale>()
  const [billingSale, setBillingSale] = useState<PendingSale>()
  const { data: authSession } = useSession()
  // Reverter para faturamento é restrito (FC-15); por enquanto, o
  // administrador
  const canBill = !!authSession?.user?.isAdmin
  const [dialog, setDialog] = useState('')

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['cash-front'],
    queryFn: () => getCashFront(),
  })

  const session = data?.data?.session
  const sales = data?.data?.sales || []
  const pickups = data?.data?.pickups || []
  // Com um caixa só não há o que reservar: a marca de quem atende e o
  // "Puxar para mim" só aparecem com mais de uma frente de caixa aberta (FC-5)
  const multiCash = (data?.data?.openCashFronts ?? 1) > 1

  // Ordem da fila, como no Fluxo financeiro: da mais antiga para a mais nova
  // (padrão) ou o contrário. Fica na URL
  const sort = params.get('sort') === 'desc' ? 'desc' : 'asc'
  const byApproval = (a: PendingSale, b: PendingSale) =>
    (sort === 'asc' ? 1 : -1) *
    (new Date(a.approvedAt).getTime() - new Date(b.approvedAt).getTime())

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['cash-front'] })

  const isOpen = session?.status === 'OPEN'

  // As vendas que foram para o fluxo financeiro entram no relatório do dia,
  // mas não no saldo do caixa. Ficam separadas de propósito: se entrassem na
  // mesma soma, a conferência do fechamento nunca bateria (FC-12.1)
  const noCaixa = sales.filter((sale) => sale.goesToCash).sort(byApproval)
  const noFluxo = sales.filter((sale) => !sale.goesToCash).sort(byApproval)

  const me = session ? `${session.name} · ${session.operator}` : ''
  const claimOf = (sale: PendingSale) =>
    !sale.claimedBy ? 'FREE' : sale.claimedBy === me ? 'MINE' : 'OTHER'

  const claim = async (sale: PendingSale) => {
    const res = await claimSale(sale.id)
    if (!res.success) return toast.error(res.message)
    toast.success(`${sale.reference} com você`)
    await refresh()
  }

  const cancelSale = (sale: PendingSale) =>
    alertDialog.open({
      title: `Cancelar ${sale.reference}?`,
      description:
        sale.paid > 0
          ? `O cliente já pagou ${money(sale.paid)}. O estorno sai do caixa e fica registrado com a justificativa e com quem o fez.`
          : 'A venda sai da fila do caixa. O cancelamento fica registrado.',
      confirmLabel: 'Cancelar venda',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      onConfirm: async () => {
        const res = await reverseSale(sale.id, 'Cancelamento pelo caixa')

        if (!res.success) throw new Error(res.message)

        await refresh()
      },
      toastMsg: {
        success: 'Venda cancelada e estorno registrado',
        error: 'Erro ao cancelar a venda',
      },
    })

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Frente de caixa"
          supportText={
            session
              ? `${session.name} · ${session.operator} · aberto às ${hora(session.openedAt)}`
              : 'Nenhum caixa aberto'
          }
          primaryCta={
            isOpen ? (
              <PermissionGate permissions={['financial:pdv:edit']}>
                <Button
                  type="button"
                  variant="neutralOutline"
                  onClick={() => setDialog('fechar')}
                >
                  Fechar caixa
                </Button>
              </PermissionGate>
            ) : (
              <PermissionGate permissions={['financial:pdv:create']}>
                <Button type="button" onClick={() => setDialog('abrir')}>
                  Abrir caixa
                </Button>
              </PermissionGate>
            )
          }
          secondaryCta={
            isOpen ? (
              <PermissionGate permissions={['financial:pdv:edit']}>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="neutralOutline"
                    onClick={() => setDialog('suprimento')}
                  >
                    Suprimento
                  </Button>
                  <Button
                    type="button"
                    variant="neutralOutline"
                    onClick={() => setDialog('sangria')}
                  >
                    Sangria
                  </Button>
                </div>
              </PermissionGate>
            ) : undefined
          }
        />

        {!session ? (
          <Card>
            <ListDataTotalEmpty
              icon={IconDeviceImacCancel}
              title="Nenhum caixa aberto"
              description="Abra o caixa para começar a receber. O saldo inicial é o troco que já está na gaveta."
            />
          </Card>
        ) : (
          <>
            {/* Os valores do caixa não ficam na tela principal, à vista de
                quem passa pelo balcão: aparecem só no fechamento */}
            <Card>
              <CardContent className="flex flex-wrap items-center gap-2 px-6 py-4">
                {(
                  [
                    ['receber', `A receber (${noCaixa.length})`],
                    [
                      'caixa',
                      `Movimento do caixa (${session.movements.length})`,
                    ],
                    ['retirada', `Aguardando retirada (${pickups.length})`],
                  ] as const
                ).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    variant={aba === value ? 'default' : 'neutralOutline'}
                    onClick={() => setAba(value)}
                  >
                    {label}
                  </Button>
                ))}
                {aba === 'receber' && (
                  <ActionButton
                    className="ml-auto"
                    size="iconMd"
                    variant="neutralOutline"
                    tooltip={
                      sort === 'asc'
                        ? 'Ordenação decrescente'
                        : 'Ordenação crescente'
                    }
                    Icon={
                      sort === 'asc' ? IconSortDescending : IconSortAscending
                    }
                    onClick={() =>
                      updateFilterParam(
                        'sort',
                        sort === 'asc' ? 'desc' : 'asc',
                        { router, params },
                      )
                    }
                  />
                )}
              </CardContent>
            </Card>

            {aba === 'receber' && (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-full">Venda</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Já pago</TableHead>
                      <TableHead className="text-right">Falta</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {noCaixa.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <p className="font-medium text-gray-800">
                            {sale.reference}
                          </p>
                          <p className="text-sm text-gray">
                            {sale.client} · aprovada às {hora(sale.approvedAt)}
                            {sale.paid > 0 && !sale.delivered
                              ? ' · sinal pago, aguarda retirada'
                              : ''}
                          </p>
                          {multiCash && (
                            <Badge
                              className="mt-1"
                              variant={cashFrontClaimObj[claimOf(sale)].variant}
                            >
                              {claimOf(sale) === 'OTHER'
                                ? sale.claimedBy
                                : cashFrontClaimObj[claimOf(sale)].text}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray">
                          {sale.seller}
                        </TableCell>
                        <TableCell className="text-right">
                          {money(sale.total)}
                        </TableCell>
                        <TableCell className="text-right text-success-600">
                          {sale.paid ? money(sale.paid) : '—'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {money(saleRemaining(sale))}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <PermissionGate
                              permissions={['financial:pdv:edit']}
                            >
                              {multiCash && claimOf(sale) === 'FREE' && (
                                <ActionButton
                                  Icon={IconUserCheck}
                                  variant="neutralGhost"
                                  tooltip="Puxar para mim"
                                  disabled={!isOpen}
                                  onClick={() => claim(sale)}
                                />
                              )}
                              <ActionButton
                                Icon={
                                  sale.paid > 0 ? IconThumbUp : IconThumbDown
                                }
                                variant={
                                  sale.paid > 0
                                    ? 'warningGhost'
                                    : 'neutralGhost'
                                }
                                tooltip={
                                  !isOpen
                                    ? 'Abra o caixa para receber'
                                    : claimOf(sale) === 'OTHER'
                                      ? `Sendo atendida no ${sale.claimedBy}`
                                      : sale.paid > 0
                                        ? 'Receber o restante'
                                        : 'Receber'
                                }
                                disabled={!isOpen || claimOf(sale) === 'OTHER'}
                                onClick={() => setReceiving(sale)}
                              />
                              {canBill &&
                                sale.kind === 'QUICK' &&
                                sale.paid === 0 && (
                                  <ActionButton
                                    Icon={IconRefreshDot}
                                    variant="neutralGhost"
                                    tooltip="Faturar para o cliente"
                                    onClick={() => setBillingSale(sale)}
                                  />
                                )}
                              <ActionButton
                                Icon={IconTrash}
                                variant="errorGhost"
                                tooltip="Cancelar a venda"
                                onClick={() => cancelSale(sale)}
                              />
                            </PermissionGate>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {noFluxo.length > 0 && (
                      <>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableCell colSpan={6} className="text-sm text-gray">
                            <strong>Foram para o fluxo financeiro</strong> —
                            cliente com forma de pagamento definida. Aparecem
                            aqui como registro do dia e{' '}
                            <strong>não entram no saldo do caixa</strong>.
                          </TableCell>
                        </TableRow>
                        {noFluxo.map((sale) => (
                          <TableRow key={sale.id} className="text-gray">
                            <TableCell>
                              <p className="font-medium">{sale.reference}</p>
                              <p className="text-sm">{sale.client}</p>
                            </TableCell>
                            <TableCell className="text-sm">
                              {sale.seller}
                            </TableCell>
                            <TableCell className="text-right">
                              {money(sale.total)}
                            </TableCell>
                            <TableCell colSpan={2} className="text-right">
                              <Badge variant="neutralLight">
                                {sale.billing || 'Faturamento mensal'}
                              </Badge>
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
                {noCaixa.length === 0 && noFluxo.length === 0 && (
                  <ListDataTotalEmpty
                    icon={IconPackageExport}
                    title="Nada esperando o caixa"
                    description="As vendas aprovadas aparecem aqui assim que o vendedor as aprova"
                  />
                )}
              </Card>
            )}

            {aba === 'caixa' && (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Hora</TableHead>
                      <TableHead className="w-full">Movimento</TableHead>
                      <TableHead>Forma</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableCell className="text-sm text-gray">
                        {hora(session.openedAt)}
                      </TableCell>
                      <TableCell className="text-sm text-gray" colSpan={2}>
                        Abertura do caixa por {session.operator}
                      </TableCell>
                      <TableCell className="text-right text-sm text-gray">
                        {money(session.openingBalance)}
                      </TableCell>
                    </TableRow>
                    {session.movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm text-gray">
                          {hora(movement.createdAt)}
                        </TableCell>
                        <TableCell>
                          <p className="text-gray-700">
                            {movement.description}
                          </p>
                          <p className="text-sm text-gray">
                            {cashMovementLabel[movement.kind]}
                            {movement.reason ? ` · ${movement.reason}` : ''}
                            {movement.responsible
                              ? ` · ${movement.responsible}`
                              : ''}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm text-gray">
                          {movement.parts
                            .map((part) => paymentMethodLabel[part.method])
                            .join(' + ')}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'text-right font-medium',
                            movement.kind === 'WITHDRAWAL' ||
                              movement.kind === 'REVERSAL'
                              ? 'text-error-600'
                              : 'text-success-600',
                          )}
                        >
                          {movement.kind === 'WITHDRAWAL' ||
                          movement.kind === 'REVERSAL'
                            ? '−'
                            : ''}
                          {money(
                            movement.parts.reduce(
                              (total, part) => total + part.amount,
                              0,
                            ),
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <CardFooter>
                  <p className="max-w-xl text-sm text-gray">
                    O cartão entra pelo <strong>valor cheio</strong>. A taxa
                    aparece na previsão do caixa principal, com o líquido entre
                    parênteses, e é confirmada na baixa. O total do caixa
                    aparece no fechamento.
                  </p>
                </CardFooter>
              </Card>
            )}

            {aba === 'retirada' && (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-full">Trabalho</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Aguardando há</TableHead>
                      <TableHead className="text-right">
                        Falta receber
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickups.map((pickup) => {
                      return (
                        <TableRow key={pickup.id}>
                          <TableCell>
                            <p className="font-medium text-gray-800">
                              {pickup.reference}
                            </p>
                            <p className="text-sm text-gray">{pickup.client}</p>
                          </TableCell>
                          <TableCell className="text-sm text-gray">
                            {pickup.phone}
                          </TableCell>
                          <TableCell className="text-sm text-gray-700">
                            {pickup.daysWaiting === 1
                              ? '1 dia'
                              : `${pickup.daysWaiting} dias`}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {money(pickup.remaining)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <CardFooter>
                  <p className="text-sm text-gray">
                    Esta lista responde <strong>para quem ligar</strong>. Não há
                    prazo no sistema: cada empresa decide quando dar baixa, e o
                    que não foi pago é lançado como perda.
                  </p>
                </CardFooter>
              </Card>
            )}
          </>
        )}

        <ReceiveSaleDialog
          sale={receiving}
          onDone={refresh}
          onOpenChange={(open) => !open && setReceiving(undefined)}
        />
        <BillingDialog
          sale={billingSale}
          onDone={refresh}
          onOpenChange={(open) => !open && setBillingSale(undefined)}
        />
        <OpenCashDialog
          open={dialog === 'abrir'}
          onDone={refresh}
          onOpenChange={() => setDialog('')}
        />
        <CashMovementDialog
          kind={dialog === 'sangria' ? 'WITHDRAWAL' : 'SUPPLY'}
          open={dialog === 'sangria' || dialog === 'suprimento'}
          onDone={refresh}
          onOpenChange={() => setDialog('')}
        />
        {session && (
          <CloseCashDialog
            session={session}
            open={dialog === 'fechar'}
            onDone={() => {
              refresh()
              toast.success('Caixa fechado')
            }}
            onOpenChange={() => setDialog('')}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
