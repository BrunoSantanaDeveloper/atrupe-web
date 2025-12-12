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

// Icons
import { IconDeviceFloppy, IconSettings } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { invoicyConfigSchema, type InvoicyConfigFormType } from './schema'

// Actions
import { createItemNew, updateItemNew, getItemById } from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

const environmentOptions = [
  { value: 'HOMOLOGACAO', label: 'Homologação (Testes)' },
  { value: 'PRODUCAO', label: 'Produção' },
]

async function fetchInvoicyConfig() {
  try {
    const response = await getItemById({
      route: '/fiscal/config',
      id: 'current', // Backend will resolve to current company
    })
    return response
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
    },
  })

  // Load existing config into form
  useEffect(() => {
    if (configData) {
      form.reset({
        partnerKey: configData.partnerKey || '',
        accessKey: configData.accessKey || '',
        environment: configData.environment || 'HOMOLOGACAO',
        nfeSeries: configData.nfeSeries || '1',
        nfeNextNumber: configData.nfeNextNumber || 1,
        nfceSeries: configData.nfceSeries || '',
        nfceNextNumber: configData.nfceNextNumber || undefined,
        nfseSeries: configData.nfseSeries || '',
        nfseNextNumber: configData.nfseNextNumber || undefined,
        defaultCfop: configData.defaultCfop || '5102',
        defaultOperationNature:
          configData.defaultOperationNature || 'Venda de mercadoria',
        taxInfoText: configData.taxInfoText || '',
      })
    }
  }, [configData, form])

  async function onSubmit(data: InvoicyConfigFormType) {
    try {
      const action = configData ? updateItemNew : createItemNew

      const result = await action({
        route: '/fiscal/config',
        params: data,
        ...(configData && { id: configData.id }),
      })

      if (result.error) {
        toast.error(result.error.message || 'Erro ao salvar configuração')
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
        <FeaturedIcon variant="primaryOutline" Icon={IconSettings} />
        <div>
          <h2 className="text-lg font-semibold">Configuração do Invoicy</h2>
          <p className="text-sm text-gray-500">
            Configure as credenciais de acesso ao Invoicy para emissão de notas
            fiscais
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Credentials Section */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="font-semibold text-base">Credenciais de Acesso</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="partnerKey"
                label="Partner Key"
                placeholder="Digite o Partner Key"
                required
              />
              <FormInput
                control={form.control}
                name="accessKey"
                label="Access Key"
                type="password"
                placeholder="Digite a Access Key"
                required
              />
            </div>

            <FormSelect
              control={form.control}
              name="environment"
              label="Ambiente"
              options={environmentOptions}
              required
            />
          </div>

          {/* NF-e Configuration */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="font-semibold text-base">Configuração de NF-e</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="nfeSeries"
                label="Série NF-e"
                placeholder="1"
              />
              <FormInput
                control={form.control}
                name="nfeNextNumber"
                label="Próximo Número NF-e"
                type="number"
                placeholder="1"
              />
            </div>
          </div>

          {/* NFC-e Configuration (Optional) */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="font-semibold text-base">Configuração de NFC-e (Opcional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="nfceSeries"
                label="Série NFC-e"
                placeholder="1"
              />
              <FormInput
                control={form.control}
                name="nfceNextNumber"
                label="Próximo Número NFC-e"
                type="number"
                placeholder="1"
              />
            </div>
          </div>

          {/* NFS-e Configuration (Optional) */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="font-semibold text-base">Configuração de NFS-e (Opcional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="nfseSeries"
                label="Série NFS-e"
                placeholder="1"
              />
              <FormInput
                control={form.control}
                name="nfseNextNumber"
                label="Próximo Número NFS-e"
                type="number"
                placeholder="1"
              />
            </div>
          </div>

          {/* Fiscal Defaults */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="font-semibold text-base">Padrões Fiscais</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="defaultCfop"
                label="CFOP Padrão"
                placeholder="5102"
              />
              <FormInput
                control={form.control}
                name="defaultOperationNature"
                label="Natureza da Operação Padrão"
                placeholder="Venda de mercadoria"
              />
            </div>

            <FormTextarea
              control={form.control}
              name="taxInfoText"
              label="Informações Fiscais Complementares"
              placeholder="Texto que será incluído nas notas fiscais"
              rows={4}
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
                  ? 'Atualizar Configuração'
                  : 'Salvar Configuração'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
