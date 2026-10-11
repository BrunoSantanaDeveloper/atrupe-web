'use client'

import { maskCnpj, maskCpf } from '@/lib/utils'
import type { ContractorOnFile } from '@/types/checkout'

import {
  AccountStatus,
  CheckoutSection,
  SectionNote,
} from '../../components/checkout/CheckoutLayout'

interface Props {
  contractor: ContractorOnFile
  account: { name: string; email: string }
}

function Line({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-200 py-2 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <strong className="text-right text-sm font-medium text-gray-800">
        {value}
      </strong>
    </div>
  )
}

/**
 * "Quem contrata" em leitura, como no protótipo: na evolução, nos
 * complementos e na regularização o contratante é o da assinatura em curso e
 * não se pergunta de novo — trocá-lo é assunto da transferência de
 * titularidade.
 */
export function ContractorReadOnly({ contractor, account }: Props) {
  const company = contractor.type === 'PJ'
  return (
    <CheckoutSection title="Quem contrata" id="section-contratante">
      <SectionNote>
        A titularidade poderá ser transferida posteriormente.
      </SectionNote>
      <AccountStatus name={account.name} email={account.email} />
      <div className="flex flex-col rounded-lg border border-gray-200 bg-gray-50 px-4 py-1">
        <Line label="Contratante" value={contractor.name} />
        <Line
          label={company ? 'CNPJ' : 'CPF'}
          value={
            company
              ? maskCnpj(contractor.document)
              : maskCpf(contractor.document)
          }
        />
        <Line label="Contato de cobrança" value={contractor.email} />
        <Line
          label="Representante legal"
          value={contractor.representativeName}
        />
      </div>
      <p className="text-xs text-gray-500">
        Para transferir a titularidade da assinatura para outra pessoa ou
        empresa, use a transferência de titularidade em Configurações ›
        Assinatura.
      </p>
    </CheckoutSection>
  )
}
