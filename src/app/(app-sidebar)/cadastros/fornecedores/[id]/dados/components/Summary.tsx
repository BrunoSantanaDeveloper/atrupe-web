// Components
import { TextSupportingText } from '@/components/common/TextSupportingText'

// Libs
import { formatToLocaleDateTime } from '@/lib/formatDate'

// Types
import { ClientInfoType } from '@/types/cadastros/client'
import { DetailCardRowItem } from '../../components/DetailCardRowItem'
import { DetailCard } from '../../components/DetailCard'
import { IconFileInvoice, IconMapPin, IconUserStar } from '@tabler/icons-react'

interface Props {
  data?: ClientInfoType
}

export function SupplierSummary({ data }: Props) {
  return (
    <div className="space-y-4">
      <DetailCard title="Resumo" icon={IconFileInvoice}>
        <DetailCardRowItem>
          <TextSupportingText
            supporting="Razão Social"
            text={data?.general?.name}
          />
          {data?.general?.cnpj ? (
            <TextSupportingText supporting="CNPJ" text={data?.general?.cnpj} />
          ) : null}
          {data?.general?.cpf ? (
            <TextSupportingText supporting="CPF" text={data?.general?.cpf} />
          ) : null}
          {/* <TextSupportingText
            supporting="Atividade"
            text={data?.general?.activity}
          /> */}
          <TextSupportingText
            supporting="Categoria"
            text={data?.general?.category}
          />
        </DetailCardRowItem>

        <DetailCardRowItem>
          <TextSupportingText supporting="E-mail" text={data?.general?.email} />
          <TextSupportingText
            supporting="Telefone"
            text={data?.general?.phone}
          />
          <TextSupportingText
            supporting="Celular"
            text={data?.general?.mobile}
          />
          <TextSupportingText
            supporting="Data de cadastro"
            text={formatToLocaleDateTime(data?.createdAt)}
          />
        </DetailCardRowItem>
        <DetailCardRowItem showSeparator={false}>
          <TextSupportingText
            supporting="Observações gerais"
            text={data?.general?.notes}
            containerClassName="col-span-2 md:col-span-3 lg:col-span-4"
          />
        </DetailCardRowItem>
      </DetailCard>
      {data?.contacts?.map((contact) => (
        <div className="space-y-4" key={contact.id}>
          <DetailCard
            title={`Responsável - ${contact.name || ''}`}
            icon={IconUserStar}
          >
            <DetailCardRowItem>
              <TextSupportingText
                supporting="Cargo"
                text={contact.name || ''}
              />
              <TextSupportingText
                supporting="E-mail"
                text={contact.email || ''}
              />
              <TextSupportingText
                supporting="Celular"
                text={contact.phone || ''}
              />
            </DetailCardRowItem>
            <DetailCardRowItem showSeparator={false}>
              <TextSupportingText
                supporting="Observações"
                text={contact.notes || ''}
                containerClassName="col-span-2 md:col-span-3 lg:col-span-4"
              />
            </DetailCardRowItem>
          </DetailCard>
        </div>
      ))}
      {data?.addresses?.map((address) => (
        <div className="space-y-4" key={address.id}>
          <DetailCard title={`Endereço - ${address.type}`} icon={IconMapPin}>
            <DetailCardRowItem>
              <TextSupportingText
                supporting="CEP"
                text={address.zipcode || ''}
              />
              <TextSupportingText
                supporting="Estado"
                text={address.state || ''}
              />
              <TextSupportingText
                supporting="Cidade"
                text={address.city || ''}
              />
              <TextSupportingText
                supporting="Bairro"
                text={address.neighborhood || ''}
              />
            </DetailCardRowItem>
            <DetailCardRowItem>
              <TextSupportingText
                supporting="Rua"
                text={address.street || ''}
              />
              <TextSupportingText
                supporting="Número"
                text={address.number || ''}
              />
              <TextSupportingText
                supporting="Complemento"
                text={address.complement || ''}
              />
            </DetailCardRowItem>
          </DetailCard>
        </div>
      ))}
    </div>
  )
}
