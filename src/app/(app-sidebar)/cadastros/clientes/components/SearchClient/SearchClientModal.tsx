import { getItem } from '@/actions/_cruds'
import { ActionButton } from '@/components/common/ActionButton'
import { CpfOrCnpjField } from '@/components/common/form/global-inputs/CpfOrCnpjField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconSearch } from '@tabler/icons-react'
import { TextSearchIcon } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { ClientDetailsModal, type ClientData } from './ClientDetailsModal'

const searchClientSchema = z.object({
  cpfOrCnpj: z
    .string()
    .min(13, { message: 'CPF ou CNPJ é obrigatório' })
    .max(14, { message: 'CPF ou CNPJ é obrigatório' }),
})

type SearchClientFormType = z.infer<typeof searchClientSchema>

export function SearchClientTriggerButton({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  return (
    <ActionButton
      tooltip="Consultar dados de cliente"
      size="iconMd"
      variant="neutralOutline"
      Icon={TextSearchIcon}
      className="bg-transparent"
      onClick={() => onOpenChange(true)}
    />
  )
}

export function SearchClientModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [showClientDetails, setShowClientDetails] = useState(false)
  const [clientData, setClientData] = useState<ClientData | null>(null)

  const form = useForm<SearchClientFormType>({
    resolver: zodResolver(searchClientSchema),
  })

  const {
    formState: { isSubmitting, errors },
  } = form

  const handleSubmit = async (data: SearchClientFormType) => {
    if (Object.keys(errors).length > 0) return

    const isCNPJ = data.cpfOrCnpj.length === 14
    const route = isCNPJ
      ? `/utils/company/${data.cpfOrCnpj}`
      : `/utils/people/${data.cpfOrCnpj}`

    const res = await getItem({
      route,
    })

    if (!res.success) {
      toast.error(res.message)
      return
    }

    if (!res.data) {
      toast.error('Nenhum dado recebido')
      return
    }

    const fetchedClientData = {
      cnpj: res.data.cnpj || data.cpfOrCnpj,
      razaoSocial: res.data.razaoSocial || res.data.razao_social || '',
      nomeFantasia: res.data.nomeFantasia || res.data.nome_fantasia || '',
      telefone: res.data.telefone || '',
      email: res.data.email || '',
      cep: res.data.cep || '',
      estado: res.data.estado || '',
      cidade: res.data.cidade || '',
      bairro: res.data.bairro || '',
      rua: res.data.rua || '',
      numero: res.data.numero || '',
    }

    setClientData(fetchedClientData)
    setShowClientDetails(true)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader className="border-none">
            <div className="flex flex-col items-center gap-4">
              <FeaturedIcon
                variant="successBorderedLight"
                className="w-12 h-12"
                rounded
                Icon={TextSearchIcon}
              />

              <DialogTitle>Consultar dados de cliente</DialogTitle>
              <DialogDescription className="text-center">
                Informe o CNPJ ou CPF
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogBody className="mt-0 pt-0">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <CpfOrCnpjField name="cpfOrCnpj" placeholder="Digite aqui" />
              </form>
            </FormProvider>
          </DialogBody>
          <DialogFooter className="flex sm:justify-end pt-0 border-none">
            <div className="space-x-4">
              <DialogClose asChild>
                <Button type="button" variant="neutralOutline">
                  Fechar
                </Button>
              </DialogClose>

              <Button
                type="submit"
                form="new-client-form-abc"
                disabled={isSubmitting}
                onClick={() => {
                  form.handleSubmit(handleSubmit)()
                }}
                RightIcon={IconSearch}
                isLoading={isSubmitting}
              >
                Consultar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {clientData && (
        <ClientDetailsModal
          open={showClientDetails}
          onOpenChange={setShowClientDetails}
          clientData={clientData}
        />
      )}
    </>
  )
}
