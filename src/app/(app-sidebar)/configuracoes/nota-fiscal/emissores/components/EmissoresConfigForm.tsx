'use client'

// React
import { useEffect } from 'react'

// UI
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

// Icons
import { IconDeviceFloppy, IconBuilding, IconKey, IconLock } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Actions
import { createItemNew, getDataOld } from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

const emissoresSchema = z.object({
  emitCnpj: z.string().optional(),
  emitIe: z.string().optional(),
  emitIm: z.string().optional(),
  emitRazaoSocial: z.string().optional(),
  emitNomeFantasia: z.string().optional(),
  emitCrt: z.string().optional(),
  emitEndereco: z.string().optional(),
  emitNumero: z.string().optional(),
  emitBairro: z.string().optional(),
  emitCep: z.string().optional(),
  emitCmun: z.string().optional(),
  emitUf: z.string().optional(),
  // Invoicy Credentials
  accessKey: z.string().optional(),
  partnerKey: z.string().optional(),
  certificatePassword: z.string().optional(),
  ambiente: z.string().optional(),
})

type EmissoresFormType = z.infer<typeof emissoresSchema>

const crtOptions = [
  { value: '1', label: '1 - Simples Nacional' },
  { value: '2', label: '2 - Simples Nacional - Excesso de sublimite' },
  { value: '3', label: '3 - Regime Normal' },
]

const ufOptions = [
  { value: 'AC', label: 'AC - Acre' },
  { value: 'AL', label: 'AL - Alagoas' },
  { value: 'AP', label: 'AP - Amapá' },
  { value: 'AM', label: 'AM - Amazonas' },
  { value: 'BA', label: 'BA - Bahia' },
  { value: 'CE', label: 'CE - Ceará' },
  { value: 'DF', label: 'DF - Distrito Federal' },
  { value: 'ES', label: 'ES - Espírito Santo' },
  { value: 'GO', label: 'GO - Goiás' },
  { value: 'MA', label: 'MA - Maranhão' },
  { value: 'MT', label: 'MT - Mato Grosso' },
  { value: 'MS', label: 'MS - Mato Grosso do Sul' },
  { value: 'MG', label: 'MG - Minas Gerais' },
  { value: 'PA', label: 'PA - Pará' },
  { value: 'PB', label: 'PB - Paraíba' },
  { value: 'PR', label: 'PR - Paraná' },
  { value: 'PE', label: 'PE - Pernambuco' },
  { value: 'PI', label: 'PI - Piauí' },
  { value: 'RJ', label: 'RJ - Rio de Janeiro' },
  { value: 'RN', label: 'RN - Rio Grande do Norte' },
  { value: 'RS', label: 'RS - Rio Grande do Sul' },
  { value: 'RO', label: 'RO - Rondônia' },
  { value: 'RR', label: 'RR - Roraima' },
  { value: 'SC', label: 'SC - Santa Catarina' },
  { value: 'SP', label: 'SP - São Paulo' },
  { value: 'SE', label: 'SE - Sergipe' },
  { value: 'TO', label: 'TO - Tocantins' },
]

const ambienteOptions = [
  { value: '1', label: 'Produção' },
  { value: '2', label: 'Homologação' },
]

async function fetchEmissoresConfig() {
  try {
    const response = await getDataOld({
      route: '/fiscal/invoicy/config',
    })
    return response || null
  } catch (error) {
    return null
  }
}

