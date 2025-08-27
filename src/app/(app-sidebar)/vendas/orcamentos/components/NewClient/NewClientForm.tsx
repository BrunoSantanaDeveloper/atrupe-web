import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { DialogFooter } from '@/components/ui/dialog'

import { IconUser, IconBuildingCommunity } from '@tabler/icons-react'
import { useNewClientStore } from '../../store/useNewClientStore'
import {
  defaultCompanyValues,
  defaultPersonValues,
  NewClientFormType,
  newClientSchema,
} from './schema'
import { PersonFields } from './PersonFields'
import { CompanyFields } from './CompanyFields'
import { ClientTypeToggleButton } from './ClientTypeToggleButton'
import { createItemNew } from '@/actions/_cruds'
import { toast } from 'sonner'

type ClientType = 'PERSON' | 'COMPANY'

const NewClientForm = () => {
  const { onToggleModalVisibility } = useNewClientStore()

  const form = useForm<NewClientFormType>({
    resolver: zodResolver(newClientSchema),
    defaultValues: defaultPersonValues,
  })

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form

  const handleToggleModal = () => {
    handleCleanForm()
    onToggleModalVisibility()
  }

  const handleCleanForm = () => {
    reset(defaultPersonValues)
  }

  const clientType = watch('type')

  const handleUpdateClient = (type: ClientType) => {
    setValue('type', type)
    reset(type === 'PERSON' ? defaultPersonValues : defaultCompanyValues)
  }

  const onSubmit = async (data: NewClientFormType) => {
    const res = await createItemNew({
      route: '/client/pre-register',
      data,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success('Cliente cadastrado com sucesso!')
    handleCleanForm()
    handleToggleModal()
  }

  return (
    <>
      <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        <FormProvider {...form}>
          <form
            id="new-client"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-wrap gap-5"
            // noValidate
          >
            <div className="w-full h-16 flex gap-4">
              <ClientTypeToggleButton
                key="person"
                title="Pessoa Física"
                onClick={() => handleUpdateClient('PERSON')}
                isActive={clientType === 'PERSON'}
                Icon={IconUser}
              />
              <ClientTypeToggleButton
                key="company"
                title="Pessoa Jurídica"
                onClick={() => handleUpdateClient('COMPANY')}
                isActive={clientType === 'COMPANY'}
                Icon={IconBuildingCommunity}
              />
            </div>
            {clientType === 'PERSON' ? <PersonFields /> : <CompanyFields />}
          </form>
        </FormProvider>
      </div>
      <DialogFooter className="justify-end">
        <div className="space-x-4">
          <Button
            type="button"
            variant="neutralOutline"
            onClick={handleToggleModal}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="gap-2"
            form="new-client"
            RightIcon={ArrowRight}
            disabled={Object.keys(errors).length > 0}
            // disabled={!form.formState.isValid}
          >
            Cadastrar cliente
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}
export default NewClientForm
