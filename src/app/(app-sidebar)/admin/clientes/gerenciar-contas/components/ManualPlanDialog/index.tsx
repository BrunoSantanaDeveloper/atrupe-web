'use client'

// Plano manual, sem cobrança: a assinatura criada por aqui não tem vínculo
// com o Asaas, então a sincronização noturna não a bloqueia por
// inadimplência. Serve às contas de cortesia, de teste e de homologação.
// É a mesma chamada do "Upgrade de plano" das contas trial
// (`/subscriptions/assign-manual`), oferecida para qualquer conta.

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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Actions
import { getData, createItemNew } from '@/actions/_cruds'
import { formatCurrencyToBrl, maskCpfCnpj } from '@/lib/utils'

// Types
import type { AccountItem } from '../Table/Data'

// Icons
import { IconGift, IconCircleCheck } from '@tabler/icons-react'

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
  planId: z.string().min(1, 'Selecione o plano'),
  password: z.string().min(1, 'Senha gerencial é obrigatória'),
})

type FormType = z.infer<typeof formSchema>

export function ManualPlanDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: { planId: '', password: '' },
  })
  const { handleSubmit, reset } = form

  const { data: plansRes } = useQuery({
    queryKey: ['admin-manageable-plans'],
    queryFn: () => getData({ route: '/plan/manage' }),
    enabled: open,
  })
  const plans: ManageablePlan[] = plansRes?.success ? plansRes.data : []
  // Só os planos disponíveis: sem preço base o backend recusa a atribuição
  const planOptions = plans
    .filter((plan) => plan.isActive)
    .map((plan) => ({
      value: plan.id,
      label: `${plan.name} — ${formatCurrencyToBrl(plan.basePrice)}/mês`,
    }))

  const onSubmit = async (data: FormType) => {
    if (!rowData?.id) {
      toast.error('ID da empresa não encontrado')
      return
    }

    const res = await createItemNew({
      route: '/subscriptions/assign-manual',
      data: {
        companyId: rowData.id,
        planId: data.planId,
        password: data.password,
      },
    })

    if (!res?.success) {
      toast.error(
        res?.message ||
          'Senha gerencial incorreta ou sessão encerrada. Entre de novo e tente outra vez.',
      )
      return
    }

    queryClient.invalidateQueries()
    toast.success(
      'Plano manual atribuído. A conta não é mais sincronizada com o Asaas.',
    )
    handleOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) reset()
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconGift} />
              <span>Plano manual, sem cobrança</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="manual-plan"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              noValidate
            >
              <div className="space-y-2">
                <p className="font-medium">Conta:</p>
                <div className="rounded-md bg-gray-50 p-4">
                  <p className="font-semibold">{rowData?.companyName}</p>
                  <p className="text-sm text-gray-600">
                    {rowData?.code} - {maskCpfCnpj(rowData?.document || '')}
                  </p>
                </div>
              </div>

              <FormSelect<FormType>
                name="planId"
                label="Plano"
                placeholder="Selecione o plano"
                options={planOptions}
                emptyMessage="Nenhum plano disponível"
                width="w-full"
              />

              <p className="text-sm text-gray-600">
                A assinatura passa a ser manual: sem cobrança no Asaas e sem
                bloqueio por inadimplência. É o caminho para contas de cortesia,
                de teste e de homologação. Para confirmar, insira sua senha
                gerencial.
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
            form="manual-plan"
            isLoading={form.formState.isSubmitting}
            RightIcon={IconCircleCheck}
          >
            Atribuir plano manual
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
