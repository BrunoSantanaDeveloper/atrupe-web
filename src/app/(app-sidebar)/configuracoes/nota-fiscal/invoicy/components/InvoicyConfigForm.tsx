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
import { FormTextarea } from '@/components/common/form/FormTextarea'
import { FormSwitch } from '@/components/common/form/FormSwitch'
import { FormCheckbox } from '@/components/common/form/FormCheckbox'

// Icons
import { IconDeviceFloppy, IconSettings } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { invoicyConfigSchema, type InvoicyConfigFormType } from './schema'

// Actions
import { createItemNew, getDataOld } from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

const environmentOptions = [
  { value: 'HOMOLOGACAO', label: 'Homologação (Testes)' },
  { value: 'PRODUCAO', label: 'Produção' },
]

async function fetchInvoicyConfig() {
  try {
    const response = await getDataOld({
      route: '/fiscal/invoicy/config',
    })
    // getDataOld já retorna res.data, não precisa de .data adicional
    return response || null
  } catch (error) {
    return null
  }
}

export function InvoicyConfigForm() {
  const queryClient = useQueryClient()

  const { data: configData, isLoading } = useQuery({
    queryKey: ['invoicy-config'],
    queryFn: fetchInvoicyConfig,
  })

  const form = useForm<InvoicyConfigFormType>({
    resolver: zodResolver(invoicyConfigSchema),
    defaultValues: {
      environment: 'HOMOLOGACAO',
      nfeSeries: '1',
      nfeNextNumber: 1,
      defaultCfop: '5102',
      defaultOperationNature: 'Venda de mercadoria',
      sendDanfeXmlAutomatically: false,
      sendDanfeAutomatically: true,
      sendXmlAutomatically: true,
      sendFiscalEmailCopyTo: '',
    },
  })

  const sendAutomatically = form.watch('sendDanfeXmlAutomatically')

  // Load existing config into form
  useEffect(() => {
    if (configData) {
      form.reset({
        environment: configData.environment || 'HOMOLOGACAO',
        nfeSeries: configData.nfeSeries || '1',
        nfeNextNumber: configData.nfeNextNumber || 1,
        nfceSeries: configData.nfceSeries || '',
        nfceNextNumber: configData.nfceNextNumber || undefined,
        cscId: configData.cscId || '',
        cscToken: '',
        nfseSeries: configData.nfseSeries || '',
        nfseNextNumber: configData.nfseNextNumber || undefined,
        emitIm: configData.emitIm || '',
        emitCmun: configData.emitCmun || '',
        codigoServico: configData.codigoServico || '',
        aliquotaIss: configData.aliquotaIss || undefined,
        defaultCfop: configData.defaultCfop || '5102',
        defaultOperationNature:
          configData.defaultOperationNature || 'Venda de mercadoria',
        taxInfoText: configData.taxInfoText || '',
        sendDanfeXmlAutomatically:
          configData.sendDanfeXmlAutomatically || false,
        sendDanfeAutomatically: configData.sendDanfeAutomatically !== false,
        sendXmlAutomatically: configData.sendXmlAutomatically !== false,
        sendFiscalEmailCopyTo: configData.sendFiscalEmailCopyTo || '',
      })
    }
  }, [configData, form])

  async function onSubmit(data: InvoicyConfigFormType) {
    const payload = {
      name: configData?.name || 'Emissor padrão',
      isDefault: configData?.isDefault ?? true,
      environment: data.environment,
      nfeSeries: data.nfeSeries,
      nfeNextNumber: data.nfeNextNumber,
      nfceSeries: data.nfceSeries,
      nfceNextNumber: data.nfceNextNumber,
      cscId: data.cscId || undefined,
      cscToken: data.cscToken || undefined,
      nfseSeries: data.nfseSeries,
      nfseNextNumber: data.nfseNextNumber,
      codigoServico: data.codigoServico,
      aliquotaIss: data.aliquotaIss,
      defaultCfop: data.defaultCfop,
      defaultOperationNature: data.defaultOperationNature,
      taxInfoText: data.taxInfoText,
    }

    try {
      const result = await createItemNew({
        route: '/fiscal/invoicy/config/upsert',
        data: payload,
      })

      if (!result.success) {
        toast.error(result.message || 'Erro ao salvar configuração')
        return
      }

      toast.success(
        configData
          ? 'Configuração atualizada com sucesso!'
          : 'Configuração criada com sucesso!',
      )

      queryClient.invalidateQueries({ queryKey: ['invoicy-config'] })
    } catch (error) {
      toast.error('Erro ao salvar configuração')
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
        <FeaturedIcon variant="outline" Icon={IconSettings} />
        <div>
          <h2 className="type-section-title">Configurações gerais</h2>
          <p className="text-sm text-gray-500">
            Configure as séries, numeração e padrões fiscais para emissão de
            notas fiscais
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Environment Section */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="type-card-title">Ambiente</h3>

            <FormSelect
              name="environment"
              label="Ambiente de Emissão"
              options={environmentOptions}
            />
          </div>

          {/* NF-e Configuration */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="type-card-title">Configuração de NF-e</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput name="nfeSeries" label="Série NF-e" placeholder="1" />
              <FormInput
                name="nfeNextNumber"
                label="Próximo Número NF-e"
                type="number"
                placeholder="1"
              />
            </div>
          </div>

          {/* NFC-e Configuration (Optional) */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="type-card-title">
              Configuração de NFC-e (Opcional)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="nfceSeries"
                label="Série NFC-e"
                placeholder="1"
              />
              <FormInput
                name="nfceNextNumber"
                label="Próximo Número NFC-e"
                type="number"
                placeholder="1"
              />
              <FormInput
                name="cscId"
                label="ID do CSC"
                placeholder="Ex: 000001"
              />
              <FormInput
                name="cscToken"
                label="Token CSC"
                type="password"
                placeholder={
                  configData?.cscConfigured
                    ? 'Token cadastrado'
                    : 'Informe o token CSC'
                }
              />
            </div>
          </div>

          {/* NFS-e Configuration (Optional) */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="type-card-title">
              Configuração de NFS-e (Opcional)
            </h3>
            <p className="text-sm text-gray-500">
              Para emissão de Nota Fiscal de Serviço Eletrônica
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="nfseSeries"
                label="Série NFS-e"
                placeholder="A1"
              />
              <FormInput
                name="nfseNextNumber"
                label="Próximo Número RPS"
                type="number"
                placeholder="1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="emitIm"
                label="Inscrição Municipal"
                placeholder="000000"
              />
              <FormInput
                name="emitCmun"
                label="Código do Município (IBGE)"
                placeholder="3550308"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="codigoServico"
                label="Código do Serviço"
                placeholder="17.01"
              />
              <FormInput
                name="aliquotaIss"
                label="Alíquota ISS (%)"
                type="number"
                placeholder="3"
              />
            </div>
          </div>

          {/* Fiscal Defaults */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="type-card-title">Padrões Fiscais</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                name="defaultCfop"
                label="CFOP Padrão"
                placeholder="5102"
              />
              <FormInput
                name="defaultOperationNature"
                label="Natureza da Operação Padrão"
                placeholder="Venda de mercadoria"
              />
            </div>

            <FormTextarea
              name="taxInfoText"
              label="Informações Fiscais Complementares"
              placeholder="Texto que será incluído nas notas fiscais"
              rows={4}
            />
          </div>

          <div className="rounded-lg bg-white p-6 space-y-4">
            <div>
              <h3 className="type-card-title">Envio ao Cliente</h3>
              <p className="text-sm text-gray-500">
                Configure o envio automático dos documentos fiscais quando a
                NF-e for autorizada.
              </p>
            </div>

            <FormSwitch
              name="sendDanfeXmlAutomatically"
              label="Enviar DANFE/XML automaticamente ao cliente"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormCheckbox
                name="sendDanfeAutomatically"
                label="Enviar DANFE"
                disabled={!sendAutomatically}
              />
              <FormCheckbox
                name="sendXmlAutomatically"
                label="Enviar XML"
                disabled={!sendAutomatically}
              />
            </div>

            <FormInput
              name="sendFiscalEmailCopyTo"
              label="E-mail para cópia"
              type="email"
              placeholder="financeiro@empresa.com"
            />
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
                : configData
                  ? 'Salvar'
                  : 'Salvar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
