'use client'

// A limpeza do espaço dos arquivos de produção (GP-49, 22/11/2026), para
// quem não quer comprar espaço: apaga os arquivos mais antigos das O.S.
// entregues (finalizadas) até liberar a porcentagem do espaço usado. Nada
// dos cadastros. Só o administrador, com a prévia antes e a confirmação
// digitada. A automática vem desligada, e ligá-la pede a mesma confirmação.

// React
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Card,
  CardTitle,
  CardHeader,
  CardFooter,
  CardContent,
} from '@/components/ui/card'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Components
import { InfoHint } from '@/components/common/InfoHint'

// Actions
import {
  runCleanup,
  saveCleanupAuto,
  getCleanupPreview,
  type CleanupAuto,
} from '@/actions/production-manager'

// Utils
import { formatBytes } from '@/lib/production-upload'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconDatabase } from '@tabler/icons-react'

const day = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : ''

const clampPercent = (value: number) =>
  Math.min(Math.max(Math.round(value) || 1, 1), 100)

const CONFIRM_WORD = 'APAGAR'

/** A confirmação digitada de quem apaga: na limpeza e ao ligar a automática. */
function ConfirmEraseDialog({
  open,
  onOpenChange,
  title,
  description,
  action,
  busy,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  action: string
  busy: boolean
  onConfirm: (typed: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ConfirmEraseForm
          action={action}
          busy={busy}
          onCancel={() => onOpenChange(false)}
          onConfirm={onConfirm}
        />
      </DialogContent>
    </Dialog>
  )
}

// Dentro do diálogo: sai da tela ao fechar, e o que foi digitado vai junto
function ConfirmEraseForm({
  action,
  busy,
  onCancel,
  onConfirm,
}: {
  action: string
  busy: boolean
  onCancel: () => void
  onConfirm: (typed: string) => void
}) {
  const [typed, setTyped] = useState('')

  return (
    <>
      <DialogBody>
        <Label htmlFor="cleanup-confirm">Digite APAGAR para confirmar</Label>
        <Input
          id="cleanup-confirm"
          value={typed}
          autoComplete="off"
          onChange={(event) => setTyped(event.target.value)}
        />
      </DialogBody>
      <DialogFooter>
        <Button type="button" variant="neutralOutline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="errorOutline"
          disabled={typed.trim().toUpperCase() !== CONFIRM_WORD || busy}
          onClick={() => onConfirm(typed)}
        >
          {action}
        </Button>
      </DialogFooter>
    </>
  )
}

export function StorageCleanupCard() {
  const queryClient = useQueryClient()
  const [percent, setPercent] = useState(50)
  const [confirming, setConfirming] = useState(false)
  const [running, setRunning] = useState(false)
  const [auto, setAuto] = useState<CleanupAuto | null>(null)
  // O que está gravado: ligar o que estava desligado pede o APAGAR
  const [savedEnabled, setSavedEnabled] = useState(false)
  const [enabling, setEnabling] = useState(false)
  const [savingAuto, setSavingAuto] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['production-cleanup', percent],
    queryFn: () => getCleanupPreview(percent),
  })
  const preview = data?.data

  useEffect(() => {
    if (preview && !auto) {
      setAuto(preview.auto)
      setSavedEnabled(preview.auto.enabled)
    }
  }, [preview, auto])

  const usedRatio =
    preview?.quotaBytes && preview.quotaBytes > 0
      ? Math.min(preview.usedBytes / preview.quotaBytes, 1)
      : 0

  const run = async (typed: string) => {
    setRunning(true)
    const res = await runCleanup(percent, typed)
    setRunning(false)
    if (!res.success || !res.data) return toast.error(res.message)
    toast.success(
      `${res.data.files} arquivo(s) apagado(s), ${formatBytes(res.data.bytes)} liberados`,
    )
    setConfirming(false)
    queryClient.invalidateQueries({ queryKey: ['production-cleanup'] })
    // A tela do armazenamento relê o espaço e as O.S. que mais ocupam
    queryClient.invalidateQueries({ queryKey: ['company-storage'] })
  }

  const saveAuto = async (next: CleanupAuto, confirm?: string) => {
    setSavingAuto(true)
    const res = await saveCleanupAuto(next, confirm)
    setSavingAuto(false)
    if (!res.success) {
      toast.error(res.message)
      return false
    }
    setAuto(next)
    setSavedEnabled(next.enabled)
    toast.success(
      next.enabled ? 'Limpeza automática ligada' : 'Limpeza automática salva',
    )
    return true
  }

  const enable = async (typed: string) => {
    if (!auto) return
    if (await saveAuto({ ...auto, enabled: true }, typed)) setEnabling(false)
  }

  if (!isLoading && !data?.success) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray">
          {data?.message ||
            'Só o administrador da empresa pode limpar o espaço dos arquivos.'}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FeaturedIcon tone="neutral" Icon={IconDatabase} />
            <div className="flex items-center gap-1.5">
              <CardTitle>Espaço dos arquivos</CardTitle>
              <InfoHint title="Limpeza do espaço">
                <p>
                  Para não precisar contratar mais espaço: apaga os arquivos
                  mais antigos até liberar a porcentagem escolhida do espaço
                  usado.
                </p>
                <p>
                  Entram só os arquivos acrescentados às O.S. entregues, com o
                  status Finalizada (artes, versões editadas, provas, PDFs e
                  projetos). Nada dos cadastros e nada de O.S. ainda não
                  entregue.
                </p>
              </InfoHint>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="font-medium text-gray-900">
                {preview ? formatBytes(preview.usedBytes) : '…'} usados
                {preview?.quotaBytes
                  ? ` de ${formatBytes(preview.quotaBytes)}`
                  : ''}
              </span>
              {preview && (
                <span className="text-gray">
                  {formatBytes(preview.eligibleBytes)} em O.S. entregues
                </span>
              )}
            </div>
            {!!preview?.quotaBytes && (
              <Progress
                value={usedRatio * 100}
                indicatorClassName={
                  usedRatio >= 0.9
                    ? 'bg-error-600'
                    : usedRatio >= 0.8
                      ? 'bg-warning-500'
                      : undefined
                }
              />
            )}
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label htmlFor="cleanup-percent">
                Liberar (% do espaço usado)
              </Label>
              <Input
                id="cleanup-percent"
                type="number"
                min={1}
                max={100}
                className="w-[140px]"
                value={percent}
                onChange={(event) =>
                  setPercent(clampPercent(Number(event.target.value)))
                }
              />
            </div>
            <Button
              type="button"
              variant="errorOutline"
              disabled={!preview?.files}
              onClick={() => setConfirming(true)}
            >
              Apagar arquivos antigos
            </Button>
          </div>

          {preview && (
            <div className="rounded-lg border border-gray-200 bg-gray-25 p-4 text-sm text-gray-800">
              {preview.files ? (
                <p>
                  Sairiam <strong>{preview.files} arquivo(s)</strong> de{' '}
                  {preview.projects} O.S., enviados de {day(preview.from)} a{' '}
                  {day(preview.to)}, liberando{' '}
                  <strong>{formatBytes(preview.bytes)}</strong>
                  {preview.bytes < preview.targetBytes &&
                    ` (o alvo era ${formatBytes(preview.targetBytes)}; não há mais arquivos de O.S. entregues)`}
                  .
                </p>
              ) : (
                <p>Não há arquivos de O.S. entregues para apagar.</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-gray">
          Apagar não tem volta. Na tarefa, o arquivo fica como &quot;removido na
          limpeza&quot;, com a data.
        </CardFooter>
      </Card>

      {auto && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Limpeza automática
                </p>
                <p className="text-sm text-gray">
                  De madrugada, quando o espaço usado passar do limite, apaga os
                  mais antigos até liberar a porcentagem. Vem desligada.
                </p>
              </div>
              <Switch
                aria-label="Limpeza automática"
                checked={auto.enabled}
                disabled={savingAuto}
                onCheckedChange={(checked) =>
                  checked && !savedEnabled
                    ? setEnabling(true)
                    : saveAuto({ ...auto, enabled: checked })
                }
              />
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <Label htmlFor="cleanup-threshold">Quando passar de (%)</Label>
                <Input
                  id="cleanup-threshold"
                  type="number"
                  min={50}
                  max={100}
                  className="w-[140px]"
                  value={auto.threshold}
                  onChange={(event) =>
                    setAuto({
                      ...auto,
                      threshold: Math.min(
                        Math.max(Number(event.target.value) || 50, 50),
                        100,
                      ),
                    })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cleanup-auto-percent">Liberar (%)</Label>
                <Input
                  id="cleanup-auto-percent"
                  type="number"
                  min={1}
                  max={100}
                  className="w-[140px]"
                  value={auto.percent}
                  onChange={(event) =>
                    setAuto({
                      ...auto,
                      percent: clampPercent(Number(event.target.value)),
                    })
                  }
                />
              </div>
              <Button
                type="button"
                variant="neutralOutline"
                disabled={savingAuto}
                onClick={() => saveAuto(auto)}
              >
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!!preview?.history.length && (
        <Card>
          <CardContent className="p-6">
            <p className="mb-3 text-sm font-medium text-gray-900">
              Limpezas feitas
            </p>
            <ul className="space-y-1 text-sm text-gray-800">
              {preview.history.map((item) => (
                <li key={item.at}>
                  {new Date(item.at).toLocaleString('pt-BR')} · {item.by}
                  {item.automatic ? ' (automática)' : ''} · {item.files}{' '}
                  arquivo(s), {formatBytes(item.bytes)} ({item.percent}%)
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <ConfirmEraseDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Apagar ${preview?.files} arquivo(s)?`}
        description={`Libera ${formatBytes(preview?.bytes || 0)} com os arquivos de ${preview?.projects} O.S. entregues, enviados de ${day(preview?.from ?? null)} a ${day(preview?.to ?? null)}. Não tem volta.`}
        action="Apagar"
        busy={running}
        onConfirm={run}
      />

      {auto && (
        <ConfirmEraseDialog
          open={enabling}
          onOpenChange={setEnabling}
          title="Ligar a limpeza automática?"
          description={`De madrugada, quando o espaço usado passar de ${auto.threshold}%, os arquivos mais antigos das O.S. entregues serão apagados até liberar ${auto.percent}% do espaço usado, sem perguntar de novo. Não tem volta.`}
          action="Ligar"
          busy={savingAuto}
          onConfirm={enable}
        />
      )}
    </div>
  )
}
