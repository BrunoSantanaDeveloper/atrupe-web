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
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { FormInput } from '@/components/common/form/FormInput'

// Form
import { useForm } from 'react-hook-form'
import { FormType, schema } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Types
import type { TrialAccountItem } from '../Table/Data'

// Icons
import { IconRocket } from '@tabler/icons-react'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: TrialAccountItem | null
}

export function UpgradeTrialAccountDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
    },
  })

  const { handleSubmit, reset } = form

  const onSubmit = async (data: FormType) => {
    if (!rowData?.company?.id) {
      toast.error('ID da empresa não encontrado')
      return
    }

    const res = await createItemNew({
      route: '/subscriptions/assign-manual',
      data: {
        companyId: rowData.company.id,
        password: data.password,
      },
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries({ queryKey: ['trial-accounts-list'] })
    toast.success('Conta atualizada para plano Start com sucesso!')
    handleOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset()
    }
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconRocket} />
              <span>Upgrade para plano Start</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="upgrade-trial-account"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-5"
              noValidate
            >
              <div className="space-y-2">
                <p className="font-medium">
                  Você está prestes a atualizar a conta:
                </p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-semibold">{rowData?.company?.name}</p>
                  <p className="text-sm text-gray-600">
                    {rowData?.code} - {rowData?.document}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Esta ação irá converter a conta trial para o plano Start. Para
                  confirmar, insira sua senha gerencial.
                </p>
              </div>

              <FormInput<FormType>
                name="password"
                label="Senha gerencial"
                type="password"
                placeholder="Digite sua senha"
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
            form="upgrade-trial-account"
            isLoading={form.formState.isSubmitting}
          >
            Confirmar upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
