'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { useForm, FormProvider } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  IconCheck,
  IconCloudUpload,
  IconFileCertificate,
  IconLoader2,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

import { createItemNew } from '@/actions/_cruds'
import { encodeFileToBase64 } from '@/lib/file-to-base64'
import { maskCep, maskCnpj } from '@/lib/utils'

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

type OnboardingStatus =
  | 'form'
  | 'submitting'
  | 'success'
  | 'pending_review'
  | 'error'

interface FiscalOnboardingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FORM_ID = 'fiscal-onboarding-form'

export function FiscalOnboardingModal({
  open,
  onOpenChange,
}: FiscalOnboardingModalProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<OnboardingStatus>('form')
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [resultMessage, setResultMessage] = useState('')

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCertificateFile(file)
      toast.success('Certificado carregado com sucesso!')
    }
  }

  const fetchCnpj = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '')
    if (cleanCnpj.length !== 14) return

    try {
      toast.loading('Buscando dados do CNPJ...', { id: 'cnpj-fetch' })
      const res = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`,
      )
      const data = await res.json()

      if (res.ok) {
        form.setValue('razaoSocial', data.razao_social || '')
        form.setValue('nomeFantasia', data.nome_fantasia || '')
        form.setValue('cnae', data.cnae_fiscal?.toString() || '')

        if (data.cep) {
          const cep = data.cep.replace(/\D/g, '')
          form.setValue('cep', maskCep(cep))
          await fetchCep(cep)
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

  const fetchCep = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        form.setValue('logradouro', data.logradouro || '')
        form.setValue('bairro', data.bairro || '')
        form.setValue('cidade', data.localidade || '')
        form.setValue('uf', data.uf || '')
        form.setValue('codigoIbge', data.ibge || '')
      }
    } catch {
      // Ignore CEP lookup errors
    }
  }

  const onSubmit = async (data: FiscalFormData) => {
    setStatus('submitting')

    try {
      let certificateBase64: string | undefined
      if (certificateFile) {
        certificateBase64 = await encodeFileToBase64(certificateFile)
      }

      const result = await createItemNew({
        route: '/fiscal/onboarding',
        data: {
          ...data,
          certificate: certificateBase64,
        },
      })

      if (result.success) {
        const responseData = result.data as { status: string; message: string }
        if (responseData.status === 'ACTIVE') {
          setStatus('success')
          setResultMessage(responseData.message)
          toast.success('Módulo fiscal ativado com sucesso!')
          queryClient.invalidateQueries({
            queryKey: ['fiscal-onboarding-status'],
          })
          setTimeout(() => {
            onOpenChange(false)
            resetForm()
          }, 3000)
        } else {
          setStatus('pending_review')
          setResultMessage(responseData.message)
          toast.info('Dados enviados para análise')
          queryClient.invalidateQueries({
            queryKey: ['fiscal-onboarding-status'],
          })
        }
      } else {
        setStatus('error')
        setResultMessage(result.message || 'Erro ao processar dados fiscais')
        toast.error(result.message || 'Erro ao processar dados fiscais')
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro inesperado ao processar dados fiscais'
      setStatus('error')
      setResultMessage(message)
      toast.error(message)
    }
  }

  const resetForm = () => {
    setStatus('form')
    setResultMessage('')
    setCertificateFile(null)
    form.reset()
  }

  const handleClose = (isOpen: boolean) => {
    if (status === 'submitting') return
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }

  // Status screens (submitting, success, pending_review)
  if (status !== 'form' && status !== 'error') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Configuração Fiscal</DialogTitle>
            <DialogDescription>Status do módulo fiscal</DialogDescription>
          </DialogHeader>

          {status === 'submitting' && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <IconLoader2 className="h-14 w-14 animate-spin text-brand mb-6" />
              <h2 className="type-section-title mb-2">
                Configurando módulo fiscal...
              </h2>
              <p className="text-sm text-gray text-center">
                Estamos cadastrando sua empresa no sistema de emissão de notas
                fiscais.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="h-14 w-14 rounded-full bg-success-100 flex items-center justify-center mb-6">
                <IconCheck className="h-7 w-7 text-success-600" />
              </div>
              <h2 className="type-section-title mb-2">
                Módulo fiscal ativado!
              </h2>
              <p className="text-sm text-gray text-center mb-2">
                {resultMessage}
              </p>
              <p className="text-xs text-gray">Fechando automaticamente...</p>
            </div>
          )}

          {status === 'pending_review' && (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <div className="h-14 w-14 rounded-full bg-warning-100 flex items-center justify-center mb-6">
                <IconAlertTriangle className="h-7 w-7 text-warning-600" />
              </div>
              <h2 className="type-section-title mb-2">Dados recebidos!</h2>
              <p className="text-sm text-gray text-center mb-6">
                {resultMessage}
              </p>
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  // Main form
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
        <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
          <DialogTitle>Configuração Fiscal</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para ativar o módulo de emissão de notas
            fiscais.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <FormProvider {...form}>
            <form
              id={FORM_ID}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Dados da Empresa */}
              <div className="space-y-4">
                <div className="space-y-2 pb-2 border-b border-gray-100">
                  <h3 className="type-card-title flex items-center gap-2">
                    Dados da Empresa
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-cnpj">CNPJ *</Label>
                    <Input
                      id="modal-cnpj"
                      placeholder="00.000.000/0000-00"
                      {...form.register('cnpj', {
                        required: true,
                        onChange: (event) => {
                          event.target.value = maskCnpj(event.target.value)
                        },
                      })}
                      onBlur={(event) => fetchCnpj(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-ie">Inscrição Estadual</Label>
                    <Input
                      id="modal-ie"
                      placeholder="Inscrição Estadual"
                      {...form.register('ie')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modal-razaoSocial">Razão Social *</Label>
                  <Input
                    id="modal-razaoSocial"
                    placeholder="Razão Social completa"
                    {...form.register('razaoSocial', { required: true })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="modal-nomeFantasia"
                      placeholder="Nome Fantasia"
                      {...form.register('nomeFantasia')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-im">Inscrição Municipal</Label>
                    <Input
                      id="modal-im"
                      placeholder="Inscrição Municipal"
                      {...form.register('im')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-cnae">CNAE</Label>
                    <Input
                      id="modal-cnae"
                      placeholder="CNAE principal"
                      {...form.register('cnae')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-uf">UF *</Label>
                    <Select
                      value={form.watch('uf')}
                      onValueChange={(v) => form.setValue('uf', v)}
                    >
                      <SelectTrigger id="modal-uf">
                        <SelectValue placeholder="Selecione o estado" />
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
              <div className="space-y-4">
                <div className="space-y-2 pb-2 border-b border-gray-100">
                  <h3 className="type-card-title flex items-center gap-2">
                    Endereço
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-cep">CEP</Label>
                    <Input
                      id="modal-cep"
                      placeholder="00000-000"
                      {...form.register('cep', {
                        onChange: (event) => {
                          event.target.value = maskCep(event.target.value)
                        },
                      })}
                      onBlur={(e) => fetchCep(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="modal-logradouro">Logradouro</Label>
                    <Input
                      id="modal-logradouro"
                      placeholder="Rua, Avenida..."
                      {...form.register('logradouro')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modal-numero">Número</Label>
                    <Input
                      id="modal-numero"
                      placeholder="Nº"
                      {...form.register('numero')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-bairro">Bairro</Label>
                    <Input
                      id="modal-bairro"
                      placeholder="Bairro"
                      {...form.register('bairro')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-cidade">Cidade</Label>
                    <Input
                      id="modal-cidade"
                      placeholder="Cidade"
                      {...form.register('cidade')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modal-codigoIbge">Cód. IBGE</Label>
                    <Input
                      id="modal-codigoIbge"
                      placeholder="Código IBGE"
                      {...form.register('codigoIbge')}
                    />
                  </div>
                </div>
              </div>

              {/* Certificado Digital */}
              <div className="space-y-4">
                <div className="space-y-2 pb-2 border-b border-gray-100">
                  <h3 className="type-card-title flex items-center gap-2">
                    Certificado Digital (opcional)
                  </h3>
                </div>
                <p className="text-sm text-gray">
                  Se você possui um certificado digital A1, envie agora para
                  agilizar a ativação. Caso contrário, você poderá configurar
                  depois.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pfx,.p12"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                    certificateFile
                      ? 'border-success-500 bg-success-50'
                      : 'border-gray-300 hover:border-brand'
                  }`}
                >
                  {certificateFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <Icon
                        icon={IconFileCertificate}
                        size="md"
                        className="text-success-600"
                      />
                      <span className="text-sm font-medium text-success-700">
                        {certificateFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <IconCloudUpload className="h-7 w-7 text-gray" />
                      <span className="text-sm text-gray">
                        Clique para selecionar o arquivo .pfx
                      </span>
                    </div>
                  )}
                </button>

                {certificateFile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="modal-certificateType">Tipo</Label>
                      <Select
                        value={form.watch('certificateType')}
                        onValueChange={(v) =>
                          form.setValue('certificateType', v)
                        }
                      >
                        <SelectTrigger id="modal-certificateType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A1">Certificado A1</SelectItem>
                          <SelectItem value="A3">Certificado A3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modal-certificatePassword">
                        Senha do certificado
                      </Label>
                      <Input
                        id="modal-certificatePassword"
                        type="password"
                        placeholder="Senha do certificado"
                        {...form.register('certificatePassword')}
                      />
                    </div>
                  </div>
                )}
              </div>

              {status === 'error' && (
                <div className="rounded-lg bg-error-50 border border-error-200 p-4 text-sm text-error-700">
                  {resultMessage}
                </div>
              )}
            </form>
          </FormProvider>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleClose(false)}
          >
            Configurar depois
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            className="bg-brand hover:bg-brand-600 text-white"
          >
            Ativar módulo fiscal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
