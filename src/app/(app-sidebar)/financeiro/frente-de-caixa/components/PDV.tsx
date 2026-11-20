'use client'

// PROVISÓRIO nos dados: a API ainda não tem os endpoints da frente de caixa.
// A tela implementa as regras FC-1 a FC-20 lendo `src/actions/cash-front.ts`.

// React / Next
import { InfoHint } from '@/components/common/InfoHint'
import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useRouter } from '@/hooks/useRouter'

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
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardFooter } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import {
  OpenCashDialog,
  CloseCashDialog,
  CashTransferDialog,
  ReverseSaleDialog,
  RejectSaleDialog,
  DiscardPickupDialog,
} from './CashDialogs'
import { ReceiveSaleDialog } from './ReceiveSaleDialog'
import { BillingDialog } from './BillingDialog'
import { CashFrontSettingsDialog } from './CashFrontSettingsDialog'
import { nearWorkdayEnd } from '@/lib/workday'
import { SaleReceiptDialog } from './SaleReceiptDialog'
import { SaleNfceDialog, openNfceThermal } from './SaleNfceDialog'

// Types
import {
  daysWaiting,
  saleRemaining,
  cashMovementLabel,
  paymentMethodLabel,
  type PendingSale,
} from '../types'

// Actions
import {
  claimSale,
  releaseSale,
  getCashFront,
  markSaleReady,
  getPdvNfceStatus,
} from '@/actions/cash-front'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { usePermissions } from '@/hooks/usePermissions'

