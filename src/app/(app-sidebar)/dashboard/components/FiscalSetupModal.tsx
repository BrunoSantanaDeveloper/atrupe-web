'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { useFiscalOnboardingStatus } from '@/hooks/useFiscalOnboardingStatus'
import { createItemNew } from '@/actions/_cruds'
import { toast } from 'sonner'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconFileInvoice,
  IconChevronRight,
  IconRocket,
  IconLoader2,
  IconCheck,
  IconAlertTriangle,
  IconCloudUpload,
  IconFileCertificate,
  IconArrowLeft,
} from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { maskCnpj, maskCep } from '@/lib/utils'

const DISMISSAL_KEY = 'fiscal-setup-modal-dismissed'

const UF_OPTIONS = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

interface FiscalFormData {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  ie: string
  im: string
  cnae: string
  uf: string
  codigoIbge: string
  cep: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  complemento: string
  certificateType: string
  certificatePassword: string
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'pending_review' | 'error'

export function FiscalSetupModal() {
  const queryClient = useQueryClient()
  const { hasFeature } = usePlanFeatures()
  const { data: onboardingData, isLoading: isLoadingOnboarding } =
    useFiscalOnboardingStatus()

  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formStatus, setFormStatus] = useState<FormStatus>('idle')
  const [resultMessage, setResultMessage] = useState('')
  const [certificateFile, setCertificateFile] = useState<File | null>(null)

  const isOnboardingNotStarted =
    !onboardingData || onboardingData?.status === 'NOT_STARTED'
  const isOnboardingPending = [
    'PENDING',
    'PROVISIONING',
    'PENDING_REVIEW',
  ].includes(onboardingData?.status || '')

  const form = useForm<FiscalFormData>({
    defaultValues: {
      cnpj: '',
      razaoSocial: '',
      nomeFantasia: '',
      ie: '',
      im: '',
      cnae: '',
      uf: '',
      codigoIbge: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      complemento: '',
      certificateType: 'A1',
      certificatePassword: '',
    },
  })

  const cnpjRegistration = form.register('cnpj', { required: true })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setCertificateFile(acceptedFiles[0])
      toast.success('Certificado carregado!')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/x-pkcs12': ['.pfx', '.p12'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(DISMISSAL_KEY) === 'true'
      const shouldForceOpen =
        localStorage.getItem('force_open_fiscal_form') === 'true'

      if (shouldForceOpen) {
        setDismissed(false)
      } else {
        setDismissed(isDismissed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (isLoadingOnboarding) return
    if (!hasFeature('nota_fiscal')) return
    if (isOnboardingPending) return
    if (!isOnboardingNotStarted) return
    if (dismissed) return
    const t = setTimeout(() => {
      try {
        if (localStorage.getItem('force_open_fiscal_form') === 'true') {
          localStorage.removeItem('force_open_fiscal_form')
          setOpen(true)
          setShowForm(true)
        } else {
          setOpen(true)
        }
      } catch {
        setOpen(true)
      }
    }, 500)
    return () => clearTimeout(t)
  }, [
    isLoadingOnboarding,
    hasFeature,
    isOnboardingNotStarted,
    isOnboardingPending,
    dismissed,
  ])