export function EmissoresConfigForm() {
  const queryClient = useQueryClient()

  const { data: configData, isLoading } = useQuery({
    queryKey: ['invoicy-config'],
    queryFn: fetchEmissoresConfig,
  })

  const form = useForm<EmissoresFormType>({
    resolver: zodResolver(emissoresSchema),
    defaultValues: {
      emitCnpj: '',
      emitIe: '',
      emitIm: '',
      emitRazaoSocial: '',
      emitNomeFantasia: '',
      emitCrt: '1',
      emitEndereco: '',
      emitNumero: '',
      emitBairro: '',
      emitCep: '',
      emitCmun: '',
      emitCmun: '',
      emitUf: '',
      accessKey: '',
      partnerKey: '',
      certificatePassword: '',
      ambiente: '2',
    },
  })

  // Load existing config into form
  useEffect(() => {
    if (configData) {
      form.reset({
        emitCnpj: configData.emitCnpj || '',
        emitIe: configData.emitIe || '',
        emitIm: configData.emitIm || '',
        emitRazaoSocial: configData.emitRazaoSocial || '',
        emitNomeFantasia: configData.emitNomeFantasia || '',
        emitCrt: configData.emitCrt?.toString() || '1',
        emitEndereco: configData.emitEndereco || '',
        emitNumero: configData.emitNumero || '',
        emitBairro: configData.emitBairro || '',
        emitCep: configData.emitCep || '',
        emitCmun: configData.emitCmun || '',
        emitCmun: configData.emitCmun || '',
        emitUf: configData.emitUf || '',
        accessKey: configData.accessKey || '',
        partnerKey: configData.partnerKey || '',
        certificatePassword: configData.certificatePassword || '',
        ambiente: configData.ambiente === 'PRODUCAO' ? '1' : '2',
      })
    }
  }, [configData, form])

  async function onSubmit(data: EmissoresFormType) {
    try {
      const result = await createItemNew({
        route: '/fiscal/invoicy/config/upsert',
        data: {
          ...data,
          emitCrt: data.emitCrt ? parseInt(data.emitCrt, 10) : 1,
          ambiente: data.ambiente ? parseInt(data.ambiente, 10) : 2,
        },
      })

      if (!result.success) {
        toast.error(result.message || 'Erro ao salvar dados do emitente')
        return
      }

      toast.success('Dados do emitente salvos com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['invoicy-config'] })
    } catch (error) {
      toast.error('Erro ao salvar dados do emitente')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <FeaturedIcon variant="outline" Icon={IconBuilding} />
        <div>
          <h2 className="text-lg font-semibold">Dados do Emitente</h2>
          <p className="text-sm text-gray-500">
            Configure os dados da empresa que serão utilizados na emissão das
            notas fiscais
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Credenciais Invoicy */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <IconKey className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-base">Credenciais Invoicy</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="accessKey"
                label="Chave de Acesso (Access Key)"
                placeholder="Chave fornecida pelo Invoicy"
                type="password"
              />
              <FormInput
                name="partnerKey"
                label="Chave de Parceiro (Partner Key)"
                placeholder="Chave do parceiro (Opcional)"
                type="password"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="certificatePassword"
                label="Senha do Certificado"
                placeholder="Senha para instalar certificado"
                type="password"
              />
              <FormSelect
                name="ambiente"
                label="Ambiente"
                options={ambienteOptions}
              />
            </div>
          </div>

          {/* Dados da Empresa */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="font-semibold text-base">Identificação</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="emitCnpj"
                label="CNPJ"
                placeholder="00.000.000/0000-00"
              />
              <FormInput
                name="emitIe"
                label="Inscrição Estadual"
                placeholder="000000000"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="emitIm"
                label="Inscrição Municipal"
                placeholder="000000"
              />
              <FormSelect
                name="emitCrt"
                label="Código de Regime Tributário"
                options={crtOptions}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="emitRazaoSocial"
                label="Razão Social"
                placeholder="Nome da empresa"
              />
              <FormInput
                name="emitNomeFantasia"
                label="Nome Fantasia"
                placeholder="Nome fantasia"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="font-semibold text-base">Endereço</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormInput
                  name="emitEndereco"
                  label="Logradouro"
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <FormInput name="emitNumero" label="Número" placeholder="123" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormInput
                name="emitBairro"
                label="Bairro"
                placeholder="Bairro"
              />
              <FormInput name="emitCep" label="CEP" placeholder="00000-000" />
              <FormSelect name="emitUf" label="UF" options={ufOptions} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="emitCmun"
                label="Código do Município (IBGE)"
                placeholder="3550308"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              RightIcon={IconDeviceFloppy}
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? 'Salvando...'
                : 'Salvar Configuração'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
