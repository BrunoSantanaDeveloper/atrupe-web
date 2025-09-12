import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { TextSearchIcon } from 'lucide-react'
import { TextSupportingText } from '@/components/common/TextSupportingText'
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'
import { IconArrowRight } from '@tabler/icons-react'

export interface ClientData {
  document: string
  documentType: 'CPF' | 'CNPJ'
  name: string
  legalName?: string
  phone?: string
  birthdate?: string
  motherName?: string
  address: {
    street: string
    city: string
    state: string
    zipcode: string
    country: string
    neighborhood: string
  }
}

interface ClientDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientData: ClientData
}

export function ClientDetailsModal({
  open,
  onOpenChange,
  clientData,
}: ClientDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader className="border-none">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
              <FeaturedIcon
                variant="successBorderedLight"
                className="w-8 h-8"
                rounded
                Icon={TextSearchIcon}
              />
              <DialogTitle>
                Informações do {clientData.documentType}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="mt-0 pt-0">
          <DetailCardRowItem className="lg:grid-cols-3 px-0">
            <TextSupportingText
              supporting={clientData.documentType}
              text={clientData.document}
            />
            {clientData.documentType === 'CNPJ' ? (
              <>
                <TextSupportingText
                  supporting="Razão Social"
                  text={clientData.legalName}
                />
                <TextSupportingText
                  supporting="Nome Fantasia"
                  text={clientData.name}
                />
              </>
            ) : (
              <>
                <TextSupportingText supporting="Nome" text={clientData.name} />
                <TextSupportingText
                  supporting="Data de Nascimento"
                  text={clientData.birthdate}
                />
              </>
            )}
          </DetailCardRowItem>

          {clientData.documentType === 'CPF' && clientData.motherName && (
            <DetailCardRowItem className="lg:grid-cols-3 px-0">
              <TextSupportingText
                supporting="Nome da Mãe"
                text={clientData.motherName}
              />
            </DetailCardRowItem>
          )}

          <DetailCardRowItem className="lg:grid-cols-3 px-0">
            {clientData.phone && (
              <TextSupportingText
                supporting="Telefone"
                text={clientData.phone}
              />
            )}
            <TextSupportingText
              supporting="CEP"
              text={clientData.address.zipcode}
            />
            <TextSupportingText
              supporting="Estado"
              text={clientData.address.state}
            />
          </DetailCardRowItem>

          <DetailCardRowItem
            className="lg:grid-cols-3 px-0"
            showSeparator={false}
          >
            <TextSupportingText
              supporting="Cidade"
              text={clientData.address.city}
            />
            <TextSupportingText
              supporting="Bairro"
              text={clientData.address.neighborhood}
            />
            <TextSupportingText
              supporting="Rua"
              text={clientData.address.street}
            />
          </DetailCardRowItem>
        </DialogBody>

        <DialogFooter className="flex justify-end pt-4 border-t gap-4">
          <DialogClose asChild>
            <Button variant="neutralOutline">Cancelar</Button>
          </DialogClose>
          <Button RightIcon={IconArrowRight}>Cadastrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