// Icons
// Mesmos ícones do Fluxo financeiro: o polegar é o recebimento (para baixo,
// previsto; para cima, com parte recebida), o ciclo é mudar as parcelas
import {
  IconTrash,
  IconUserCheck,
  IconSettings,
  IconPrinter,
  IconArrowBackUp,
  IconPackage,
  IconArrowsLeftRight,
  IconPackageExport,
  IconSortAscending,
  IconSortDescending,
  IconDeviceImacCancel,
  IconX,
  IconFileInvoice,
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

  // A aba fica na URL (design.md §5.1): o link guarda onde o caixa estava
  const router = useRouter()
  const params = useSearchParams()
  const abas: Aba[] = ['receber', 'caixa', 'retirada']
  const aba: Aba = abas.includes(params.get('aba') as Aba)
    ? (params.get('aba') as Aba)
    : 'receber'
  const [receiving, setReceiving] = useState<PendingSale>()
  const [billingSale, setBillingSale] = useState<PendingSale>()
  const [discarding, setDiscarding] = useState<PendingSale>()
  // Reverter para faturamento é permissão própria (FC-15, PO 13/10/2026)
  const { hasPermission } = usePermissions()
  const canBill = hasPermission('financial:pdv_billing:edit')
  const [reversing, setReversing] = useState<PendingSale>()
  const [rejecting, setRejecting] = useState<PendingSale>()
  const [dialog, setDialog] = useState('')

  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['cash-front'],
    queryFn: () => getCashFront(),
  })

  const session = data?.data?.session
  const sales = data?.data?.sales || []
  // Trabalho pronto e não entregue sai da fila e vai para a retirada (FC-19)
  const pickups = sales.filter((sale) => sale.ready && !sale.delivered)
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
  // Aberto num dia anterior: só fecha (FC-14)
  const stale = isOpen && !!session?.stale
  const canOperate = isOpen && !stale
  // Os caixas de outros operadores esquecidos abertos: quem pode fechar
  // fecha, com justificativa (FC-14)
  const forgotten = data?.data?.forgotten || []
  // O comprovante sai a pedido, não automático (FC-16)
  const [printing, setPrinting] = useState<string>()

  // NFC-e (pedido do Maicol, 20/11/2026): sempre à mão, na linha do
  // recebimento. Sem a NFC-e ativa, o ícone fica apagado e diz o motivo, para
  // a pessoa saber que existe
  const canEmitNfce = hasPermission('nota_fiscal:emitir:create')
  const { data: nfceRes } = useQuery({
    staleTime: 5 * 60_000,
    queryKey: ['pdv-nfce-status'],
    queryFn: () => getPdvNfceStatus(),
  })
  const nfceStatus = nfceRes?.data
  const [nfceSale, setNfceSale] = useState<{
    saleId: string
    description: string
  }>()
  // O ícone vai só no último recebimento de cada venda (o sinal e o resto
  // são dois recebimentos da mesma venda)
  const lastReceiptOfSale = new Set(
    Object.values(
      Object.fromEntries(
        (session?.movements || [])
          .filter((movement) => movement.kind === 'SALE' && movement.saleId)
          .map((movement) => [movement.saleId as string, movement.id]),
      ),
    ),
  )
  const [closingForgotten, setClosingForgotten] = useState<
    (typeof forgotten)[number] | undefined
  >()

  // As vendas que foram para o fluxo financeiro entram no relatório do dia,
  // mas não no saldo do caixa. Ficam separadas de propósito: se entrassem na
  // mesma soma, a conferência do fechamento nunca bateria (FC-12.1)
  const noCaixa = sales
    .filter((sale) => sale.goesToCash && !sale.ready)
    .sort(byApproval)
  const noFluxo = sales
    .filter((sale) => !sale.goesToCash && !sale.ready)
    .sort(byApproval)

  const markReady = async (sale: PendingSale) => {
    const res = await markSaleReady(sale.id)
    if (!res.success) return toast.error(res.message)
    toast.success(`${sale.reference} aguardando retirada`)
    await refresh()
  }

  const me = session ? `${session.name} · ${session.operator}` : ''
  const claimOf = (sale: PendingSale) =>
    !sale.claimedBy ? 'FREE' : sale.claimedBy === me ? 'MINE' : 'OTHER'

  const release = async (sale: PendingSale) => {
    const res = await releaseSale(sale.id)
    if (!res.success) return toast.error(res.message)
    toast.success(`${sale.reference} de volta à fila`)
    await refresh()
  }

  const claim = async (sale: PendingSale) => {
    const res = await claimSale(sale.id)
    if (!res.success) return toast.error(res.message)
    toast.success(`${sale.reference} com você`)
    await refresh()
  }

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title="Frente de caixa"
          // Topbar já aparece na carga; sessão e ações só depois de saber se
          // há caixa aberto (microinteracoes)
          supportText={
            isLoading
              ? undefined
              : isOpen && session
                ? `${session.name} nº ${session.number} · ${session.operator} · aberto às ${hora(session.openedAt)}`
                : // A API devolve a última sessão também fechada (16/11/2026):
                  // o topo não pode dizer "aberto" de um caixa já fechado
                  session
                  ? `Nenhum caixa aberto · o último, ${session.name} nº ${session.number}, foi fechado${session.closedBy ? ` por ${session.closedBy}` : ''}`
                  : 'Nenhum caixa aberto'
          }
          // As abas ficam na URL (design.md §5.1), com a contagem de cada uma
          paramName="aba"
          activeTab={session ? aba : undefined}
          tabs={
            session
              ? [
                  {
                    value: 'receber',
                    tab: 'receber',
                    label: 'A receber',
                    count: noCaixa.length,
                  },
                  {
                    value: 'caixa',
                    tab: 'caixa',
                    label: 'Movimento do caixa',
                    count: session.movements.length,
                  },
                  {
                    value: 'retirada',
                    tab: 'retirada',
                    label: 'Aguardando retirada',
                    count: pickups.length,
                  },
                ]
              : undefined
          }
          primaryCta={
            isLoading ? undefined : isOpen ? (
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
          // A engrenagem só até o primeiro caixa: a frente (gaveta, contas do
          // PIX e do cartão) é configurada antes de abrir. Depois a
          // configuração fica em Configurações › Financeiro › Frente de caixa
          // (14/11/2026); a API devolve a última sessão, aberta ou fechada
          secondaryCta={
            isLoading ? undefined : (
              <div className="flex items-center gap-2">
                {/* As vendas rápidas do dia (VR-9, 11/11/2026) */}
                <PermissionGate permissions={['sale:quotation:view']}>
                  <Button type="button" variant="neutralOutline" asChild>
                    <Link href="/vendas/vendas-de-hoje?de=caixa">
                      Vendas de hoje
                    </Link>
                  </Button>
                </PermissionGate>
                {!session && (
                  <PermissionGate permissions={['financial:pdv_settings:edit']}>
                    <ActionButton
                      size="iconMd"
                      variant="neutralOutline"
                      tooltip="Configurar frente de caixa"
                      Icon={IconSettings}
                      onClick={() => setDialog('configurar')}
                    />
                  </PermissionGate>
                )}
                {/* Ordem da fila, com o mesmo botão do Fluxo financeiro */}
                {session && aba === 'receber' && (
                  <ActionButton
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
                {/* Transferência (PAD-1): dinheiro mudando de lugar entre a
                    gaveta e uma conta, com origem e destino. Não é receita
                    nem despesa */}
                {canOperate && (
                  <PermissionGate permissions={['financial:pdv:edit']}>
                    <Button
                      type="button"
                      variant="neutralOutline"
                      LeftIcon={IconArrowsLeftRight}
                      onClick={() => setDialog('transferencia')}
                    >
                      Transferência
                    </Button>
                  </PermissionGate>
                )}
              </div>
            )
          }
        />

        {/* Os avisos chegam com os dados, depois da Topbar: entram com fade
            em vez de saltar (microinteracoes) */}
        {canOperate && nearWorkdayEnd(data?.data?.workdayEnd) && (
          <Card className="border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 animate-in fade-in-0 duration-base">
            O expediente termina às {data?.data?.workdayEnd}: feche o caixa
            antes de sair. Aberto, amanhã ele não recebe nem lança nada.
          </Card>
        )}

        {/* O aviso leva ao fechamento (29/10/2026): o botão "Fechar caixa"
            do topo passava despercebido e quem via o aviso não achava como
            fechar o caixa anterior */}
        {stale && session && (
          <Card className="flex flex-col gap-3 border-warning-300 bg-warning-50 p-4 text-sm text-warning-800 sm:flex-row sm:items-center sm:justify-between animate-in fade-in-0 duration-base">
            <p>
              <strong>
                O caixa nº {session.number} foi aberto em{' '}
                {new Date(session.openedAt).toLocaleDateString('pt-BR')} e ficou
                aberto.
              </strong>{' '}
              Feche-o, conferindo a gaveta, para voltar a receber: não se lança
              nada no dia seguinte com o caixa anterior aberto.
            </p>
            <PermissionGate permissions={['financial:pdv:edit']}>
              <Button
                type="button"
                size="sm"
                className="shrink-0"
                onClick={() => setDialog('fechar')}
              >
                Fechar agora
              </Button>
            </PermissionGate>
          </Card>
        )}

        {forgotten.length > 0 && (
          <PermissionGate permissions={['financial:pdv:edit']}>
            <Card className="p-4 animate-in fade-in-0 duration-base">
              <p className="mb-2 text-sm font-medium">
                Caixas esquecidos abertos
              </p>
              <div className="space-y-2">
                {forgotten.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-gray">
                      {item.name} nº {item.number} · {item.operator} · aberto em{' '}
                      {new Date(item.openedAt).toLocaleDateString('pt-BR')}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="neutralOutline"
                      onClick={() => setClosingForgotten(item)}
                    >
                      Fechar com justificativa
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </PermissionGate>
        )}

        {isLoading ? (
          <Card>
            <TableSkeleton cols={6} rows={5} />
          </Card>
        ) : !session ? (
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
            {aba === 'receber' && (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-full">Venda</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead numeric>Total</TableHead>
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
                        <TableCell numeric>{money(sale.total)}</TableCell>
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
                                  disabled={!canOperate}
                                  onClick={() => claim(sale)}
                                />
                              )}
                              {multiCash &&
                                claimOf(sale) === 'MINE' &&
                                sale.paid === 0 && (
                                  <ActionButton
                                    Icon={IconArrowBackUp}
                                    variant="neutralGhost"
                                    tooltip="Devolver à fila"
                                    onClick={() => release(sale)}
                                  />
                                )}
                              <ActionButton
                                gesto="receber"
                                variant={
                                  sale.paid > 0
                                    ? 'warningGhost'
                                    : 'neutralGhost'
                                }
                                tooltip={
                                  !canOperate
                                    ? stale
                                      ? 'Feche o caixa do dia anterior antes de receber'
                                      : 'Abra o caixa para receber'
                                    : claimOf(sale) === 'OTHER'
                                      ? `Sendo atendida no ${sale.claimedBy}`
                                      : sale.paid > 0
                                        ? 'Receber o restante'
                                        : 'Receber'
                                }
                                disabled={
                                  !canOperate || claimOf(sale) === 'OTHER'
                                }
                                onClick={() => setReceiving(sale)}
                              />
                              {/* Sem o gerenciador de produção, o caixa
                                  marca o trabalho pronto: a venda sai da
                                  fila e vai para a retirada (FC-19) */}
                              <ActionButton
                                Icon={IconPackage}
                                variant="neutralGhost"
                                tooltip="Pronto, aguardando retirada"
                                onClick={() => markReady(sale)}
                              />
                              {sale.paid > 0 && sale.quotationId && (
                                <ActionButton
                                  Icon={IconPrinter}
                                  variant="neutralGhost"
                                  tooltip="Comprovante"
                                  onClick={() => setPrinting(sale.quotationId)}
                                />
                              )}
                              {/* Com entrada recebida, fatura o restante (Lista Lite
                                  19/11, item 14) */}
                              {canBill && sale.paid < sale.total && (
                                <ActionButton
                                  gesto="faturar"
                                  variant="neutralGhost"
                                  tooltip="Faturar para o cliente"
                                  onClick={() => setBillingSale(sale)}
                                />
                              )}
                            </PermissionGate>
                            {/* Sem nada recebido, o cliente que desistiu é
                                "rejeitar" (FC-13.1), com a permissão de
                                operar o caixa; com valor recebido, cancelar
                                a venda paga é restrito (FC-15): a permissão
                                de excluir */}
                            {sale.paid === 0 ? (
                              <PermissionGate
                                permissions={['financial:pdv:edit']}
                              >
                                <ActionButton
                                  Icon={IconX}
                                  variant="errorGhost"
                                  tooltip="Rejeitar a venda"
                                  onClick={() => setRejecting(sale)}
                                />
                              </PermissionGate>
                            ) : (
                              <PermissionGate
                                permissions={['financial:pdv:delete']}
                              >
                                <ActionButton
                                  gesto="cancelar"
                                  variant="errorGhost"
                                  tooltip="Cancelar a venda"
                                  onClick={() => setReversing(sale)}
                                />
                              </PermissionGate>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {noFluxo.length > 0 && (
                      <>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableCell colSpan={6} className="text-sm text-gray">
                            <strong>Faturadas pelo caixa para o cliente</strong>{' '}
                            — chegaram como venda rápida e o caixa definiu o
                            cliente e a forma. Já estão no fluxo financeiro e{' '}
                            <strong>não entram no saldo do caixa</strong>; saem
                            daqui no fechamento.
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
                            <TableCell numeric>{money(sale.total)}</TableCell>
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
                      <TableHead numeric>Valor</TableHead>
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
                            {/* A transferência sem motivo grava o motivo
                                "Transferência": não se repete na linha */}
                            {movement.reason &&
                            movement.reason !== 'Transferência'
                              ? ` · ${movement.reason}`
                              : ''}
                            {movement.responsible
                              ? ` · ${movement.responsible}`
                              : ''}
                            {movement.discount
                              ? ` · arredondamento de ${money(movement.discount)} como desconto`
                              : ''}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm text-gray">
                          <div className="flex items-center gap-2">
                            <span>
                              {movement.parts
                                .map((part) => paymentMethodLabel[part.method])
                                .join(' + ')}
                            </span>
                            {/* O comprovante continua depois de recebida a
                                venda (Lista Lite 19/11, item 13) */}
                            {movement.kind === 'SALE' &&
                              movement.quotationId && (
                                <ActionButton
                                  Icon={IconPrinter}
                                  variant="neutralGhost"
                                  tooltip="Comprovante"
                                  onClick={() =>
                                    setPrinting(movement.quotationId)
                                  }
                                />
                              )}
                            {lastReceiptOfSale.has(movement.id) &&
                              movement.saleId &&
                              (movement.nfce &&
                              ['AUTHORIZED', 'CONTINGENCY'].includes(
                                movement.nfce.status,
                              ) ? (
                                <ActionButton
                                  Icon={IconFileInvoice}
                                  variant="neutralGhost"
                                  tooltip={`Cupom da NFC-e${movement.nfce.numero ? ` ${movement.nfce.numero}` : ''}`}
                                  onClick={() =>
                                    openNfceThermal(
                                      (movement.nfce as { id: string }).id,
                                    )
                                  }
                                />
                              ) : movement.nfce &&
                                movement.nfce.status !== 'REJECTED' &&
                                movement.nfce.status !== 'CANCELLED' ? (
                                <ActionButton
                                  Icon={IconFileInvoice}
                                  variant="neutralGhost"
                                  className="opacity-60"
                                  tooltip="NFC-e aguardando a Sefaz"
                                  onClick={() =>
                                    toast.info(
                                      'A NFC-e aguarda a resposta da Sefaz. Acompanhe em Nota fiscal › Notas emitidas.',
                                    )
                                  }
                                />
                              ) : !nfceStatus?.enabled ? (
                                <ActionButton
                                  Icon={IconFileInvoice}
                                  variant="neutralGhost"
                                  className="opacity-40"
                                  tooltip="NFC-e não ativa"
                                  onClick={() =>
                                    toast.info(
                                      nfceStatus?.reason ||
                                        'A NFC-e não está ativa. Ative em Configurações › Nota fiscal.',
                                    )
                                  }
                                />
                              ) : canEmitNfce ? (
                                <ActionButton
                                  Icon={IconFileInvoice}
                                  variant="neutralGhost"
                                  className={cn(
                                    !movement.paidInFull && 'opacity-40',
                                  )}
                                  tooltip={
                                    movement.paidInFull
                                      ? 'Emitir NFC-e'
                                      : 'Receba a venda inteira para emitir a NFC-e'
                                  }
                                  onClick={() =>
                                    movement.paidInFull
                                      ? setNfceSale({
                                          saleId: movement.saleId as string,
                                          description: movement.description,
                                        })
                                      : toast.info(
                                          'Receba a venda inteira para emitir a NFC-e',
                                        )
                                  }
                                />
                              ) : null)}
                          </div>
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
                  <div className="flex items-center gap-1.5 text-xs text-gray">
                    Como funciona
                    <InfoHint title="Cartão no caixa">
                      <p>O cartão entra no caixa pelo valor cheio da venda.</p>
                      <p>
                        No fechamento, o valor vai para a conta da operadora; a
                        taxa da operadora só aparece quando o dinheiro cai
                        (liquidação).
                      </p>
                      <p>Os totais do caixa aparecem no fechamento.</p>
                    </InfoHint>
                  </div>
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
                      <TableHead>Pronto há</TableHead>
                      <TableHead className="text-right">Já pago</TableHead>
                      <TableHead className="text-right">
                        Falta receber
                      </TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickups.map((sale) => {
                      const days = daysWaiting(sale)
                      return (
                        <TableRow key={sale.id}>
                          <TableCell>
                            <p className="font-medium text-gray-800">
                              {sale.reference}
                            </p>
                            <p className="text-sm text-gray">{sale.client}</p>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-gray">
                            {sale.phone || '-'}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-gray-700">
                            {days === 1 ? '1 dia' : `${days} dias`}
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
                                {/* O cliente veio buscar: recebe o restante
                                    e entrega, no mesmo diálogo (FC-12) */}
                                <ActionButton
                                  gesto="receber"
                                  variant={
                                    sale.paid > 0
                                      ? 'warningGhost'
                                      : 'neutralGhost'
                                  }
                                  tooltip={
                                    !canOperate
                                      ? stale
                                        ? 'Feche o caixa do dia anterior antes de receber'
                                        : 'Abra o caixa para receber'
                                      : saleRemaining(sale) > 0
                                        ? 'Receber o restante e entregar'
                                        : 'Entregar'
                                  }
                                  disabled={!canOperate}
                                  onClick={() => setReceiving(sale)}
                                />
                              </PermissionGate>
                              {/* A baixa é "Descartar", quando a empresa
                                  decidir (FC-19): restrita, com justificativa */}
                              <PermissionGate
                                permissions={['financial:pdv:delete']}
                              >
                                <ActionButton
                                  Icon={IconTrash}
                                  variant="errorGhost"
                                  tooltip="Descartar e lançar perda"
                                  onClick={() => setDiscarding(sale)}
                                />
                              </PermissionGate>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                {pickups.length === 0 && (
                  <ListDataTotalEmpty
                    icon={IconPackageExport}
                    title="Nada aguardando retirada"
                    description="O trabalho pronto e não entregue aparece aqui, com há quantos dias espera"
                  />
                )}
                <CardFooter>
                  <div className="flex items-center gap-1.5 text-xs text-gray">
                    Como funciona
                    <InfoHint title="Aguardando retirada">
                      <p>
                        Esta lista serve para saber{' '}
                        <strong>para quem ligar</strong>.
                      </p>
                      <p>
                        A venda entra aqui quando o trabalho fica pronto e o
                        cliente ainda não buscou. Sai quando o cliente busca e
                        paga o restante, ou quando a empresa descarta e lança a
                        perda (o sinal pago é abatido).
                      </p>
                      <p>
                        O sistema não tem prazo para isso: a lista mostra há
                        quantos dias cada venda espera.
                      </p>
                    </InfoHint>
                  </div>
                </CardFooter>
              </Card>
            )}
          </>
        )}

        <ReceiveSaleDialog
          sale={receiving}
          roundingLimit={session?.roundingLimit}
          roundingType={session?.roundingType}
          onDone={refresh}
          onOpenChange={(open) => !open && setReceiving(undefined)}
        />
        <ReverseSaleDialog
          sale={reversing}
          onDone={refresh}
          onOpenChange={(open) => !open && setReversing(undefined)}
        />
        <RejectSaleDialog
          sale={rejecting}
          onDone={refresh}
          onOpenChange={(open) => !open && setRejecting(undefined)}
        />
        <DiscardPickupDialog
          pickup={discarding}
          onDone={refresh}
          onOpenChange={(open) => !open && setDiscarding(undefined)}
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
        <CashTransferDialog
          drawerName={session?.name || 'Caixa'}
          open={dialog === 'transferencia'}
          onDone={refresh}
          onOpenChange={() => setDialog('')}
        />
        {closingForgotten && (
          <CloseCashDialog
            session={closingForgotten}
            forgotten
            open={!!closingForgotten}
            onDone={() => {
              refresh()
              toast.success('Caixa esquecido fechado')
            }}
            onOpenChange={(open) => !open && setClosingForgotten(undefined)}
          />
        )}
        <SaleNfceDialog
          sale={nfceSale}
          onDone={refresh}
          onOpenChange={(open) => !open && setNfceSale(undefined)}
        />
        <SaleReceiptDialog
          quotationId={printing || ''}
          open={!!printing}
          onOpenChange={(open) => !open && setPrinting(undefined)}
        />
        <CashFrontSettingsDialog
          open={dialog === 'configurar'}
          onDone={refresh}
          onOpenChange={() => setDialog('')}
        />
        {session && (
          <CloseCashDialog
            session={session}
            billed={noFluxo}
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
