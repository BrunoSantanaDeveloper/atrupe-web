/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

// UI component Imports
import { Form } from '@/components/ui/form'
import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogContent,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Icon Imports
import { IconPlus, IconPencil } from '@tabler/icons-react'

// Third-party Imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NewSupplierForm } from './NewSuppiler/NewSuppilerForm'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  NewSupplierFormType,
  defaultPersonValues,
  emptyPayment,
  newSupplierSchema,
} from './NewSuppiler/schema'
import { getItemOld, createItemNew, updateItemNew } from '@/actions/_cruds'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { maskCpf, maskCnpj } from '@/lib/utils'

interface Props {
  editMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId?: string
}

async function fetchSupplier(supplierId: string) {
  if (!supplierId) return
  const supplier = await getItemOld({ route: 'supplierRoute', id: supplierId })
  return supplier
}

export function NewSupplier({
  editMode,
  supplierId,
  open,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('general')

  const { data: supplier, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['supplier', supplierId],
    queryFn: () => fetchSupplier(supplierId ?? ''),
  })

  const transformSupplierData = (apiData: any): NewSupplierFormType => {
    if (!apiData) return defaultPersonValues

    return {
      type: apiData.type || 'PERSON',
      general: {
        name: apiData.general?.name || '',
        email: apiData.general?.email || '',
        cpf: apiData.general?.cpf ? maskCpf(apiData.general.cpf) : '',
        rg: apiData.general?.rg || '',
        cnpj: apiData.general?.cnpj ? maskCnpj(apiData.general.cnpj) : '',
        activity: apiData.general?.activity || '',
        categoryId: apiData.general?.category?.id || '',
        phone: apiData.general?.phone || '',
        mobile: apiData.general?.mobile || '',
        notes: apiData.general?.notes || '',
        isBranch: apiData.general?.isBranch || false,
      },
      payment: {
        ...emptyPayment,
        pixKey: apiData.payment?.pixKey || '',
        bankName: apiData.payment?.bankName || '',
        bankAgency: apiData.payment?.bankAgency || '',
        bankAccount: apiData.payment?.bankAccount || '',
        accountHolder: apiData.payment?.accountHolder || '',
        paymentTerms: apiData.payment?.paymentTerms || '',
      },
      addresses: apiData.addresses?.length
        ? apiData.addresses.map((address: any) => ({
            type: address.type || 'Principal',
            zipcode: address.zipcode || '',
            state: address.state || '',
            city: address.city || '',
            neighborhood: address.neighborhood || '',
            street: address.street || '',
            number: address.number || '',
            complement: address.complement || '',
          }))
        : [
            {
              type: 'Principal',
              zipcode: '',
              state: '',
              city: '',
              neighborhood: '',
              street: '',
              number: '',
              complement: '',
            },
          ],
      responsibilities: apiData.contacts?.length
        ? apiData.contacts.map((contact: any) => ({
            name: contact.name || '',
            email: contact.email || '',
            phone: contact.phone || '',
            mobile: contact.mobile || '',
            notes: contact.notes || '',
          }))
        : [
            {
              name: '',
              email: '',
              phone: '',
              mobile: '',
              notes: '',
            },
          ],
    }
  }

  const form = useForm<NewSupplierFormType>({
    resolver: zodResolver(newSupplierSchema),
    defaultValues: defaultPersonValues,
  })

  useEffect(() => {
    if (supplier && open) {
      const transformedData = transformSupplierData(supplier)
      form.reset(transformedData) // Atualizando o formulário com os dados transformados
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier, open])

  if (editMode && isLoading) return <></>

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = form

  const onSubmit = async (data: NewSupplierFormType) => {
    if (isSubmitting) return

    const formData = {
      ...data,
      contacts: data.responsibilities,
      responsibilities: undefined,
    }
    delete formData.responsibilities

    if (editMode) {
      const res = await updateItemNew({
        route: `/supplier/${supplierId}`,
        data: formData,
      })

      if (!res.success) {
        toast.error(res.message || 'Erro ao editar fornecedor')
        return
      }

      toast.success('Fornecedor atualizado')
      queryClient.invalidateQueries()
    } else {
      const res = await createItemNew({
        route: '/supplier',
        data: formData,
      })

      if (!res.success) {
        toast.error(res.message || 'Erro ao criar fornecedor')
        return
      }

      toast.success('Fornecedor criado')
      queryClient.invalidateQueries()
    }

    onOpenChange(false)
    reset(defaultPersonValues)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[855px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <span>{editMode ? 'Editar' : 'Novo'} fornecedor</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody className="h-[calc(100vh-200px)]">
          <Form {...form}>
            <form
              id="new-supplier"
              onSubmit={handleSubmit(onSubmit)}
              // className="flex flex-wrap gap-5"
              className="space-y-6"
              noValidate
            >
              <NewSupplierForm
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </form>
          </Form>
        </DialogBody>
        {/* <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">

        </div> */}
        <DialogFooter>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button type="submit" form="new-supplier" isLoading={isSubmitting}>
              {editMode ? 'Salvar' : 'Cadastrar fornecedor'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function NewSupplierTriggerButton({
  editMode,
  onOpenChange,
}: {
  editMode?: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Button
      type="button"
      size={editMode ? 'icon' : 'default'}
      variant={editMode ? 'neutralGhost' : 'default'}
      LeftIcon={editMode ? IconPencil : IconPlus}
      onClick={() => onOpenChange(true)}
    >
      {editMode ? '' : 'Novo fornecedor'}
    </Button>
  )
}
