'use client'

// React
import { useState } from 'react'

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
import { Checkbox } from '@/components/ui/checkbox'

// Components
import { FormInput } from '@/components/common/form/FormInput'

// Third-party
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'

// Actions
import { deleteWithBody } from '@/actions/_cruds'

// Types
import type { TrialAccountItem } from '../Table/Data'

// Icons

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: TrialAccountItem | null
}

const formSchema = z.object({
  password: z.string().min(1, 'Senha gerencial é obrigatória'),
})

export function DeleteAccountDialog({ open, setOpen, rowData }: Props) {
  const [confirmed, setConfirmed] = useState(false)
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  })

  const { handleSubmit, reset } = form

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const companyId = rowData?.company?.id

    if (!companyId) {
      toast.error('ID da empresa não encontrado')
      return
    }

    const res = await deleteWithBody({
      route: `/subscriptions/${companyId}/delete-account`,
      data: { password: data.password },
    })

    if (!res.success) {
      // form.setError('password', { message: res.message })
      setConfirmed(false)
      toast.error(res.message)
      return
    }

    queryClient.invalidateQueries()
    toast.success(`Conta ${companyName} excluída permanentemente com sucesso`)
    handleOpenChange(false)
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset()
      setConfirmed(false)
    }
    setOpen(value)
  }

  const companyName = rowData?.company?.name || 'esta conta'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px] border-4 border-error">
        <DialogHeader>
          <DialogTitle className="pr-0">
            <div className="flex flex-col items-center gap-4 text-center">
              <span>Excluir conta permanentemente</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            Tem certeza que deseja excluir <strong>{companyName}</strong>?
            <br />
            <br />
            <span className="text-error font-medium">
              Esta ação é irreversível.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="bg-error-25 text-error border border-error-100 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium mb-2">
              Serão excluídos permanentemente:
            </p>
            <ul className="text-sm space-y-1">
              <li>• Clientes, fornecedores e produtos</li>
              <li>• Orçamentos, pedidos e financeiro</li>
              <li>• Usuários e funcionários</li>
              <li>• Históricos e configurações</li>
            </ul>
          </div>

          <Form {...form}>
            <form id="delete-account" onSubmit={handleSubmit(onSubmit)}>
              <FormInput
                name="password"
                label="Senha gerencial"
                type="password"
                placeholder="Digite sua senha para confirmar"
                width="w-full"
              />
              <p className="text-sm text-gray-600">
                Digite sua senha de administrador para confirmar a exclusão
              </p>
            </form>
          </Form>

          <div className="flex items-start gap-2 mt-4">
            <Checkbox
              id="confirm-delete"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
            />
            <label
              htmlFor="confirm-delete"
              className="text-sm text-gray-700 cursor-pointer select-none"
            >
              Confirmo que desejo excluir permanentemente esta conta e todos os
              dados relacionados a ela.
            </label>
          </div>
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
            form="delete-account"
            variant="error"
            isLoading={form.formState.isSubmitting}
            disabled={!confirmed}
          >
            Excluir permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
