'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconDatabaseImport,
  IconLoader2,
  IconPlayerPlay,
  IconSearch,
  IconX,
} from '@tabler/icons-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Topbar } from '@/components/common/Topbar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { getData, createItemNew } from '@/actions/_cruds'
import { isValidCnpj, maskCnpj } from '@/lib/utils'

interface LegacyBase {
  base: string
  razaoSocial: string | null
  cnpj: string | null
  empresaVinculada: { id: string; name: string } | null
  /** Motivo para não migrar: CNPJ em mais de uma conta, ou base já carregada em outra. */
  bloqueio: string | null
}

interface BaseSearch {
  /** Bases de cliente que o usuário do legado consegue ler. */
  basesConsultadas: number
  encontradas: LegacyBase[]
}

interface StepSummary {
  label: string
  extracted: number
  imported: number
  failed: number
  warnings?: number
  skipped?: number
  expected?: number
  documents?: number
}

interface RunError {
  etapa: string
  row: number
  codigoLegado: string
  error: string
}

interface MigrationRun {
  id: string
  legacyBase: string
  dryRun: boolean
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  startedAt: string | null
  finishedAt: string | null
  summary: StepSummary[] | null
  errors: RunError[] | null
  failureReason: string | null
  company: { id: string; name: string; cnpj: string | null }
}

/** As actions genéricas devolvem o payload embrulhado em um envelope. */
interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data?: T
}

const EM_ANDAMENTO = ['QUEUED', 'RUNNING']

