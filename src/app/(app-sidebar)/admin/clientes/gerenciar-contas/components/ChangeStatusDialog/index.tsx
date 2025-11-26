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
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Third-party
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { updateItem } from '@/actions/_cruds'

// Types
import type { AccountItem } from '../Table/Data'

// Icons
import { IconAlertTriangle, IconLock, IconPlayerPause } from '@tabler/icons-react'

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  rowData: AccountItem | null
}

type StatusOption = 'BLOCKED' | 'INACTIVE'

export function ChangeStatusDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState<StatusOption>('BLOCKED')
  const [password, setPassword] = useState('')

  const mutation = useMutation({
    mutationFn: (data: { status: StatusOption; password: string }) =>
      updateItem('/subscriptions/active-clients/status', `${rowData?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['active-clients-list'],
      })
      queryClient.invalidateQueries({
        queryKey: ['active-clients-totals'],
      })
      toast.success('Status alterado com sucesso')
      handleOpenChange(false)
    },
    onError: (error) => {
      console.error(error)
      toast.error('Ocorreu um erro ao alterar o status')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password) {
      toast.error('Senha gerencial é obrigatória')
      return
    }

    await mutation.mutateAsync({ status: selectedStatus, password })
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setPassword('')
      setSelectedStatus('BLOCKED')
    }
    setOpen(value)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex flex-col items-center gap-4 text-center">
              <FeaturedIcon
                variant="warningModern"
                Icon={IconAlertTriangle}
                size="lg"
              />
              <span>Alterar status</span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            Conta ativa, o que deseja fazer?
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form id="change-status" onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedStatus('BLOCKED')}
                className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === 'BLOCKED'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedStatus === 'BLOCKED'
                      ? 'bg-primary-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <IconLock
                    size={20}
                    className={
                      selectedStatus === 'BLOCKED'
                        ? 'text-primary-600'
                        : 'text-gray-600'
                    }
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">Bloquear</p>
                  {selectedStatus === 'BLOCKED' && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center ml-auto">
                      <svg
                        width="12"
                        height="9"
                        viewBox="0 0 12 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 4.5L4.5 8L11 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStatus('INACTIVE')}
                className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  selectedStatus === 'INACTIVE'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedStatus === 'INACTIVE'
                      ? 'bg-primary-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <IconPlayerPause
                    size={20}
                    className={
                      selectedStatus === 'INACTIVE'
                        ? 'text-primary-600'
                        : 'text-gray-600'
                    }
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">Inativar</p>
                  {selectedStatus === 'INACTIVE' && (
                    <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center ml-auto">
                      <svg
                        width="12"
                        height="9"
                        viewBox="0 0 12 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 4.5L4.5 8L11 1"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Senha gerencial
              </label>
              <input
                id="password"
                type="password"
                placeholder="Digite aqui"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-sm text-gray-600">
                Obrigatório para alterar
              </p>
            </div>
          </form>
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
            disabled={mutation.isPending}
          >
            Alterar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
