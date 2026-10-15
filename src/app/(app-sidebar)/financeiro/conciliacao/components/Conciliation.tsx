'use client'

// A conciliação com o extrato (CX-6, LITE): o extrato em OFX que todo banco
// exporta casa com os lançamentos da conta pelo valor e pela data. Até 3
// dias úteis o casamento é sozinho; acima disso, sugestão a confirmar. O que
// casou vira realizado; o que sobra fica em duas listas: no extrato e não no
// sistema (vira lançamento aqui), e no sistema e não no extrato (o que não
// caiu). O depósito da operadora liquida o cartão, com a diferença na taxa.

// React
import { useEffect, useRef, useState } from 'react'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'
import { SelectBasic } from '@/components/common/form/FormSelect'
import {
  CreateFromLineDialog,
  LiquidateCardDialog,
  MatchLineDialog,
} from './ConciliationDialogs'

// Actions
import {
  ignoreLine,
  confirmLine,
  unmatchLine,
  importStatement,
  getConciliation,
  type StatementLine,
  type StatementLineStatus,
} from '@/actions/conciliation'
import { getBankAccounts } from '@/actions/cash-accounts'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconCheck,
  IconX,
  IconLink,
  IconPlus,
  IconEyeOff,
  IconCreditCard,
  IconArrowBackUp,
  IconFileImport,
} from '@tabler/icons-react'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

const money = (cents: number) => formatCurrencyToBrl(cents)
const brDate = (day: string) => day.split('-').reverse().join('/')

const statusBadge: Record<
  StatementLineStatus,
  {
    text: string
    variant:
      | 'successLight'
      | 'warningLight'
      | 'errorLight'
      | 'neutralLight'
      | 'blueLight'
  }
> = {
  MATCHED: { text: 'Casada', variant: 'successLight' },
  SUGGESTED: { text: 'Sugestão', variant: 'warningLight' },
  UNMATCHED: { text: 'Só no extrato', variant: 'errorLight' },
  CREATED: { text: 'Lançada', variant: 'blueLight' },
  IGNORED: { text: 'Ignorada', variant: 'neutralLight' },
}

type Dialog =
  | { kind: 'create'; line: StatementLine }
  | { kind: 'match'; line: StatementLine }
  | { kind: 'liquidate'; line: StatementLine }

