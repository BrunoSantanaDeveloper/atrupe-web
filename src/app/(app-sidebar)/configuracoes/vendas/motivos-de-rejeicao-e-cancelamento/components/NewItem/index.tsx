'use client'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { PermissionGate } from '@/components/common/PermissionGate'

// Components
import { FormInput } from '@/components/common/form/FormInput'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { defaultValues, schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type {
  CancelReasonType,
  ListCancelReasonType,
} from '@/types/settings/cancelReason'
import type { SearchParamsType } from '@/types/coreTypes'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'

// Hooks
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

interface Props extends SearchParamsType {
  type: ListCancelReasonType['type']
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: CancelReasonType
}

export function NewItemDialog({
  type,
  open,
  rowData,
  setOpen,
  editMode,
}: Props) {
  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues,
    values: editMode
      ? {
          reason: rowData?.reason || '',
        }
      : undefined,
  })

  const { handleSubmit, reset } = form

  const mutation = useMutation({
    mutationFn: (data: FormType) =>
      editMode
        ? updateItemNew({ route: `/cancel-reason/${rowData?.id}`, data })
        : createItemNew({ route: '/cancel-reason', data }),
    onSuccess: (res) => {
      if (res.success) queryClient.invalidateQueries()
    },
  })

  const onSubmit = async (data: FormType) => {
    if (editMode && !rowData) return

    const body = editMode
      ? data
      : {
          ...data,
          type,
        }

    const res = await mutation.mutateAsync(body).catch(() => null)

    if (!res?.success) {
      // Os motivos são recurso de plano: o servidor recusa sem ele.
      notifyActionError(res)
      return
    }

    toast.success('Sucesso!')
    handleOpenChange(false)
  }

  const handleOpenChange = (openDialog: boolean) => {
    setOpen?.(openDialog ? 'edit' : '')
    reset(defaultValues)
  }

  return (
    <PermissionGate
      permissions={[
        'sales_settings:rejection_reasons:view',
        editMode
          ? 'sales_settings:rejection_reasons:edit'
          : 'sales_settings:rejection_reasons:create',
      ]}
      requireAll={true}
    >
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-4">
                {editMode ? 'Editar' : 'Novo'} motivo de
                {type === 'REJECTION' ? ' rejeição' : ' cancelamento'}
              </div>
            </DialogTitle>
            <DialogDescription hidden></DialogDescription>
          </DialogHeader>
          <DialogBody>
            <Form {...form}>
              <form
                id="submit-form"
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-wrap gap-5"
                noValidate
              >
                <FormInput<FormType>
                  name="reason"
                  label="Motivo"
                  width="w-full"
                />
              </form>
            </Form>
          </DialogBody>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="submit-form"
              isLoading={form.formState.isSubmitting}
              RightIcon={IconCircleCheck}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  )
}
