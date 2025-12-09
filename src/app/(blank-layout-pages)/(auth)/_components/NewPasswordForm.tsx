'use client'

// React
import { useState } from 'react'

// UI
import { Button } from '@/components/ui/button'

// Components
import { IconComponent } from '@/components/common/Icon'
import { FormInput } from '@/components/common/form/FormInput'
import { PasswordValidation } from '@/components/common/form/PasswordValidation'

// Third-party
import { useFormContext } from 'react-hook-form'

// Types
import { type NewPasswordType } from './schema'

// Icons
import {
  IconEye,
  IconEyeOff,
  IconArrowNarrowRight,
  IconCircleCheckFilled,
} from '@tabler/icons-react'

// Lib
import { cn } from '@/lib/utils'

interface Props {
  onSubmit: (data: NewPasswordType) => void
}

export function NewPasswordForm({ onSubmit }: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useFormContext<NewPasswordType>()

  const {
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <div className="flex flex-wrap gap-5 w-full">
        <div className="flex-[1_0_200px] space-y-2">
          <div className="relative">
            <FormInput
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              className="pr-11"
              autoFocus
            />
            <Button
              type="button"
              variant="neutralGhost"
              size="iconSm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-7"
              RightIcon={showPassword ? IconEyeOff : IconEye}
              tabIndex={-1}
            />
          </div>
          <PasswordValidation password={watch('password')} />
        </div>
        <div className="flex-[1_0_200px] space-y-2">
          <div className="relative">
            <FormInput
              name="confirmPassword"
              label="Repita a senha"
              type={showConfirmPassword ? 'text' : 'password'}
              className="pr-12"
            />
            <Button
              type="button"
              variant="neutralGhost"
              size="iconSm"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-7"
              RightIcon={showConfirmPassword ? IconEyeOff : IconEye}
              tabIndex={-1}
            />
          </div>
          <div className="flex items-center gap-1 text-gray text-sm">
            <IconComponent
              icon={IconCircleCheckFilled}
              className={cn(
                'size-3 ml-0.5',
                watch('password') === watch('confirmPassword') &&
                  watch('password') !== ''
                  ? 'text-success'
                  : 'text-gray-400',
              )}
            />
            Senha confirmada
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          type="submit"
          className="[&>svg]:ml-0"
          RightIcon={IconArrowNarrowRight}
          isLoading={isSubmitting}
          disabled={isSubmitting || !form.formState.isValid}
        >
          Finalizar
        </Button>
      </div>
    </form>
  )
}
