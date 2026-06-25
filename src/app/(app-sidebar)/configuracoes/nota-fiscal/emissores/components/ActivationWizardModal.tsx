'use client'

import { useEffect, useState } from 'react'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  IconAlertTriangle,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconLoader2,
  IconPlugConnected,
} from '@tabler/icons-react'

import { createItemNew, updateItemNew } from '@/actions/_cruds'

import { useEmissorReadiness } from '../hooks/useEmissorReadiness'
import { ENV_LABEL, type FiscalEnv } from '../lib/fiscal-readiness'
import { ReadinessChecklist } from './ReadinessChecklist'
import type { EmissorData } from './EmissorListItem'

interface ActivationWizardModalProps {
  emissor: EmissorData | null
  environment: FiscalEnv
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Habilita o passo de numeração ambiental (requer backend PATCH /numbering). */
  numberingEnabled?: boolean
}

const STEPS = [
  'Requisitos externos',
  'Diagnóstico',
  'CSC',
  'Série e numeração',
  'Autenticação',
  'Revisão',
  'Resultado',
] as const

export function ActivationWizardModal({
  emissor,
  environment,
  open,
  onOpenChange,
  numberingEnabled = true,
}: ActivationWizardModalProps) {
  const queryClient = useQueryClient()
  const emissorId = emissor?.id ?? ''
  const isProducao = environment === 'PRODUCAO'

  const [step, setStep] = useState(0)
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [cscId, setCscId] = useState('')
  const [cscToken, setCscToken] = useState('')
  const [nfceSeries, setNfceSeries] = useState('1')
  const [nfceNextNumber, setNfceNextNumber] = useState('1')
  const [confirmFiscalValidity, setConfirmFiscalValidity] = useState(false)
  const [activationError, setActivationError] = useState<string | null>(null)
  const [activated, setActivated] = useState(false)

  const readiness = useEmissorReadiness(emissorId, environment, open)

  // Reset ao abrir; gera um novo idempotencyKey por tentativa de ativação.
  useEffect(() => {
    if (open) {
      setStep(0)
      setIdempotencyKey(
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      )
      setCscId(emissor?.cscId ?? '')
      setCscToken('')
      setNfceSeries(String(emissor?.serieNfce ?? 1))
      setNfceNextNumber(String(emissor?.proximoNumeroNfce ?? 1))
      setConfirmFiscalValidity(false)
      setActivationError(null)
      setActivated(false)
    }
  }, [open, emissor])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['emissores'] })
    queryClient.invalidateQueries({
      queryKey: ['emissor-readiness', emissorId],
    })
  }

  const setCscMutation = useMutation({
    mutationFn: () =>
      createItemNew({
        route: `/fiscal/emissores/${emissorId}/environments/${environment}/csc`,
        data: { cscId, cscToken },
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Falha ao salvar CSC')
        return
      }
      toast.success('CSC salvo')
      setCscToken('')
      invalidate()
      readiness.refetch()
    },
    onError: () => toast.error('Falha ao salvar CSC'),
  })

  const setNumberingMutation = useMutation({
    mutationFn: () =>
      updateItemNew({
        route: `/fiscal/emissores/${emissorId}/environments/${environment}/numbering`,
        data: {
          nfceSeries: Number(nfceSeries),
          nfceNextNumber: Number(nfceNextNumber),
        },
      }),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message || 'Falha ao salvar numeração')
        return
      }
      toast.success('Numeração salva')
      invalidate()
      readiness.refetch()
    },
    onError: () => toast.error('Falha ao salvar numeração'),
  })

  const testConnectionMutation = useMutation({
    mutationFn: () =>
      createItemNew({
        route: `/fiscal/emissores/${emissorId}/environments/${environment}/test-connection`,
        data: {},
      }),
    onSuccess: (result) => {
      if (result.success && result.data?.success) {
        toast.success('Autenticação validada')
      } else {
        toast.error(result.message || 'Falha na autenticação')
      }
    },
    onError: () => toast.error('Falha na autenticação'),
  })

  const activateMutation = useMutation({
    mutationFn: () =>
      createItemNew({
        route: `/fiscal/emissores/${emissorId}/environments/${environment}/activate`,
        data: {
          idempotencyKey,
          ...(isProducao ? { confirmFiscalValidity } : {}),
        },
      }),
    onSuccess: (result) => {
      if (!result.success) {
        setActivationError(
          result.message || 'Falha ao ativar ambiente. Tente novamente.',
        )
        setStep(6)
        return
      }
      setActivated(true)
      setActivationError(null)
      setStep(6)
      invalidate()
    },
    onError: () => {
      setActivationError('Falha ao ativar ambiente. Tente novamente.')
      setStep(6)
    },
  })

  const ready = readiness.data?.ready === true
  const canActivate = ready && (!isProducao || confirmFiscalValidity)

  if (!emissor) return null

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isProducao ? 'Ativar produção' : 'Ativar homologação'} ·{' '}
            {emissor.company?.name || emissor.name}
          </DialogTitle>
          <DialogDescription>
            Passo {step + 1} de {STEPS.length}: {STEPS[step]}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4 min-h-[220px]">
          {/* 1. Requisitos externos */}
          {step === 0 && (
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                A ativação de {ENV_LABEL[environment].toLowerCase()} depende de
                itens sob responsabilidade da empresa/contabilidade:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Credenciamento do CNPJ para NFC-e (modelo 65) na SEFAZ.</li>
                <li>Geração do CSC e do ID do CSC no portal fiscal.</li>
                <li>Confirmação da série e do próximo número fiscal.</li>
              </ul>
              {isProducao && (
                <div className="flex items-start gap-2 rounded-lg border border-warning-100 bg-warning-50 p-3 text-warning-700">
                  <IconAlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Documentos emitidos em produção têm validade fiscal real.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 2. Diagnóstico */}
          {step === 1 && (
            <div className="space-y-3">
              <ReadinessChecklist
                data={readiness.data}
                isLoading={readiness.isLoading}
                error={
                  readiness.error ? (readiness.error as Error).message : null
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => readiness.refetch()}
                disabled={readiness.isFetching}
              >
                {readiness.isFetching && (
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Reavaliar
              </Button>
            </div>
          )}

          {/* 3. CSC */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>ID do CSC</Label>
                <Input
                  value={cscId}
                  onChange={(e) => setCscId(e.target.value)}
                  placeholder="Ex: 000001"
                />
              </div>
              <div className="space-y-1">
                <Label>Token CSC</Label>
                <Input
                  type="password"
                  value={cscToken}
                  autoComplete="new-password"
                  onChange={(e) => setCscToken(e.target.value)}
                  placeholder={
                    emissor.cscConfigured
                      ? 'Token já cadastrado — informe para substituir'
                      : 'Informe o token CSC'
                  }
                />
              </div>
              <Button
                size="sm"
                onClick={() => setCscMutation.mutate()}
                isLoading={setCscMutation.isPending}
                disabled={!cscId || !cscToken || setCscMutation.isPending}
              >
                Salvar CSC
              </Button>
            </div>
          )}

          {/* 4. Série e numeração */}
          {step === 3 && (
            <div className="space-y-4">
              {numberingEnabled ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Série</Label>
                      <Input
                        type="number"
                        min={1}
                        value={nfceSeries}
                        onChange={(e) => setNfceSeries(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Próximo número</Label>
                      <Input
                        type="number"
                        min={1}
                        value={nfceNextNumber}
                        onChange={(e) => setNfceNextNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setNumberingMutation.mutate()}
                    isLoading={setNumberingMutation.isPending}
                    disabled={
                      Number(nfceSeries) < 1 ||
                      Number(nfceNextNumber) < 1 ||
                      setNumberingMutation.isPending
                    }
                  >
                    Salvar numeração
                  </Button>
                </>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-warning-100 bg-warning-50 p-3 text-warning-700 text-sm">
                  <IconAlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    Ajuste de numeração ambiental pendente de implementação no
                    backend. Verifique o diagnóstico de prontidão.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5. Autenticação */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Teste a autenticação no ambiente de{' '}
                {ENV_LABEL[environment].toLowerCase()} antes de ativar. A
                prontidão completa é avaliada no diagnóstico.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => testConnectionMutation.mutate()}
                isLoading={testConnectionMutation.isPending}
              >
                <IconPlugConnected className="h-4 w-4 mr-2" />
                Testar autenticação
              </Button>
            </div>
          )}

          {/* 6. Revisão e confirmação */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-gray-200 p-3 text-sm space-y-1">
                <p>
                  <span className="text-gray-500">Ambiente:</span>{' '}
                  {ENV_LABEL[environment]}
                </p>
                <p>
                  <span className="text-gray-500">CSC:</span>{' '}
                  {emissor.cscConfigured || cscToken
                    ? 'Configurado'
                    : 'Não configurado'}
                </p>
                <p className="flex items-center gap-1">
                  <span className="text-gray-500">Prontidão:</span>{' '}
                  {ready ? (
                    <>
                      <IconCircleCheckFilled className="h-4 w-4 text-success" />
                      Pronto
                    </>
                  ) : (
                    <>
                      <IconCircleXFilled className="h-4 w-4 text-error" />
                      Pendências bloqueantes
                    </>
                  )}
                </p>
              </div>

              {isProducao && (
                <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                  <Checkbox
                    checked={confirmFiscalValidity}
                    onCheckedChange={(v) =>
                      setConfirmFiscalValidity(v === true)
                    }
                  />
                  <span>
                    Confirmo que os próximos documentos emitidos terão validade
                    fiscal.
                  </span>
                </label>
              )}

              {!ready && (
                <p className="text-xs text-error-700">
                  Resolva as pendências do diagnóstico antes de ativar.
                </p>
              )}
            </div>
          )}

          {/* 7. Resultado */}
          {step === 6 && (
            <div className="space-y-3">
              {activated ? (
                <div className="flex items-start gap-2 rounded-lg border border-success-100 bg-success-50 p-3 text-success-700">
                  <IconCircleCheckFilled className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">Ambiente ativado</p>
                    <p className="text-sm">
                      {ENV_LABEL[environment]} está ativo para este emissor.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-lg border border-error-100 bg-error-50 p-3 text-error-700">
                  <IconCircleXFilled className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-medium">Falha na ativação</p>
                    <p className="text-sm">{activationError}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogBody>

        <DialogFooter className="flex items-center justify-between">
          {step === 6 ? (
            <div className="flex w-full justify-end gap-2">
              {!activated && (
                <Button variant="outline" onClick={() => setStep(5)}>
                  Tentar novamente
                </Button>
              )}
              <Button onClick={() => onOpenChange(false)}>Fechar</Button>
            </div>
          ) : (
            <div className="flex w-full justify-between">
              <Button variant="ghost" onClick={goBack} disabled={step === 0}>
                Voltar
              </Button>
              {step < 5 ? (
                <Button onClick={goNext}>Avançar</Button>
              ) : (
                <Button
                  onClick={() => activateMutation.mutate()}
                  isLoading={activateMutation.isPending}
                  disabled={!canActivate || activateMutation.isPending}
                >
                  {isProducao ? 'Ativar produção' : 'Ativar homologação'}
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
