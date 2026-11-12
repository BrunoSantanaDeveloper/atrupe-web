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
import { TextSupportingText } from '@/components/common/TextSupportingText'
import { DetailCardRowItem } from '@/app/(app-sidebar)/cadastros/clientes/[id]/components/DetailCardRowItem'
import { IconArrowRight } from '@tabler/icons-react'
import { maskCpfCnpj, MaskPhoneNumber, maskCep } from '@/lib/utils'
import { useState } from 'react'
import { NewClientModal } from '../NewClient'
import type { NewClientFormType } from '../NewClient/schema'

function formatBirthdate(dateString?: string): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

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
      <DialogContent className="sm:max-w-[830px]">
        <DialogHeader className="border-none">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
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
              text={maskCpfCnpj(clientData.document)}
            />
            {clientData.documentType === 'CNPJ' ? (
              <>
                <TextSupportingText
                  supporting="Razão social"
                  text={clientData.legalName}
                />
                <TextSupportingText
                  supporting="Nome fantasia"
                  text={clientData.name}
                />
              </>
            ) : (
              <>
                <TextSupportingText supporting="Nome" text={clientData.name} />
                <TextSupportingText
                  supporting="Data de nascimento"
                  text={formatBirthdate(clientData.birthdate)}
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
                text={MaskPhoneNumber(clientData.phone)}
              />
            )}
            <TextSupportingText
              supporting="CEP"
              text={maskCep(clientData.address.zipcode)}
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

export function ClientDetailsModalWithNewClient({
  open,
  onOpenChange,
  clientData,
}: ClientDetailsModalProps) {
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [prefilledData, setPrefilledData] = useState<NewClientFormType | null>(
    null,
  )

  const handleOpenNewClientModal = () => {
    // Mapear dados do ClientData para NewClientFormType
    const formData: NewClientFormType = {
      type: (clientData.documentType === 'CPF' ? 'PERSON' : 'COMPANY') as
        | 'PERSON'
        | 'COMPANY',
      general: {
        name: clientData.name,
        corporateName: clientData.legalName || '',
        email: '',
        cpf: clientData.documentType === 'CPF' ? clientData.document : '',
        rg: '',
        cnpj: clientData.documentType === 'CNPJ' ? clientData.document : '',
        activity: '',
        categoryId: '',
        phone: clientData.phone || '',
        mobile: '',
        notes: '',
      },
      addresses: [
        {
          type: 'Principal',
          zipcode: clientData.address.zipcode,
          state: clientData.address.state,
          city: clientData.address.city,
          neighborhood: clientData.address.neighborhood,
          street: clientData.address.street,
          number: '',
          complement: '',
        },
      ],
      responsibilities: [
        {
          name: '',
          email: '',
          phone: '',
          mobile: '',
          notes: '',
        },
      ],
      creditLimit: {
        minValue: 0,
        maxValue: 0,
        paymentMethods: [],
        blockClient: false,
        requirePrepayment: false,
      },
    } as NewClientFormType

    setPrefilledData(formData)
    setShowNewClientModal(true)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[830px]">
          <DialogHeader className="border-none">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <div className="flex items-center gap-3">
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
                text={maskCpfCnpj(clientData.document)}
              />
              {clientData.documentType === 'CNPJ' ? (
                <>
                  <TextSupportingText
                    supporting="Razão social"
                    text={clientData.legalName}
                  />
                  <TextSupportingText
                    supporting="Nome fantasia"
                    text={clientData.name}
                  />
                </>
              ) : (
                <>
                  <TextSupportingText
                    supporting="Nome"
                    text={clientData.name}
                  />
                  <TextSupportingText
                    supporting="Data de nascimento"
                    text={formatBirthdate(clientData.birthdate)}
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
                  text={MaskPhoneNumber(clientData.phone)}
                />
              )}
              <TextSupportingText
                supporting="CEP"
                text={maskCep(clientData.address.zipcode)}
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
            <Button
              RightIcon={IconArrowRight}
              onClick={handleOpenNewClientModal}
            >
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {prefilledData && (
        <NewClientModal
          open={showNewClientModal}
          onOpenChange={setShowNewClientModal}
          prefilledData={prefilledData}
        />
      )}
    </>
  )
}
