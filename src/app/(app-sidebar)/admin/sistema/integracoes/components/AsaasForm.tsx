'use client'

import { useRouter } from '@/hooks/useRouter'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { updateSystemSettings } from '@/actions/systemSettings'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '@/components/ui/form'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

type AsaasConfig = {
  environment: 'sandbox' | 'production'
  sandbox: { url: string; token: string }
  production: { url: string; token: string }
}

export const asaasSchema = z.object({
  environment: z.enum(['sandbox', 'production'], {
    required_error: 'Selecione o ambiente ativo',
  }),
  sandboxUrl: z
    .string()
    .min(1, 'A URL de Sandbox é obrigatória')
    .url('A URL precisa ser válida'),
  sandboxToken: z.string().min(1, 'O Token de Sandbox é obrigatório'),
  productionUrl: z
    .string()
    .min(1, 'A URL de Produção é obrigatória')
    .url('A URL precisa ser válida'),
  productionToken: z.string().min(1, 'O Token de Produção é obrigatório'),
  password: z.string().min(1, 'A senha gerencial é obrigatória'),
})

type FormType = z.infer<typeof asaasSchema>

export function AsaasForm({
  initialData,
}: {
  initialData?: AsaasConfig | null
}) {
  const router = useRouter()

  const form = useForm<FormType>({
    resolver: zodResolver(asaasSchema),
    values: {
      environment: initialData?.environment || 'sandbox',
      sandboxUrl:
        initialData?.sandbox?.url || 'https://api-sandbox.asaas.com/v3',
      sandboxToken: initialData?.sandbox?.token || '',
      productionUrl: initialData?.production?.url || '',
      productionToken: initialData?.production?.token || '',
      password: '',
    },
  })

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: FormType) => {
    const { password, ...configData } = data
    const toastId = toast.loading('Salvando configurações...')

    const payload: AsaasConfig = {
      environment: configData.environment,
      sandbox: {
        url: configData.sandboxUrl,
        token: configData.sandboxToken,
      },
      production: {
        url: configData.productionUrl,
        token: configData.productionToken,
      },
    }

    try {
      const res = await updateSystemSettings({
        config: payload,
        password,
      })

      if (res.success) {
        toast.success('Configurações do Asaas salvas com sucesso!', {
          id: toastId,
        })
        router.refresh()
      } else {
        toast.error(res.message || 'Erro ao salvar configurações.', {
          id: toastId,
        })
      }
    } catch {
      toast.error('Ocorreu um erro inesperado ao salvar as configurações.', {
        id: toastId,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Asaas</CardTitle>
        <CardDescription>
          Gerencie as chaves de API e URLs do Asaas para os ambientes de Sandbox
          e Produção.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="p-6">
        <Form {...form}>
          <form
            id="asaas-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            noValidate
          >
            <div className="flex flex-wrap gap-5">
              <FormSelect
                name="environment"
                label="Ambiente Ativo"
                placeholder="Selecione o ambiente"
                options={[
                  { label: 'Sandbox (Homologação)', value: 'sandbox' },
                  { label: 'Produção', value: 'production' },
                ]}
                width="w-full md:w-[300px]"
              />
            </div>

            <Separator />

            <div className="flex flex-wrap gap-5">
              <div className="w-full">
                <h3 className="type-card-title">Credenciais de Sandbox</h3>
              </div>

              <FormInput
                name="sandboxUrl"
                label="API URL"
                placeholder="https://api-sandbox.asaas.com/v3"
                width="flex-[1_0_231px]"
              />

              <FormInput
                name="sandboxToken"
                label="API Token"
                type="password"
                placeholder="$aact_..."
                width="flex-[1_0_231px]"
              />
            </div>

            <Separator />

            <div className="flex flex-wrap gap-5">
              <div className="w-full">
                <h3 className="type-card-title">Credenciais de Produção</h3>
              </div>

              <FormInput
                name="productionUrl"
                label="API URL"
                placeholder="https://api.asaas.com/v3"
                width="flex-[1_0_231px]"
              />

              <FormInput
                name="productionToken"
                label="API Token"
                type="password"
                placeholder="$aact_..."
                width="flex-[1_0_231px]"
              />
            </div>

            <Separator className="mt-2" />

            <div>
              <FormInput
                name="password"
                label="Senha gerencial"
                type="password"
                placeholder="Digite sua senha"
                width="w-full md:w-[350px]"
              />
              <p className="text-sm text-gray-400 mt-1">
                Obrigatória para salvar configurações sensíveis.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                form="asaas-form"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                RightIcon={IconCircleCheck}
              >
                Salvar Configurações
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
