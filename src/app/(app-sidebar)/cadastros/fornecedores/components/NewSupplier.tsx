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
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icon Imports
import {
  IconCirclePlus,
  IconBuildingCommunity,
  IconPencil,
} from '@tabler/icons-react'

// Third-party Imports
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { NewSupplierForm } from './NewSuppiler/NewSuppilerForm'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import {
  NewSupplierFormType,
  defaultPersonValues,
  newSupplierSchema,
} from './NewSuppiler/schema'
import { createItem, getItemOld, updateItem } from '@/actions/_cruds'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Props {
  editMode?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId?: string
}

async function handleGetSupplier(supplierId: string) {
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
    queryFn: () => handleGetSupplier(supplierId ?? ''),
  })

  const transformSupplierData = (apiData: any): NewSupplierFormType => {
    if (!apiData) return defaultPersonValues

    return {
      type: apiData.type || 'PERSON',
      general: {
        name: apiData.general?.name || '',
        email: apiData.general?.email || '',
        cpf: apiData.general?.cpf || '',
        rg: apiData.general?.rg || '',
        cnpj: apiData.general?.cnpj || '',
        activity: apiData.general?.activity || '',
        category: apiData.general?.category || '',
        phone: apiData.general?.phone || '',
        mobile: apiData.general?.mobile || '',
        notes: apiData.general?.notes || '',
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
    // mode: 'all',
  })

  useEffect(() => {
    if (supplier) {
      const transformedData = transformSupplierData(supplier)
      form.reset(transformedData) // Atualizando o formulário com os dados transformados
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplier])

  if (editMode && isLoading) return <></>

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: NewSupplierFormType) => {
    const formData = {
      ...data,
      contacts: data.responsibilities,
      responsibilities: undefined,
    }
    delete formData.responsibilities

    try {
      if (isSubmitting) return

      if (editMode) {
        await updateItem('supplierRoute', supplierId ?? '', formData)
          .then(() => {
            queryClient.invalidateQueries()
          })
          .catch((error) => {
            console.error(error)
            return error
          })
      } else {
        await createItem({
          route: 'supplierRoute',
          data: formData,
        })
          .then(() => {
            queryClient.invalidateQueries()
          })
          .catch((error) => {
            console.error(error)
            return error
          })
      }

      toast.success(
        editMode
          ? 'Fornecedor atualizado com sucesso!'
          : 'Fornecedor cadastrado com sucesso!',
      )

      handleCleanForm()
      handleToggleModal()
    } catch (error) {
      console.error('Submission Error:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : `Erro ao ${editMode ? 'atualizar' : 'cadastrar'} Fornecedor`,
      )
    }
  }

  function handleCleanForm() {
    reset(defaultPersonValues)
  }

  function handleToggleModal() {
    handleCleanForm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleToggleModal}>
      <DialogContent className="sm:max-w-[855px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon
                variant="neutralOutline"
                Icon={IconBuildingCommunity}
              />
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
            <Button type="submit" form="new-supplier">
              {editMode ? 'Salvar alterações' : 'Criar fornecedor'}
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
      LeftIcon={editMode ? IconPencil : IconCirclePlus}
      onClick={() => onOpenChange(true)}
    >
      {editMode ? '' : 'Novo Fornecedor'}
    </Button>
  )
}
