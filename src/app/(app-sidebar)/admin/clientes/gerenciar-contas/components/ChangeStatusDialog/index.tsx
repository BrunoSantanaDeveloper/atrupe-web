'use client'

// React
import { useEffect, SVGProps } from 'react'

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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Components
import { FormToggleCard } from '@/components/common/form/FormToggleCard'

// Third-party
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Types
import type { AccountItem } from '../Table/Data'

// Icons
import {
  IconAlertTriangle,
  IconLock,
  IconSquareX,
  IconCheck,
  IconProps,
} from '@tabler/icons-react'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

type StatusOption = 'ACTIVE' | 'BLOCKED' | 'INACTIVE' | 'CANCELED'

const formSchema = z.object({
  status: z.enum(['ACTIVE', 'BLOCKED', 'INACTIVE']),
  password: z.string().min(1, 'Senha gerencial é obrigatória'),
})

// Helper para obter configuração baseada no status
const getStatusConfig = (currentStatus?: StatusOption) => {
  // Garantir que temos um status válido
  const safeStatus: StatusOption = currentStatus || 'ACTIVE'

  const statusTexts: Record<StatusOption, string> = {
    ACTIVE: 'Conta ativa, o que deseja fazer?',
    BLOCKED: 'Conta bloqueada, o que deseja fazer?',
    INACTIVE: 'Conta inativa, o que deseja fazer?',
    CANCELED: 'Conta cancelada, o que deseja fazer?',
  }

  const availableOptions: Record<
    StatusOption,
    Array<{
      label: string
      value: string
      icon:
        | React.ComponentType<IconProps>
        | React.ComponentType<SVGProps<SVGSVGElement>>
    }>
  > = {
    ACTIVE: [
      {
        label: 'Bloquear',
        value: 'BLOCKED',
        icon: IconLock,
      },
      {
        label: 'Inativar',
        value: 'INACTIVE',
        icon: IconSquareX,
      },
    ],
    BLOCKED: [
      {
        label: 'Ativar',
        value: 'ACTIVE',
        icon: IconCheck,
      },
      {
        label: 'Inativar',
        value: 'INACTIVE',
        icon: IconSquareX,
      },
    ],
    INACTIVE: [
      {
        label: 'Ativar',
        value: 'ACTIVE',
        icon: IconCheck,
      },
      {
        label: 'Bloquear',
        value: 'BLOCKED',
        icon: IconLock,
      },
    ],
    CANCELED: [
      {
        label: 'Ativar',
        value: 'ACTIVE',
        icon: IconCheck,
      },
      {
        label: 'Inativar',
        value: 'INACTIVE',
        icon: IconSquareX,
      },
    ],
  }

  return {
    description: statusTexts[safeStatus],
    options: availableOptions[safeStatus],
  }
}

export function ChangeStatusDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'BLOCKED',
      password: '',
    },
  })

  // Atualizar valores padrão quando rowData mudar
  useEffect(() => {
    if (open && rowData?.status) {
      const config = getStatusConfig(rowData.status)
      const defaultStatus = config.options[0]?.value as z.infer<
        typeof formSchema
      >['status']
      if (defaultStatus) {
        form.reset({
          status: defaultStatus,
          password: '',
        })
      }
    }
  }, [open, rowData, form])

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const res = await updateItemNew({
      route: `/subscriptions/active-clients/${rowData?.id}`,
      data,
    })

    if (!res?.success) {
      toast.error(
        res?.message ||
          'Senha gerencial incorreta ou sessão encerrada. Entre de novo e tente outra vez.',
      )
      return
    }

    queryClient.invalidateQueries()

    toast.success('Status alterado com sucesso')
    handleOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset()
    }
    setOpen(value)
  }

  const statusConfig = getStatusConfig(rowData?.status)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-col items-center gap-4 text-center">
              <FeaturedIcon
                variant="warningBorderedLight"
                Icon={IconAlertTriangle}
                size="lg"
                rounded
              />
              <span>Alterar status</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            {statusConfig.description}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="change-status"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <FormToggleCard
                name="status"
                options={statusConfig.options}
                groupClassName="grid grid-cols-2"
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha gerencial</FormLabel>
                    <Input
                      type="password"
                      placeholder="Digite aqui"
                      {...field}
                    />
                    <p className="text-sm text-gray-600">
                      Obrigatório para alterar
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
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
            Voltar
          </Button>
          <Button
            type="submit"
            form="change-status"
            disabled={form.formState.isSubmitting}
          >
            Alterar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