export default function AdminMigracaoPage() {
  const [baseSelecionada, setBaseSelecionada] = useState<LegacyBase | null>(
    null,
  )
  const [runId, setRunId] = useState<string | null>(null)
  const [disparando, setDisparando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  const [cnpj, setCnpj] = useState('')
  const [cnpjBuscado, setCnpjBuscado] = useState<string | null>(null)

  const {
    data: busca,
    error: erroBusca,
    isFetching: buscando,
    refetch: refazerBusca,
  } = useQuery({
    queryKey: ['migration-bases', cnpjBuscado],
    queryFn: async () => {
      const res = (await getData({
        route: 'admin/migration/bases',
        filters: { cnpj: cnpjBuscado ?? undefined },
      })) as unknown as ApiEnvelope<BaseSearch>
      // Sem isto, qualquer falha (acesso ao legado não configurado, conexão
      // recusada) aparecia na tela como "nenhuma base".
      if (!res?.success) {
        throw new Error(res?.message ?? 'Não foi possível consultar o legado')
      }
      return res.data as BaseSearch
    },
    enabled: !!cnpjBuscado,
    retry: false,
  })

  // Com um único resultado pronto para migrar, não há o que escolher.
  useEffect(() => {
    const [unica, ...outras] = busca?.encontradas ?? []
    if (unica && !outras.length && unica.empresaVinculada && !unica.bloqueio) {
      setBaseSelecionada(unica)
    }
  }, [busca])

  function buscar(event: FormEvent) {
    event.preventDefault()
    if (!isValidCnpj(cnpj)) {
      toast.error('CNPJ inválido')
      return
    }
    setBaseSelecionada(null)
    setRunId(null)
    // Repetir o mesmo CNPJ consulta de novo: a conta pode ter sido criada
    // depois da primeira busca.
    if (cnpj === cnpjBuscado) refazerBusca()
    else setCnpjBuscado(cnpj)
  }

  const { data: run } = useQuery({
    queryKey: ['migration-run', runId],
    queryFn: async () => {
      const res = (await getData({
        route: `admin/migration/runs/${runId}`,
      })) as unknown as ApiEnvelope<MigrationRun>
      return res?.data as MigrationRun
    },
    enabled: !!runId,
    // A carga leva minutos e roda fora da API; acompanhamos por consulta.
    refetchInterval: (query) =>
      EM_ANDAMENTO.includes((query.state.data as MigrationRun)?.status)
        ? 3000
        : false,
  })

  const rodando = !!run && EM_ANDAMENTO.includes(run.status)

  // A simulação precisa ter passado para a mesma base antes de gravar: foi ela
  // que revelou a maior parte dos problemas na primeira migração.
  const simulacaoAprovada =
    !!run &&
    run.dryRun &&
    run.status === 'COMPLETED' &&
    run.legacyBase === baseSelecionada?.base &&
    (run.summary ?? []).every((etapa) => etapa.failed === 0)

  useEffect(() => {
    if (!run || rodando) return
    if (run.status === 'FAILED') {
      toast.error(run.failureReason ?? 'A migração falhou')
    }
  }, [run?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  async function disparar(dryRun: boolean) {
    if (!baseSelecionada?.empresaVinculada) return

    setDisparando(true)
    setConfirmando(false)

    const res = await createItemNew({
      route: 'admin/migration/runs',
      data: {
        companyId: baseSelecionada.empresaVinculada.id,
        legacyBase: baseSelecionada.base,
        dryRun,
      },
    })

    setDisparando(false)

    if (!res.success) {
      toast.error(res.message ?? 'Não foi possível iniciar')
      return
    }

    setRunId(res.data.id)
    toast.success(dryRun ? 'Simulação iniciada' : 'Migração iniciada')
  }

  return (
    <>
      <Topbar
        title="Migração do sistema legado"
        label="Super Admin"
        classNames={{ title: 'text-white', label: 'bg-[#FF4201]' }}
      />

      <div className="flex flex-col gap-4 p-4">
        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <div>
              <h2 className="text-lg font-semibold">1. Encontre o cliente</h2>
              <p className="text-sm text-muted-foreground">
                Informe o CNPJ que o cliente passou ao pedir a migração. A busca
                procura a base dele no sistema legado e a conta do Atrupe com o
                mesmo CNPJ — crie essa conta pelo cadastro normal antes de
                migrar. Login e senha são os do cadastro: a migração não cria
                acessos, traz os colaboradores para o admin do cliente criar
                depois.
              </p>
            </div>

            <form
              onSubmit={buscar}
              className="flex flex-wrap items-center gap-2"
            >
              <Input
                value={maskCnpj(cnpj)}
                onChange={(e) =>
                  setCnpj(e.target.value.replace(/\D/g, '').slice(0, 14))
                }
                placeholder="00.000.000/0000-00"
                inputMode="numeric"
                aria-label="CNPJ do cliente"
                className="w-64"
                disabled={rodando}
              />
              <Button
                type="submit"
                disabled={buscando || rodando || cnpj.length !== 14}
              >
                {buscando ? (
                  <IconLoader2 className="animate-spin" size={16} />
                ) : (
                  <IconSearch size={16} />
                )}
                Buscar no legado
              </Button>
            </form>

            {erroBusca && (
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {(erroBusca as Error).message}
              </p>
            )}

            {buscando && !busca && <Skeleton className="h-20 w-full" />}

            {busca && !erroBusca && (
              <div className="flex flex-col gap-2">
                {busca.encontradas.length > 1 && (
                  <p className="flex items-start gap-2 rounded-md bg-muted p-3 text-sm">
                    <IconAlertTriangle size={16} className="mt-0.5 shrink-0" />
                    Este CNPJ aparece em {busca.encontradas.length} bases do
                    legado. Confirme com o cliente qual está em uso: cada conta
                    recebe uma base só.
                  </p>
                )}

                {busca.encontradas.map((base) => {
                  const selecionada = baseSelecionada?.base === base.base
                  const pronta = !!base.empresaVinculada && !base.bloqueio

                  return (
                    <button
                      key={base.base}
                      type="button"
                      disabled={!pronta || rodando}
                      onClick={() => {
                        setBaseSelecionada(base)
                        setRunId(null)
                      }}
                      className={`flex items-center justify-between rounded-md border p-3 text-left transition
                        ${selecionada ? 'border-primary bg-primary/5' : 'border-border'}
                        ${pronta ? 'hover:bg-muted/50' : 'cursor-not-allowed opacity-60'}`}
                    >
                      <div>
                        <p className="font-medium">
                          {base.razaoSocial ?? base.base}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {base.base}
                          {base.cnpj ? ` · ${base.cnpj}` : ''}
                        </p>
                      </div>

                      {base.bloqueio ? (
                        <div className="flex max-w-md flex-col items-end gap-1 text-right">
                          <Badge
                            variant="errorOutline"
                            className="gap-1 px-2 py-0.5"
                          >
                            <IconAlertTriangle size={14} />
                            Migração bloqueada
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {base.bloqueio}
                          </span>
                        </div>
                      ) : pronta ? (
                        <div className="flex items-center gap-2 text-sm">
                          <IconArrowRight size={16} />
                          <span>{base.empresaVinculada!.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="gap-1">
                            <IconAlertTriangle size={14} />
                            Conta ainda não criada
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Crie a conta com este CNPJ e busque de novo
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}

                {busca.encontradas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma base do legado tem este CNPJ (
                    {consultadas(busca.basesConsultadas)}). Confira o número com
                    o cliente. Se estiver certo, a base dele pode não estar
                    liberada para leitura — acione o time de desenvolvimento.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {consultadas(busca.basesConsultadas)} no legado.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {baseSelecionada?.empresaVinculada && !baseSelecionada.bloqueio && (
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <div>
                <h2 className="text-lg font-semibold">2. Simule antes</h2>
                <p className="text-sm text-muted-foreground">
                  A simulação não grava nada. Ela confere linha a linha e mostra
                  o que seria recusado — é o passo que revela problema de dado
                  antes que ele entre na base do cliente.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  onClick={() => disparar(true)}
                  disabled={disparando || rodando}
                  variant="outline"
                >
                  {rodando && run?.dryRun ? (
                    <IconLoader2 className="animate-spin" size={16} />
                  ) : (
                    <IconPlayerPlay size={16} />
                  )}
                  Rodar simulação
                </Button>

                <Button
                  onClick={() => setConfirmando(true)}
                  disabled={!simulacaoAprovada || disparando || rodando}
                >
                  {rodando && !run?.dryRun ? (
                    <IconLoader2 className="animate-spin" size={16} />
                  ) : (
                    <IconDatabaseImport size={16} />
                  )}
                  Executar migração
                </Button>

                {!simulacaoAprovada && (
                  <span className="text-xs text-muted-foreground">
                    Gravar fica liberado depois de uma simulação sem erros nesta
                    base.
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {run && (
          <Card>
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {run.dryRun
                      ? 'Resultado da simulação'
                      : 'Resultado da carga'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {run.company.name} · {run.legacyBase}
                  </p>
                </div>

                <StatusBadge status={run.status} />
              </div>

              {run.failureReason && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {run.failureReason}
                </p>
              )}

              {run.summary && run.summary.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Etapa</TableHead>
                      <TableHead className="text-right">Origem</TableHead>
                      <TableHead className="text-right">Extraídos</TableHead>
                      <TableHead className="text-right">
                        {run.dryRun ? 'Válidos' : 'Gravados'}
                      </TableHead>
                      <TableHead className="text-right">Com erro</TableHead>
                      <TableHead className="text-right">Avisos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {run.summary.map((etapa) => (
                      <TableRow key={etapa.label}>
                        <TableCell className="font-medium">
                          {etapa.label}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {etapa.expected ?? etapa.documents ?? etapa.extracted}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {etapa.documents ?? etapa.extracted}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {etapa.imported}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {etapa.failed > 0 ? (
                            <span className="text-destructive">
                              {etapa.failed}
                            </span>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {etapa.warnings || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {run.errors && run.errors.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-medium">
                      Linhas recusadas ({run.errors.length})
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Copie esta lista e envie ao time de desenvolvimento: o
                      padrão do erro costuma indicar um formato de dado que a
                      migração ainda não trata.
                    </p>
                    <div className="max-h-72 overflow-auto rounded-md border">
                      {run.errors.map((erro, i) => (
                        <p
                          key={i}
                          className="border-b px-3 py-2 text-xs last:border-b-0"
                        >
                          <span className="text-muted-foreground">
                            {erro.etapa} · linha {erro.row}
                            {erro.codigoLegado
                              ? ` · código ${erro.codigoLegado}`
                              : ''}
                            :{' '}
                          </span>
                          {erro.error}
                        </p>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {rodando && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconLoader2 className="animate-spin" size={16} />
                  Em execução. A carga roda no servidor e continua mesmo se você
                  fechar esta tela.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={confirmando} onOpenChange={setConfirmando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gravar os dados do cliente?</DialogTitle>
          </DialogHeader>
          <DialogBody className="flex flex-col gap-3 text-sm">
            <p>
              Os dados de <strong>{baseSelecionada?.razaoSocial}</strong> serão
              gravados na empresa{' '}
              <strong>{baseSelecionada?.empresaVinculada?.name}</strong>.
            </p>
            <p className="text-muted-foreground">
              A carga pode ser repetida sem duplicar: cada registro leva o
              código de origem. Ainda assim, confira o relatório da simulação
              antes de seguir.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmando(false)}>
              Cancelar
            </Button>
            <Button onClick={() => disparar(false)}>Gravar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function consultadas(total: number) {
  return total === 1 ? '1 base consultada' : `${total} bases consultadas`
}

function StatusBadge({ status }: { status: MigrationRun['status'] }) {
  if (status === 'COMPLETED') {
    return (
      <Badge className="gap-1 bg-emerald-600">
        <IconCheck size={14} /> Concluída
      </Badge>
    )
  }

  if (status === 'FAILED') {
    return (
      <Badge variant="error" className="gap-1">
        <IconX size={14} /> Falhou
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1">
      <IconLoader2 className="animate-spin" size={14} /> Em execução
    </Badge>
  )
}
