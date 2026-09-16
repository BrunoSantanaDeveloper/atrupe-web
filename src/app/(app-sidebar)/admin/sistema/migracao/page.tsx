'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheck,
  IconDatabaseImport,
  IconLoader2,
  IconPlayerPlay,
  IconX,
} from '@tabler/icons-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

interface LegacyBase {
  base: string
  razaoSocial: string | null
  cnpj: string | null
  empresaVinculada: { id: string; name: string } | null
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

  const { data: bases, isLoading: carregandoBases } = useQuery({
    queryKey: ['migration-bases'],
    queryFn: async () => {
      const res = (await getData({
        route: 'admin/migration/bases',
      })) as unknown as ApiEnvelope<LegacyBase[]>
      return res?.data ?? []
    },
  })

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
              <h2 className="text-lg font-semibold">1. Escolha o cliente</h2>
              <p className="text-sm text-muted-foreground">
                A lista vem do próprio sistema legado. A migração preenche uma
                conta que já existe: crie a conta do cliente normalmente, com o
                mesmo CNPJ, e ela aparece vinculada aqui. Login e senha são os
                do cadastro — a migração não cria acessos, traz os colaboradores
                para o admin do cliente criar depois.
              </p>
            </div>

            {carregandoBases ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="flex flex-col gap-2">
                {(bases ?? []).map((base) => {
                  const selecionada = baseSelecionada?.base === base.base
                  const pronta = !!base.empresaVinculada

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

                      {pronta ? (
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
                            Crie a conta com este CNPJ e volte aqui
                          </span>
                        </div>
                      )}
                    </button>
                  )
                })}

                {(bases ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma base liberada no sistema legado.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {baseSelecionada?.empresaVinculada && (
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
