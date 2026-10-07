import { create } from 'zustand'
import { IconAlertTriangle, IconProps } from '@tabler/icons-react'
import { ButtonProps } from '@/components/ui/button'
import { FeaturedIconProps } from '@/components/ui/featured-icon'
import { toast } from 'sonner'

const DEFAULT_TIMEOUT = 30000

const DEFAULT_MESSAGES = {
  loading: 'Aguarde...',
  success: 'Sucesso!',
  error: 'Ocorreu um erro',
} as const

type LoadingConfig = {
  loading?: string
  success?: string
  error?: string
}

type BaseAlertDialog = {
  isOpen: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  Icon?: React.ComponentType<IconProps>
  iconVariant?: FeaturedIconProps['variant']
  confirmVariant?: ButtonProps['variant']
  toastMsg?: LoadingConfig
  timeout?: number
}

// Função auxiliar para criar Promise com timeout
const createTimeoutPromise = (timeout: number) =>
  new Promise((_resolve, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), timeout),
  )

type AlertDialogStore = BaseAlertDialog & {
  // `onConfirm` em andamento: o diálogo fica aberto com o botão em progresso
  isConfirming: boolean
  open: (props: Omit<BaseAlertDialog, 'isOpen'>) => Promise<boolean>
  close: () => void
  confirm: () => Promise<boolean>
}

export const useAlertDialog = create<AlertDialogStore>((set, get) => ({
  isOpen: false,
  isConfirming: false,
  title: 'Confirmar ação',
  description: '',
  confirmLabel: '',
  cancelLabel: 'Voltar',
  onConfirm: undefined,
  onCancel: undefined,
  Icon: IconAlertTriangle,
  iconVariant: 'warningBorderedLight',
  confirmVariant: 'default',
  toastMsg: DEFAULT_MESSAGES,
  timeout: DEFAULT_TIMEOUT,
  open: (props) => {
    // Um diálogo aberto de dentro de outra confirmação começa parado
    set({ isOpen: true, isConfirming: false, ...props })
    return get().confirm()
  },
  close: () => set({ isOpen: false }),
  confirm: () => {
    return new Promise((resolve, reject) => {
      const { onConfirm, toastMsg, timeout = DEFAULT_TIMEOUT } = get()

      const timeoutId = setTimeout(() => {
        set({ isOpen: false, isConfirming: false })
        reject(new Error('Dialog confirmation timed out'))
      }, timeout)

      const cleanup = () => {
        clearTimeout(timeoutId)
        set({ isOpen: false, isConfirming: false })
      }

      const handleConfirm = async () => {
        if (!onConfirm) {
          cleanup()
          resolve(true)
          return
        }

        // O diálogo fica aberto com o botão em progresso até a ação terminar
        // (design/openspec/changes/archive/2026-10-07-microinteracoes, Decisão 4). `toast.promise`
        // devolve o id do aviso, não a promessa: a ação é aguardada à parte
        set({ isConfirming: true })
        try {
          const task = Promise.race([
            onConfirm(),
            createTimeoutPromise(timeout),
          ])
          if (toastMsg) {
            toast.promise(task, {
              loading: toastMsg.loading ?? DEFAULT_MESSAGES.loading,
              success: toastMsg.success ?? DEFAULT_MESSAGES.success,
              error: (error: Error) =>
                error.message || toastMsg.error || DEFAULT_MESSAGES.error,
            })
          }
          await task
          cleanup()
          resolve(true)
        } catch (error) {
          cleanup()
          resolve(false)
        }
      }

      set({
        isOpen: true,
        onConfirm: handleConfirm,
        onCancel: () => {
          cleanup()
          resolve(false)
        },
      })
    })
  },
}))
