import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { DialogFooter } from '@/components/ui/dialog'

import { IconUser, IconBuildingCommunity } from '@tabler/icons-react'
import { useNewClientStore } from '../../store/useNewClientStore'
import { newClientSchema, NewClientFormType, defaultValues } from './schema'
import { PersonFields } from './PersonFields'
import { CompanyFields } from './CompanyFields'
import { createItemNew } from '@/actions/_cruds'
import { toast } from 'sonner'
import { FormToggleCard } from '@/components/common/form/FormToggleCard'

const personTypeOptions = [
  {
    label: 'Pessoa Física',
    value: 'PERSON',
    icon: IconUser,
  },
  {
    label: 'Pessoa Jurídica',
    value: 'COMPANY',
    icon: IconBuildingCommunity,
  },
]

export function NewClientForm() {
  const { onToggleModalVisibility, onClientCreated } = useNewClientStore()

  const form = useForm<NewClientFormType>({
    resolver: zodResolver(newClientSchema),
    defaultValues,
  })

  const { handleSubmit, watch, reset } = form

  const handleToggleModal = () => {
    handleCleanForm()
    onToggleModalVisibility()
  }

  const handleCleanForm = () => {
    reset(defaultValues)
  }

  const clientType = watch('type')

  const onSubmit = async (data: NewClientFormType) => {
    const payload = {
      type: data.type,
      name: data.name,
      email: data.email,
      categoryId: data.category,
      phone: data.phone,
      mobile: data.mobile,
      rg: '',
      cpf: '',
      cnpj: '',
      activity: '',
      corporateName: '',
      birthdate: '',
    }

    if (data.type === 'PERSON') {
      payload.rg = data.rg || ''
      payload.cpf = data.cpf || ''
      payload.birthdate = data.birthdate || ''
    } else {
      payload.cnpj = data.cnpj || ''
      payload.activity = data.activity || ''
      payload.corporateName = data.corporateName || ''
    }

    const res = await createItemNew({
      route: '/client/pre-register',
      data: payload,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    const newClient = {
      value: res.data.id,
      label: res.data.name,
    }

    onClientCreated?.(newClient)

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
            noValidate
          >
            <FormToggleCard name="type" options={personTypeOptions} />
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
            // disabled={Object.keys(form.formState.errors).length > 0}
            // disabled={!form.formState.isValid}
          >
            Cadastrar cliente
          </Button>
        </div>
      </DialogFooter>
    </>
  )
}