  const fetchCep = async (cep: string) => {
    const c = cep.replace(/\D/g, '')
    if (c.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${c}/json/`)
      const data = await res.json()
      if (!data.erro) {
        form.setValue('logradouro', data.logradouro || '')
        form.setValue('bairro', data.bairro || '')
        form.setValue('cidade', data.localidade || '')
        form.setValue('uf', data.uf || '')
        form.setValue('codigoIbge', data.ibge || '')
      }
    } catch {}
  }

  const fetchCnpj = async (cnpj: string) => {
    const c = cnpj.replace(/\D/g, '')
    if (c.length !== 14) return
    try {
      toast.loading('Buscando dados do CNPJ...', { id: 'cnpj-fetch' })
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${c}`)
      const data = await res.json()
      if (res.ok) {
        form.setValue('razaoSocial', data.razao_social || '')
        form.setValue('nomeFantasia', data.nome_fantasia || '')
        form.setValue('cnae', data.cnae_fiscal?.toString() || '')
        if (data.cep) {
          form.setValue('cep', data.cep.replace(/\D/g, ''))
          await fetchCep(data.cep)
        }
        if (data.numero) form.setValue('numero', data.numero)
        if (data.complemento) form.setValue('complemento', data.complemento)
        toast.success('Dados da empresa preenchidos!', { id: 'cnpj-fetch' })
      } else {
        toast.dismiss('cnpj-fetch')
      }
    } catch {
      toast.dismiss('cnpj-fetch')
    }
  }

  const handleDismiss = () => {
    setOpen(false)
    setShowForm(false)
    try {
      localStorage.setItem(DISMISSAL_KEY, 'true')
    } catch {}
    setDismissed(true)
  }

  const handleReopenModal = () => {
    try {
      localStorage.removeItem(DISMISSAL_KEY)
    } catch {}
    setDismissed(false)
    setOpen(true)
  }

  const onSubmit = async (data: FiscalFormData) => {
    setFormStatus('submitting')
    try {
      let certificateBase64: string | undefined
      if (certificateFile) {
        // FileReader must run client-side (not in 'use server' context)
        certificateBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () =>
            resolve((reader.result as string).split(',')[1] || '')
          reader.onerror = reject
          reader.readAsDataURL(certificateFile)
        })
      }
      const result = await createItemNew({
        route: '/fiscal/onboarding',
        data: { ...data, certificate: certificateBase64 },
      })
      if (result.success) {
        const rd = result.data as { status: string; message: string }
        if (rd.status === 'ACTIVE') {
          setFormStatus('success')
          setResultMessage(rd.message)
          toast.success('Módulo fiscal ativado!')
          await queryClient.invalidateQueries()
          setTimeout(() => {
            setOpen(false)
            setShowForm(false)
          }, 3000)
        } else {
          setFormStatus('pending_review')
          setResultMessage(rd.message)
          toast.info('Dados enviados para análise')
        }
      } else {
        setFormStatus('error')
        setResultMessage(result.message || 'Erro ao processar dados fiscais')
        toast.error(result.message || 'Erro ao processar dados fiscais')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro inesperado'
      setFormStatus('error')
      setResultMessage(message)
      toast.error(message)
    }
  }

  if (!hasFeature('nota_fiscal')) return null
  if (isOnboardingPending) return null
  if (!isOnboardingNotStarted) return null
  if (isLoadingOnboarding) return null

  const showReminderBanner = dismissed && isOnboardingNotStarted

  return (
    <>
      {showReminderBanner && (
        <button
          type="button"
          onClick={handleReopenModal}
          className="w-full rounded-lg border border-brand-200 bg-brand-50 p-4 flex items-center gap-3 hover:bg-brand-100 transition-colors group text-left"
        >
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
            <IconFileInvoice className="h-5 w-5 text-brand-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-800">
              Configuração fiscal pendente
            </p>
            <p className="text-sm text-brand-600">
              Complete a configuração do módulo fiscal para começar a emitir
              notas.
            </p>
          </div>
          <IconChevronRight className="h-5 w-5 text-brand-400 group-hover:text-brand-600 transition-colors" />
        </button>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) handleDismiss()
        }}
      >
        <DialogContent
          className={showForm ? 'sm:max-w-[680px]' : 'sm:max-w-[520px]'}
        >
          {/* ── INTRO (NOT_STARTED) ── */}
          {!showForm && (
            <>
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle>Configure o Módulo Fiscal</DialogTitle>
                <DialogDescription>
                  Para começar a emitir notas fiscais, configure seu emissor
                  fiscal.
                </DialogDescription>
              </DialogHeader>
              <DialogBody className="px-6 py-4 space-y-4">
                <div className="rounded-lg border border-brand-200 bg-brand-50 p-4 flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <IconRocket className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-900">
                      Iniciar Configuração Fiscal
                    </p>
                    <p className="text-xs text-brand-700 mt-0.5">
                      Preencha os dados do seu emissor (CNPJ, razão social,
                      endereço) para habilitar a emissão de notas fiscais.
                    </p>
                  </div>
                </div>
              </DialogBody>
              <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <Button variant="ghost" onClick={handleDismiss}>
                  Configurar depois
                </Button>
                <Button onClick={() => setShowForm(true)}>
                  <IconRocket className="h-4 w-4" /> Configurar Módulo Fiscal
                </Button>
              </DialogFooter>
            </>
          )}

          {/* ── FORM ── */}
          {showForm && (
            <>
              <DialogHeader className="px-6 pt-6 pb-2">
                <DialogTitle className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setFormStatus('idle')
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IconArrowLeft className="h-5 w-5" />
                  </button>
                  Configuração Fiscal
                </DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para ativar o módulo de emissão de
                  notas fiscais.
                </DialogDescription>
              </DialogHeader>

              <DialogBody className="px-6 py-4 max-h-[65vh] overflow-y-auto">
                {/* Success */}
                {formStatus === 'success' && (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                      <IconCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">
                      Módulo fiscal ativado!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {resultMessage}
                    </p>
                  </div>
                )}

                {/* Pending review */}
                {formStatus === 'pending_review' && (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                      <IconAlertTriangle className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Dados recebidos!</h3>
                    <p className="text-sm text-muted-foreground">
                      {resultMessage}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Você receberá um e-mail quando o módulo estiver pronto.
                    </p>
                    <Button onClick={handleDismiss}>Fechar</Button>
                  </div>
                )}

                {/* Submitting */}
                {formStatus === 'submitting' && (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
                    <IconLoader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Configurando módulo fiscal...
                    </p>
                  </div>
                )}

                {/* Form fields */}
                {(formStatus === 'idle' || formStatus === 'error') && (
                  <form
                    id="fiscal-onboarding-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                    noValidate
                  >
                    {/* Dados da Empresa */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Dados da Empresa
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="m-cnpj">CNPJ *</Label>
                          <Input
                            id="m-cnpj"
                            placeholder="00.000.000/0000-00"
                            {...(() => {
                              const { onBlur, onChange, ...rest } =
                                cnpjRegistration
                              return {
                                ...rest,
                                onChange: (
                                  e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                  e.target.value = maskCnpj(e.target.value)
                                  if (onChange) onChange(e)
                                },
                                onBlur: (
                                  e: React.FocusEvent<HTMLInputElement>,
                                ) => {
                                  onBlur(e)
                                  fetchCnpj(e.target.value)
                                },
                              }
                            })()}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="m-ie">Inscrição Estadual</Label>
                          <Input
                            id="m-ie"
                            placeholder="IE"
                            {...form.register('ie')}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="m-razao">Razão Social *</Label>
                        <Input
                          id="m-razao"
                          placeholder="Razão Social"
                          {...form.register('razaoSocial', { required: true })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="m-fantasia">Nome Fantasia</Label>
                          <Input
                            id="m-fantasia"
                            placeholder="Nome Fantasia"
                            {...form.register('nomeFantasia')}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="m-im">Inscrição Municipal</Label>
                          <Input
                            id="m-im"
                            placeholder="IM"
                            {...form.register('im')}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="m-cnae">CNAE</Label>
                          <Input
                            id="m-cnae"
                            placeholder="CNAE principal"
                            {...form.register('cnae')}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="m-uf">UF *</Label>
                          <Select
                            value={form.watch('uf')}
                            onValueChange={(v) => form.setValue('uf', v)}
                          >
                            <SelectTrigger id="m-uf">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {UF_OPTIONS.map((uf) => (
                                <SelectItem key={uf} value={uf}>
                                  {uf}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Endereço
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="m-cep">CEP</Label>
                          <Input
                            id="m-cep"
                            placeholder="00000-000"
                            {...form.register('cep', {
                              onChange: (e) => {
                                e.target.value = maskCep(e.target.value)
                              },
                            })}
                            onBlur={(e) => fetchCep(e.target.value)}
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label htmlFor="m-logradouro">Logradouro</Label>
                          <Input
                            id="m-logradouro"
                            placeholder="Rua, Avenida..."
                            {...form.register('logradouro')}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="m-numero">Número</Label>
                          <Input
                            id="m-numero"
                            placeholder="Nº"
                            {...form.register('numero')}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="m-bairro">Bairro</Label>
                          <Input
                            id="m-bairro"
                            placeholder="Bairro"
                            {...form.register('bairro')}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="m-cidade">Cidade</Label>
                          <Input
                            id="m-cidade"
                            placeholder="Cidade"
                            {...form.register('cidade')}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="m-ibge">Cód. IBGE</Label>
                          <Input
                            id="m-ibge"
                            placeholder="IBGE"
                            {...form.register('codigoIbge')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Certificado */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Certificado Digital (opcional)
                      </h3>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : certificateFile ? 'border-green-500 bg-green-50' : 'border-muted-foreground/25 hover:border-primary'}`}
                      >
                        <input {...getInputProps()} />
                        {certificateFile ? (
                          <div className="flex items-center justify-center gap-2">
                            <IconFileCertificate className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              {certificateFile.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <IconCloudUpload className="h-7 w-7 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Arraste o .pfx aqui ou clique para selecionar
                            </span>
                          </div>
                        )}
                      </div>
                      {certificateFile && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label>Tipo</Label>
                            <Select
                              value={form.watch('certificateType')}
                              onValueChange={(v) =>
                                form.setValue('certificateType', v)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A1">A1</SelectItem>
                                <SelectItem value="A3">A3</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="m-cert-pass">Senha</Label>
                            <Input
                              id="m-cert-pass"
                              type="password"
                              placeholder="Senha do certificado"
                              {...form.register('certificatePassword')}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {formStatus === 'error' && (
                      <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        {resultMessage}
                      </div>
                    )}
                  </form>
                )}
              </DialogBody>

              {(formStatus === 'idle' || formStatus === 'error') && (
                <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <Button variant="ghost" onClick={handleDismiss}>
                    Configurar depois
                  </Button>
                  <Button
                    type="submit"
                    form="fiscal-onboarding-form"
                    disabled={form.formState.isSubmitting}
                  >
                    Ativar módulo fiscal
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
