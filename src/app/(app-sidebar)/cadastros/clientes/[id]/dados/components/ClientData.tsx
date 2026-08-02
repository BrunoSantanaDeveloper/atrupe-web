'use client'

// Components
import { TextSupportingText } from '@/components/common/TextSupportingText'

// Libs
import { formatToLocaleDateTime } from '@/lib/formatDate'

// Types
import { ClientInfoType } from '@/types/cadastros/client'

import { DetailCardRowItem } from '../../components/DetailCardRowItem'
import { DetailCard } from '../../components/DetailCard'
import {
  IconFileInvoice,
  IconMapPin,
  IconUserStar,
  IconReceiptTax,
} from '@tabler/icons-react'
import { Fragment } from 'react'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

interface Props {
  data: ClientInfoType
}

const INDICADOR_IE_LABELS: Record<number, string> = {
  1: '1 - Contribuinte ICMS',
  2: '2 - Contribuinte Isento',
  9: '9 - Não Contribuinte',
}

export function ClientData({ data }: Props) {
  const { canManageClientResponsible } = usePlanFeatures()

  if (!data) return null

  return (
    <div className="space-y-4">
      {data.general && (
        <DetailCard title="Resumo" icon={IconFileInvoice}>
          <DetailCardRowItem>
            <TextSupportingText
              supporting="Razão Social"
              text={data.general.name}
            />
            {data.general.cnpj ? (
              <TextSupportingText supporting="CNPJ" text={data.general.cnpj} />
            ) : null}
            {data.general.cpf ? (
              <TextSupportingText supporting="CPF" text={data.general.cpf} />
            ) : null}
            <TextSupportingText
              supporting="Grupo"
              text={data.general.category?.name}
            />
          </DetailCardRowItem>

          <DetailCardRowItem>
            <TextSupportingText supporting="E-mail" text={data.general.email} />
            <TextSupportingText
              supporting="Telefone"
              text={data.general.phone}
            />
            <TextSupportingText
              supporting="Celular"
              text={data.general.mobile}
            />
            <TextSupportingText
              supporting="Data de cadastro"
              text={formatToLocaleDateTime(data.createdAt)}
            />
            {canManageClientResponsible() && (
              <TextSupportingText
                supporting="Responsável"
                text={data.general.responsible?.name || 'Sem Responsável'}
              />
            )}
          </DetailCardRowItem>
          <DetailCardRowItem showSeparator={false}>
            <TextSupportingText
              supporting="Observações gerais"
              text={data.general.notes}
              containerClassName="col-span-2 md:col-span-3 lg:col-span-4"
            />
          </DetailCardRowItem>
        </DetailCard>
      )}

      {/* Dados Fiscais */}
      {data.general && (
        <DetailCard title="Dados Fiscais" icon={IconReceiptTax}>
          <DetailCardRowItem showSeparator={false}>
            <TextSupportingText
              supporting="Inscrição Estadual (IE)"
              text={data.general.stateRegistration || 'ISENTO'}
            />
            <TextSupportingText
              supporting="Indicador IE"
              text={
                INDICADOR_IE_LABELS[data.general.indicadorIE ?? 9] ??
                '9 - Não Contribuinte'
              }
            />
          </DetailCardRowItem>
        </DetailCard>
      )}

      {data.contacts?.length
        ? data.contacts.map((contact) => (
            <Fragment key={contact.id}>
              <DetailCard
                title={`Responsável - ${contact.name || ''}`}
                icon={IconUserStar}
              >
                <DetailCardRowItem>
                  <TextSupportingText
                    supporting="Nome"
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
            </Fragment>
          ))
        : null}
      {data.addresses?.length
        ? data.addresses.map((address) => (
            <Fragment key={address.id}>
              <DetailCard
                title={`Endereço - ${address.type}`}
                icon={IconMapPin}
              >
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
                <DetailCardRowItem showSeparator={false}>
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
            </Fragment>
          ))
        : null}
    </div>
  )
}
