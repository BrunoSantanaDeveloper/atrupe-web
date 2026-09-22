import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos
import { SignupType } from '@/app/(blank-layout-pages)/(auth)/cadastro/inicio/components/schema'
import { VerifyEmailType } from '@/app/(blank-layout-pages)/(auth)/cadastro/verificar-email/components/schema'
import { NewPasswordType } from '@/app/(blank-layout-pages)/(auth)/cadastro/nova-senha/components/schema'

// Interface do estado
interface SignupState {
  // Dados do formulário de cadastro
  signupData: Partial<SignupType> | null
  // Dados da verificação de email
  verifyEmailData: Partial<VerifyEmailType> | null
  // Dados da nova senha
  newPasswordData: Partial<NewPasswordType> | null
  // Token de verificação
  verificationToken: string | null
  // Countdown para reenvio de código
  countdown: number
  // Endereço que a pessoa pediu antes de criar a conta
  redirectTo: string | null
  setRedirectTo: (path: string | null) => void
  // Ações
  setSignupData: (data: Partial<SignupType>) => void
  setVerifyEmailData: (data: Partial<VerifyEmailType>) => void
  setNewPasswordData: (data: Partial<NewPasswordType>) => void
  setVerificationToken: (token: string) => void
  setCountdown: (seconds: number) => void
  decrementCountdown: () => void
  // Limpar todos os dados
  clearSignupData: () => void
}

// Criar o store
export const useSignupStore = create<SignupState>()(
  persist(
    (set) => ({
      // Estado inicial
      signupData: null,
      verifyEmailData: null,
      newPasswordData: null,
      verificationToken: null,
      countdown: 3,
      redirectTo: null,

      // Ações
      setRedirectTo: (path) => set({ redirectTo: path }),
      setSignupData: (data) => set({ signupData: data }),
      setVerifyEmailData: (data) => set({ verifyEmailData: data }),
      setNewPasswordData: (data) => set({ newPasswordData: data }),
      setVerificationToken: (token) => set({ verificationToken: token }),
      setCountdown: (seconds) => set({ countdown: seconds }),
      decrementCountdown: () =>
        set((state) => ({ countdown: Math.max(0, state.countdown - 1) })),
      clearSignupData: () =>
        set({
          signupData: null,
          verifyEmailData: null,
          newPasswordData: null,
          verificationToken: null,
          countdown: 0,
          redirectTo: null,
        }),
    }),
    {
      name: 'signup-storage',
    },
  ),
)
