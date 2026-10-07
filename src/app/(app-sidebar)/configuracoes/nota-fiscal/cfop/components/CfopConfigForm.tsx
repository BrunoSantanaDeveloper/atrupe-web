'use client'

// React
import { useEffect } from 'react'

// UI
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { FormSelect } from '@/components/common/form/FormSelect'

// Icons
import { IconDeviceFloppy, IconArrowsSplit } from '@tabler/icons-react'

// Form
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

// Actions
import { createItemNew, getDataOld } from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

const cfopSchema = z.object({
  defaultCfop: z.string().optional(),
  defaultOperationNature: z.string().optional(),
})

type CfopFormType = z.infer<typeof cfopSchema>

const cfopOptions = [
  { value: '5101', label: '5101 - Venda de produção do estabelecimento' },
  { value: '5102', label: '5102 - Venda de mercadoria adquirida' },
  { value: '5103', label: '5103 - Venda de produção para não contribuinte' },
  {
    value: '5104',
    label: '5104 - Venda de mercadoria adquirida para não contribuinte',
  },
  { value: '5405', label: '5405 - Venda de mercadoria sujeita a ST' },
  { value: '5656', label: '5656 - Venda de combustíveis ou lubrificantes' },
  { value: '5910', label: '5910 - Remessa em bonificação' },
  { value: '5911', label: '5911 - Remessa de amostra grátis' },
  { value: '6101', label: '6101 - Venda de produção para outro estado' },
  {
    value: '6102',
    label: '6102 - Venda de mercadoria adquirida para outro estado',
  },
  {
    value: '6103',
    label: '6103 - Venda de produção para não contribuinte (outro estado)',
  },
  {
    value: '6104',
    label:
      '6104 - Venda de mercadoria adquirida para não contribuinte (outro estado)',
  },
  {
    value: '6405',
    label: '6405 - Venda de mercadoria sujeita a ST (outro estado)',
  },
  { value: '7101', label: '7101 - Venda de produção para exportação' },
  {
    value: '7102',
    label: '7102 - Venda de mercadoria adquirida para exportação',
  },
]

const operationNatureOptions = [
  { value: 'Venda de mercadoria', label: 'Venda de mercadoria' },
  { value: 'Venda de produção própria', label: 'Venda de produção própria' },
  {
    value: 'Venda de mercadoria adquirida',
    label: 'Venda de mercadoria adquirida',
  },
  { value: 'Prestação de serviços', label: 'Prestação de serviços' },
  { value: 'Devolução de mercadoria', label: 'Devolução de mercadoria' },
  { value: 'Remessa para conserto', label: 'Remessa para conserto' },
  { value: 'Remessa para demonstração', label: 'Remessa para demonstração' },
  { value: 'Remessa em bonificação', label: 'Remessa em bonificação' },
  {
    value: 'Transferência de mercadoria',
    label: 'Transferência de mercadoria',
  },
  { value: 'Exportação', label: 'Exportação' },
]

async function fetchCfopConfig() {
  try {
    const response = await getDataOld({
      route: '/fiscal/invoicy/config',
    })
    return response || null
  } catch (error) {
    return null
  }
}

export function CfopConfigForm() {
  const queryClient = useQueryClient()

  const { data: configData, isLoading } = useQuery({
    queryKey: ['invoicy-config'],
    queryFn: fetchCfopConfig,
  })

  const form = useForm<CfopFormType>({
    resolver: zodResolver(cfopSchema),
    defaultValues: {
      defaultCfop: '5102',
      defaultOperationNature: 'Venda de mercadoria',
    },
  })

  // Load existing config into form
  useEffect(() => {
    if (configData) {
      form.reset({
        defaultCfop: configData.defaultCfop || '5102',
        defaultOperationNature:
          configData.defaultOperationNature || 'Venda de mercadoria',
      })
    }
  }, [configData, form])

  async function onSubmit(data: CfopFormType) {
    try {
      const result = await createItemNew({
        route: '/fiscal/invoicy/config/upsert',
        data,
      })

      if (!result.success) {
        toast.error(result.message || 'Erro ao salvar configuração')
        return
      }

      toast.success('Configuração salva')
      queryClient.invalidateQueries({ queryKey: ['invoicy-config'] })
    } catch (error) {
      toast.error('Erro ao salvar configuração')
      console.error(error)
    }
  }

  if (isLoading) {
    // Cabeçalho e seções no formato do formulário, sem texto solto
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        {Array.from({ length: 1 }, (_, section) => (
          <div key={section} className="space-y-4 rounded-lg bg-white p-6">
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }, (_, field) => (
                <div key={field} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <FeaturedIcon variant="outline" Icon={IconArrowsSplit} />
        <div>
          <h2 className="text-lg font-semibold">Natureza de Operação e CFOP</h2>
          <p className="text-sm text-gray-500">
            Configure o CFOP e natureza da operação padrão para emissão de NF-e.
            Estas configurações podem ser sobrescritas em cada produto.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Default CFOP and Operation Nature */}
          <div className="rounded-lg bg-white p-6 space-y-4">
            <h3 className="font-semibold text-base">Configurações Padrão</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                name="defaultCfop"
                label="CFOP Padrão"
                options={cfopOptions}
              />
              <FormSelect
                name="defaultOperationNature"
                label="Natureza da Operação Padrão"
                options={operationNatureOptions}
              />
            </div>
          </div>

          {/* Info Card */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Sobre CFOP e Natureza da Operação
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                <strong>CFOP</strong> (Código Fiscal de Operações e Prestações)
                identifica o tipo de operação fiscal.
              </li>
              <li>
                CFOPs que começam com <strong>5</strong> são para operações
                dentro do estado.
              </li>
              <li>
                CFOPs que começam com <strong>6</strong> são para operações
                interestaduais.
              </li>
              <li>
                CFOPs que começam com <strong>7</strong> são para exportação.
              </li>
              <li>
                A <strong>Natureza da Operação</strong> é uma descrição do tipo
                de operação.
              </li>
              <li>
                Você pode definir CFOPs específicos para cada produto na página
                de Produtos.
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              RightIcon={IconDeviceFloppy}
              isLoading={form.formState.isSubmitting}
            >
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
