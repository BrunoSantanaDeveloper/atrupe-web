'use client'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Actions
import { getData, updateItemNew } from '@/actions/_cruds'
import { formatCurrencyToBrl } from '@/lib/utils'

// Types
import type { AccountItem } from '../Table/Data'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

interface ManageablePlan {
  id: string
  name: string
  planType: string
  basePrice: number
  isActive: boolean
}

const formSchema = z.object({
  planId: z.string().min(1, 'Selecione o novo plano'),
  password: z.string().min(1, 'Senha gerencial é obrigatória'),
})

type FormType = z.infer<typeof formSchema>

export function ChangePlanDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planId: '',
      password: '',
    },
  })

  const { handleSubmit, reset } = form

  const { data: plansRes } = useQuery({
    queryKey: ['admin-manageable-plans'],
    queryFn: () => getData({ route: '/plan/manage' }),
    enabled: open,
  })

  const plans: ManageablePlan[] = plansRes?.success ? plansRes.data : []

  // Todos os planos globais, exceto o plano atual da empresa
  const options = plans
    .filter((plan) => plan.planType !== rowData?.planType)
    .map((plan) => ({
      value: plan.id,
      label: `${plan.name} — ${formatCurrencyToBrl(plan.basePrice)}/mês`,
    }))

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset()
    }
    setOpen(value)
  }

  const onSubmit = async (data: FormType) => {
    if (!rowData?.id) {
      toast.error('ID da empresa não encontrado')
      return
    }

    const res = await updateItemNew({
      route: `/subscriptions/active-clients/${rowData.id}/change-plan`,
      data: {
        planId: data.planId,
        password: data.password,
      },
    })

    if (!res?.success) {
      toast.error(res.message || 'Não foi possível alterar o plano.')
      return
    }

    queryClient.invalidateQueries()
    toast.success('Plano da empresa alterado com sucesso!')
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span>Trocar plano</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="change-company-plan"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              noValidate
            >
              <div className="space-y-2">
                <p className="font-medium">Empresa selecionada:</p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-semibold">{rowData?.companyName}</p>
                  <p className="text-sm text-gray-600">
                    Plano atual: {rowData?.plan}
                  </p>
                </div>
              </div>

              <FormSelect<FormType>
                name="planId"
                label="Novo plano"
                placeholder="Selecione o plano"
                options={options}
                emptyMessage="Nenhum outro plano disponível"
                width="w-full"
              />

              <p className="text-sm text-gray-600">
                Os módulos adicionais e usuários extras já contratados são
                mantidos e recalculados no novo valor. Se a empresa estiver
                inadimplente, a cobrança em aberto é substituída por uma única
                cobrança no valor do novo plano, vencendo hoje.
              </p>

              <FormInput
                name="password"
                label="Senha gerencial"
                type="password"
                placeholder="Digite sua senha"
                width="w-full"
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="change-company-plan"
            isLoading={form.formState.isSubmitting}
            RightIcon={IconCircleCheck}
          >
            Confirmar troca
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
