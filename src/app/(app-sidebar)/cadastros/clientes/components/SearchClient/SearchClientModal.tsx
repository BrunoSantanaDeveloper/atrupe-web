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
import { useDocumentSearch } from '@/hooks/useDocumentSearch'
import {
  ClientDetailsModalWithNewClient,
  type ClientData,
} from './ClientDetailsModal'

const searchClientSchema = z.object({
  cpfOrCnpj: z.string(),
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
  const { searchByDocument } = useDocumentSearch()

  const form = useForm<SearchClientFormType>({
    resolver: zodResolver(searchClientSchema),
  })

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form

  const onSubmit = async (data: SearchClientFormType) => {
    if (Object.keys(errors).length > 0) return

    const searchData = await searchByDocument(data.cpfOrCnpj)

    if (!searchData) {
      return
    }

    setClientData(searchData as ClientData)
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
                size="lg"
                rounded
                Icon={TextSearchIcon}
              />

              <DialogTitle className="pr-0">
                Consultar dados de cliente
              </DialogTitle>
              <DialogDescription className="text-center">
                Informe o CNPJ ou CPF
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogBody className="mt-0 pt-0">
            <FormProvider {...form}>
              <form onSubmit={handleSubmit(onSubmit)} id="document-check">
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
                form="document-check"
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
        <ClientDetailsModalWithNewClient
          open={showClientDetails}
          onOpenChange={setShowClientDetails}
          clientData={clientData}
        />
      )}
    </>
  )
}