export function Conciliation() {
  const queryClient = useQueryClient()
  const fileInput = useRef<HTMLInputElement>(null)
  const [accountId, setAccountId] = useState('')
  const [importing, setImporting] = useState(false)
  const [dialog, setDialog] = useState<Dialog>()

  const { data: accountsRes } = useQuery({
    staleTime: Infinity,
    queryKey: ['bank-accounts'],
    queryFn: () => getBankAccounts(),
  })
  // O extrato é de banco (ou da gaveta, se exportar OFX); a operadora se
  // concilia pelo extrato do banco em que o depósito cai
  const accounts = (accountsRes?.data || []).filter(
    (account) => account.isActive && account.kind !== 'CARD',
  )
  const cards = (accountsRes?.data || []).filter(
    (account) => account.isActive && account.kind === 'CARD',
  )

  useEffect(() => {
    if (!accountId && accounts.length) {
      setAccountId(
        accounts.find((account) => account.kind === 'BANK')?.id ||
          accounts[0].id,
      )
    }
  }, [accountId, accounts])

  const { data, isLoading } = useQuery({
    enabled: !!accountId,
    queryKey: ['conciliation', accountId],
    queryFn: () => getConciliation({ bankAccountId: accountId }),
  })
  const view = data?.data

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['conciliation'] }),
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] }),
    ])

  const upload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    form.append('bankAccountId', accountId)
    setImporting(true)
    const res = await importStatement(form)
    setImporting(false)
    if (!res.success || !res.data) return toast.error(res.message)
    const { imported, duplicates, matched, suggested, unmatched } = res.data
    toast.success(
      `${imported} linha(s) importada(s): ${matched} casada(s), ${suggested} sugestão(ões), ${unmatched} sobrando${duplicates ? ` · ${duplicates} já importada(s)` : ''}`,
    )
    await refresh()
  }

  const act = async (
    run: () => Promise<{ success: boolean; message: string }>,
    done: string,
  ) => {
    const res = await run()
    if (!res.success) return toast.error(res.message)
    toast.success(done)
    await refresh()
  }

  const lines = view?.lines || []
  const systemOnly = view?.systemOnly || []
  const pending = lines.filter((line) => line.status === 'UNMATCHED').length

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          title="Conciliação bancária"
          supportText="Importe o extrato em OFX e confira o que caiu na conta"
          primaryCta={
            <PermissionGate permissions={['financial:cash_control:edit']}>
              <input
                ref={fileInput}
                type="file"
                accept=".ofx,.OFX,application/x-ofx"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) upload(file)
                  event.target.value = ''
                }}
              />
              <Button
                LeftIcon={IconFileImport}
                isLoading={importing}
                disabled={!accountId}
                onClick={() => fileInput.current?.click()}
              >
                Importar extrato OFX
              </Button>
            </PermissionGate>
          }
        />

        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <SelectBasic
              name="conciliation-account"
              label="Conta"
              className="w-full max-w-[320px]"
              value={accountId}
              onChange={setAccountId}
              options={accounts.map((account) => ({
                value: account.id,
                label: account.name,
              }))}
            />
            {view && (
              <p className="pb-2 text-sm text-gray">
                {brDate(view.from)} a {brDate(view.to)}
                {pending ? ` · ${pending} linha(s) só no extrato` : ''}
              </p>
            )}
          </div>
        </Card>

        {isLoading ? (
          <Skeleton className="h-[320px]" />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Extrato</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Data</TableHead>
                      <TableHead className="w-full">Descrição</TableHead>
                      <TableHead numeric>Valor</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell>{brDate(line.date)}</TableCell>
                        <TableCell>
                          <p className="font-medium">{line.memo || '—'}</p>
                          {line.matchedWith && (
                            <p className="text-sm text-gray">
                              {line.status === 'SUGGESTED'
                                ? 'Sugestão: '
                                : 'Casou com: '}
                              {line.matchedWith}
                            </p>
                          )}
                        </TableCell>
                        <TableCell
                          numeric
                          className={
                            line.amount < 0
                              ? 'text-error-600'
                              : 'text-success-600'
                          }
                        >
                          {money(line.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            status
                            variant={statusBadge[line.status].variant}
                          >
                            {statusBadge[line.status].text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <PermissionGate
                            permissions={['financial:cash_control:edit']}
                          >
                            <div className="flex justify-end gap-1">
                              {line.status === 'SUGGESTED' && (
                                <>
                                  <ActionButton
                                    Icon={IconCheck}
                                    variant="successGhost"
                                    tooltip="Confirmar o casamento"
                                    onClick={() =>
                                      act(
                                        () => confirmLine(line.id),
                                        'Casamento confirmado',
                                      )
                                    }
                                  />
                                  <ActionButton
                                    Icon={IconX}
                                    variant="neutralGhost"
                                    tooltip="Recusar a sugestão"
                                    onClick={() =>
                                      act(
                                        () => unmatchLine(line.id),
                                        'Sugestão recusada',
                                      )
                                    }
                                  />
                                </>
                              )}
                              {line.status === 'UNMATCHED' && (
                                <>
                                  <ActionButton
                                    Icon={IconLink}
                                    variant="neutralGhost"
                                    tooltip="Casar com um lançamento"
                                    onClick={() =>
                                      setDialog({ kind: 'match', line })
                                    }
                                  />
                                  <ActionButton
                                    Icon={IconPlus}
                                    variant="neutralGhost"
                                    tooltip="Lançar no sistema"
                                    onClick={() =>
                                      setDialog({ kind: 'create', line })
                                    }
                                  />
                                  {line.amount > 0 && cards.length > 0 && (
                                    <ActionButton
                                      Icon={IconCreditCard}
                                      variant="neutralGhost"
                                      tooltip="Liquidar o cartão com este depósito"
                                      onClick={() =>
                                        setDialog({ kind: 'liquidate', line })
                                      }
                                    />
                                  )}
                                  <ActionButton
                                    Icon={IconEyeOff}
                                    variant="neutralGhost"
                                    tooltip="Ignorar esta linha"
                                    onClick={() =>
                                      act(
                                        () => ignoreLine(line.id),
                                        'Linha ignorada',
                                      )
                                    }
                                  />
                                </>
                              )}
                              {(line.status === 'MATCHED' ||
                                line.status === 'IGNORED') && (
                                <ActionButton
                                  Icon={IconArrowBackUp}
                                  variant="neutralGhost"
                                  tooltip="Desfazer"
                                  onClick={() =>
                                    act(
                                      () => unmatchLine(line.id),
                                      'Conciliação desfeita',
                                    )
                                  }
                                />
                              )}
                            </div>
                          </PermissionGate>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!lines.length && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="py-8 text-center text-sm text-gray"
                        >
                          Nenhuma linha de extrato no período. Importe o OFX que
                          o banco exporta.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>No sistema e não no extrato</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Data</TableHead>
                      <TableHead className="w-full">Lançamento</TableHead>
                      <TableHead numeric>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemOnly.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{brDate(entry.day)}</TableCell>
                        <TableCell>{entry.description}</TableCell>
                        <TableCell
                          numeric
                          className={
                            entry.amount < 0
                              ? 'text-error-600'
                              : 'text-success-600'
                          }
                        >
                          {money(entry.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!systemOnly.length && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="py-8 text-center text-sm text-gray"
                        >
                          Tudo o que o sistema tem no período está no extrato.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        <CreateFromLineDialog
          line={dialog?.kind === 'create' ? dialog.line : undefined}
          onDone={refresh}
          onOpenChange={() => setDialog(undefined)}
        />
        <MatchLineDialog
          line={dialog?.kind === 'match' ? dialog.line : undefined}
          candidates={systemOnly}
          onDone={refresh}
          onOpenChange={() => setDialog(undefined)}
        />
        <LiquidateCardDialog
          line={dialog?.kind === 'liquidate' ? dialog.line : undefined}
          cards={cards}
          onDone={refresh}
          onOpenChange={() => setDialog(undefined)}
        />
      </div>
    </TooltipProvider>
  )
}
