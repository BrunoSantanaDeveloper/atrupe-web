'use client'

import { useState, useCallback } from 'react'
import { useRouter } from '@/hooks/useRouter'
import { toast } from 'sonner'
import { useDropzone } from 'react-dropzone'
import { useForm, FormProvider } from 'react-hook-form'

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { Logo } from '@/components/Logo'
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

import { createItemNew } from '@/actions/_cruds'
import { encodeFileToBase64 } from '@/lib/file-to-base64'
import { maskCnpj, maskCep } from '@/lib/utils'

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

export default function ConfigurarFiscalPage() {
  const router = useRouter()
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setCertificateFile(acceptedFiles[0])
      toast.success('Certificado carregado com sucesso!')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/x-pkcs12': ['.pfx', '.p12'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

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
          form.setValue('cep', data.cep.replace(/\D/g, ''))
          await fetchCep(data.cep)
        }

        if (data.numero) {
          form.setValue('numero', data.numero)
        }

        if (data.complemento) {
          form.setValue('complemento', data.complemento)
        }

        toast.success('Dados da empresa preenchidos!', { id: 'cnpj-fetch' })
      } else {
        toast.dismiss('cnpj-fetch')
      }
    } catch {
      toast.dismiss('cnpj-fetch')
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
          setTimeout(() => router.replace('/dashboard'), 4000)
        } else {
          setStatus('pending_review')
          setResultMessage(responseData.message)
          toast.info('Dados enviados para análise')
          setTimeout(() => router.replace('/dashboard'), 6000)
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

  // Status screens
  if (status === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-10 pb-10">
            <IconLoader2 className="mx-auto h-16 w-16 animate-spin text-primary mb-6" />
            <h2 className="text-xl font-semibold mb-2">
              Configurando módulo fiscal...
            </h2>
            <p className="text-muted-foreground">
              Estamos cadastrando sua empresa no sistema de emissão de notas
              fiscais. Isso pode levar alguns segundos.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-10 pb-10">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <IconCheck className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Módulo fiscal ativado!
            </h2>
            <p className="text-muted-foreground mb-4">{resultMessage}</p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para o dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'pending_review') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-lg text-center">
          <CardContent className="pt-10 pb-10">
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
              <IconAlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Dados recebidos!</h2>
            <p className="text-muted-foreground mb-4">{resultMessage}</p>
            <p className="text-sm text-muted-foreground">
              Você receberá um e-mail quando o módulo estiver pronto.
            </p>
            <Button
              className="mt-6"
              onClick={() => router.replace('/dashboard')}
            >
              Ir para o Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Configuração Fiscal</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para ativar o módulo de emissão de notas
            fiscais.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados da Empresa */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Dados da Empresa
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      {...form.register('cnpj', {
                        required: true,
                        onChange: (e) => {
                          e.target.value = maskCnpj(e.target.value)
                        },
                      })}
                      onBlur={(e) => {
                        form.register('cnpj').onBlur(e)
                        fetchCnpj(e.target.value)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ie">Inscrição Estadual</Label>
                    <Input
                      id="ie"
                      placeholder="Inscrição Estadual"
                      {...form.register('ie')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social *</Label>
                  <Input
                    id="razaoSocial"
                    placeholder="Razão Social completa"
                    {...form.register('razaoSocial', { required: true })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      placeholder="Nome Fantasia"
                      {...form.register('nomeFantasia')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="im">Inscrição Municipal</Label>
                    <Input
                      id="im"
                      placeholder="Inscrição Municipal"
                      {...form.register('im')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnae">CNAE</Label>
                    <Input
                      id="cnae"
                      placeholder="CNAE principal"
                      {...form.register('cnae')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="uf">UF *</Label>
                    <Select
                      value={form.watch('uf')}
                      onValueChange={(v) => form.setValue('uf', v)}
                    >
                      <SelectTrigger id="uf">
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
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Endereço
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      {...form.register('cep', {
                        onChange: (e) => {
                          e.target.value = maskCep(e.target.value)
                        },
                      })}
                      onBlur={(e) => fetchCep(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input
                      id="logradouro"
                      placeholder="Rua, Avenida..."
                      {...form.register('logradouro')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      placeholder="Nº"
                      {...form.register('numero')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      placeholder="Bairro"
                      {...form.register('bairro')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      placeholder="Cidade"
                      {...form.register('cidade')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="codigoIbge">Cód. IBGE</Label>
                    <Input
                      id="codigoIbge"
                      placeholder="Código IBGE"
                      {...form.register('codigoIbge')}
                    />
                  </div>
                </div>
              </div>

              {/* Certificado Digital */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Certificado Digital (opcional)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Se você possui um certificado digital A1, envie agora para
                  agilizar a ativação. Caso contrário, você poderá configurar
                  depois.
                </p>

                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : certificateFile
                        ? 'border-green-500 bg-green-50'
                        : 'border-muted-foreground/25 hover:border-primary'
                  }`}
                >
                  <input {...getInputProps()} />
                  {certificateFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <IconFileCertificate className="h-6 w-6 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {certificateFile.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <IconCloudUpload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Arraste o arquivo .pfx aqui ou clique para selecionar
                      </span>
                    </div>
                  )}
                </div>

                {certificateFile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="certificateType">Tipo</Label>
                      <Select
                        value={form.watch('certificateType')}
                        onValueChange={(v) =>
                          form.setValue('certificateType', v)
                        }
                      >
                        <SelectTrigger id="certificateType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A1">Certificado A1</SelectItem>
                          <SelectItem value="A3">Certificado A3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="certificatePassword">
                        Senha do certificado
                      </Label>
                      <Input
                        id="certificatePassword"
                        type="password"
                        placeholder="Senha do certificado"
                        {...form.register('certificatePassword')}
                      />
                    </div>
                  </div>
                )}
              </div>

              {status === 'error' && (
                <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                  {resultMessage}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.replace('/dashboard')}
                >
                  Configurar depois
                </Button>
                <Button type="submit">Ativar módulo fiscal</Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  )
}
