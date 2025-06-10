'use client'

// Components
import { IconComponent } from '@/components/common/Icon'

// Icons
import { IconCircleCheckFilled } from '@tabler/icons-react'

// Lib
import { cn } from '@/lib/utils'

export function PasswordValidation({ password }: { password: string }) {
  const validations = {
    minLength: password.length >= 8,
    upperCase: /[A-Z]/.test(password),
    lowerCase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  return (
    <div className="space-y-1 text-sm">
      <div className="flex items-center gap-1 text-gray">
        <IconComponent
          icon={IconCircleCheckFilled}
          className={cn(
            'size-3 ml-0.5',
            validations.minLength ? 'text-success' : 'text-gray-400',
          )}
        />
        Mínimo de 8 caracteres
      </div>
      <div className="flex items-center gap-1 text-gray">
        <IconComponent
          icon={IconCircleCheckFilled}
          className={cn(
            'size-3 ml-0.5',
            validations.upperCase ? 'text-success' : 'text-gray-400',
          )}
        />
        Mínimo de 1 letra maiúscula
      </div>
      <div className="flex items-center gap-1 text-gray">
        <IconComponent
          icon={IconCircleCheckFilled}
          className={cn(
            'size-3 ml-0.5',
            validations.lowerCase ? 'text-success' : 'text-gray-400',
          )}
        />
        Mínimo de 1 letra minúscula
      </div>
      <div className="flex items-center gap-1 text-gray">
        <IconComponent
          icon={IconCircleCheckFilled}
          className={cn(
            'size-3 ml-0.5',
            validations.number ? 'text-success' : 'text-gray-400',
          )}
        />
        Mínimo de 1 número
      </div>
      <div className="flex items-center gap-1 text-gray">
        <IconComponent
          icon={IconCircleCheckFilled}
          className={cn(
            'size-3 ml-0.5',
            validations.special ? 'text-success' : 'text-gray-400',
          )}
        />
        Mínimo de 1 caractere especial
      </div>
    </div>
  )
}
