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
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { FormInput } from '@/components/common/form/FormInput'

// Components
import { IconComponent } from '@/components/common/Icon'
import { InactiveUserAlertDialog } from '../InactiveUser'

// Form
import { useForm } from 'react-hook-form'
import { FormType, getSchema } from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Actions
import { createItemNew, updateItemNew } from '@/actions/_cruds'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import type { EmployeeType } from '@/types/settings/employee'

// Lib
import { cn, getFirstAndLastName } from '@/lib/utils'

// Icons
import {
  IconEye,
  IconEyeOff,
  IconUserPlus,
  IconUserEdit,
  IconCircleCheck,
  IconCircleCheckFilled,
} from '@tabler/icons-react'

interface Props extends SearchParamsType {
  editMode?: boolean
  open?: boolean
  setOpen?: (value: string) => void
  rowData?: EmployeeType
}

const initialPasswordValidations = {
  minLength: false,
  upperCase: false,
  lowerCase: false,
  number: false,
  special: false,
}

export function NewUserDialog({
  editMode,
  open,
  setOpen,
  rowData,
  searchParams,
}: Props) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordValidations, setPasswordValidations] = useState(
    initialPasswordValidations,
  )

  const userData = rowData?.user || {
    name: '',
    email: '',
  }

  const queryClient = useQueryClient()

  const form = useForm<FormType>({
    resolver: zodResolver(getSchema(!!editMode)),
    mode: 'onChange',
    values: {
      name: editMode ? userData.name : getFirstAndLastName(rowData?.name) || '',
      email: userData.email || '',
      password: '',
      confirmPassword: '',
    },
  })

  const { handleSubmit, setValue, watch } = form

  const mutation = useMutation({
    mutationFn: (data: Omit<FormType, 'confirmPassword' | 'password'>) =>
      editMode
        ? updateItemNew({
            route: `/user/${rowData?.user?.id}`,
            data,
          })
        : createItemNew({
            route: '/user/employee',
            data: { ...data, employeeId: rowData?.id },
          }),
    onSuccess: () => {
      queryClient.invalidateQueries()
      handleOpenChange(false)
      toast.success('Sucesso!')
    },
    onError: (error) => {
      console.error(error)
      toast.error('Ocorreu um erro')
    },
  })

  const handlePasswordChange = (value: string) => {
    setPasswordValidations({
      minLength: value.length >= 8,
      upperCase: /[A-Z]/.test(value),
      lowerCase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
    })
    setValue('password', value)
  }

  const onSubmit = async (data: FormType) => {
    const { confirmPassword: _, ...body } = data

    if (editMode && !body.password) {
      const { password: _, ...bodyWithoutPassword } = body
      await mutation.mutateAsync(bodyWithoutPassword)
    } else {
      await mutation.mutateAsync(body)
    }
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setPasswordValidations(initialPasswordValidations)
      setShowPassword(false)
      setShowConfirmPassword(false)
    }

    setOpen?.(value ? 'new-user' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon
                variant="neutralOutline"
                Icon={editMode ? IconUserEdit : IconUserPlus}
              />
              <span>{editMode ? 'Editar' : 'Novo'} usuário</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="new-user"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormInput<FormType> name="name" label="Usuário" width="w-full" />

              <FormInput<FormType> name="email" label="Email" width="w-full" />

              <div className="flex flex-wrap gap-5 w-full">
                <div className="flex-[1_0_200px] space-y-2">
                  <div className="relative">
                    {/*  TODO : zod error String must contain exactly 0 character(s) */}
                    <FormInput<FormType>
                      name="password"
                      label="Senha"
                      type={showPassword ? 'text' : 'password'}
                      additionalOnChange={(value) =>
                        handlePasswordChange(String(value))
                      }
                      className="pr-11"
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
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-1 text-gray">
                      <IconComponent
                        icon={IconCircleCheckFilled}
                        className={cn(
                          'size-3 ml-0.5',
                          passwordValidations.minLength
                            ? 'text-success'
                            : 'text-gray-400',
                        )}
                      />
                      Mínimo de 8 caracteres
                    </div>
                    <div className="flex items-center gap-1 text-gray">
                      <IconComponent
                        icon={IconCircleCheckFilled}
                        className={cn(
                          'size-3 ml-0.5',
                          passwordValidations.upperCase
                            ? 'text-success'
                            : 'text-gray-400',
                        )}
                      />
                      Mínimo de 1 letra maiúscula
                    </div>
                    <div className="flex items-center gap-1 text-gray">
                      <IconComponent
                        icon={IconCircleCheckFilled}
                        className={cn(
                          'size-3 ml-0.5',
                          passwordValidations.lowerCase
                            ? 'text-success'
                            : 'text-gray-400',
                        )}
                      />
                      Mínimo de 1 letra minúscula
                    </div>
                    <div className="flex items-center gap-1 text-gray">
                      <IconComponent
                        icon={IconCircleCheckFilled}
                        className={cn(
                          'size-3 ml-0.5',
                          passwordValidations.number
                            ? 'text-success'
                            : 'text-gray-400',
                        )}
                      />
                      Mínimo de 1 número
                    </div>
                    <div className="flex items-center gap-1 text-gray">
                      <IconComponent
                        icon={IconCircleCheckFilled}
                        className={cn(
                          'size-3 ml-0.5',
                          passwordValidations.special
                            ? 'text-success'
                            : 'text-gray-400',
                        )}
                      />
                      Mínimo de 1 caractere especial
                    </div>
                  </div>
                </div>
                <div className="flex-[1_0_200px] space-y-2">
                  <div className="relative">
                    <FormInput<FormType>
                      name="confirmPassword"
                      label="Repita a senha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="pr-12"
                    />
                    <Button
                      type="button"
                      variant="neutralGhost"
                      size="iconSm"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className="sm:justify-between">
          <div>
            {editMode && !rowData?.role?.isAdmin && (
              <InactiveUserAlertDialog
                rowData={rowData?.user}
                onChange={handleOpenChange}
                searchParams={searchParams}
              />
            )}
          </div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="new-user"
              isLoading={mutation.isPending}
              RightIcon={IconCircleCheck}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
