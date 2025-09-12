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

export interface ClientData {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  telefone: string
  email: string
  cep: string
  estado: string
  cidade: string
  bairro: string
  rua: string
  numero: string
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
              <DialogTitle>Informações do CNPJ</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="mt-0 pt-0">
          <DetailCardRowItem className="lg:grid-cols-3 px-0">
            <TextSupportingText supporting="CNPJ" text={clientData.cnpj} />
            <TextSupportingText
              supporting="Razão Social"
              text={clientData.razaoSocial}
            />
            <TextSupportingText
              supporting="Nome Fantasia"
              text={clientData.nomeFantasia}
            />
          </DetailCardRowItem>

          <DetailCardRowItem className="lg:grid-cols-3 px-0">
            <TextSupportingText
              supporting="Telefone"
              text={clientData.telefone}
            />
            <TextSupportingText supporting="E-mail" text={clientData.email} />
            <TextSupportingText supporting="CEP" text={clientData.cep} />
          </DetailCardRowItem>

          <DetailCardRowItem
            className="lg:grid-cols-3 px-0"
            showSeparator={false}
          >
            <TextSupportingText supporting="Estado" text={clientData.estado} />
            <TextSupportingText supporting="Cidade" text={clientData.cidade} />
            <TextSupportingText supporting="Bairro" text={clientData.bairro} />
          </DetailCardRowItem>

          <DetailCardRowItem className="lg:grid-cols-2 px-0">
            <TextSupportingText supporting="Rua" text={clientData.rua} />
            <TextSupportingText supporting="Número" text={clientData.numero} />
          </DetailCardRowItem>
        </DialogBody>

        <DialogFooter className="flex justify-end pt-4 border-t gap-4">
          <DialogClose asChild>
            <Button variant="neutralOutline">Cancelar</Button>
          </DialogClose>
          <Button className="bg-green-600 hover:bg-green-700">
            Cadastrar →
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
