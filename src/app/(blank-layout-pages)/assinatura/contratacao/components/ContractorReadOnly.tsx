'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { maskCnpj, maskCpf } from '@/lib/utils'
import type { ContractorOnFile } from '@/types/checkout'

interface Props {
  contractor: ContractorOnFile
}

/**
 * O contratante da assinatura em curso, em leitura. Na evolução, nos
 * complementos e na regularização ele não é pedido de novo nem editado ali:
 * a troca de titular é assunto da transferência de titularidade.
 */
export function ContractorReadOnly({ contractor }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Contratante</CardTitle>
        <p className="text-sm text-gray-600">
          Para mudar o contratante, use a transferência de titularidade.
        </p>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
        <p>
          <span className="text-gray-500">Contratante</span>
          <br />
          {contractor.name}
        </p>
        <p>
          <span className="text-gray-500">
            {contractor.type === 'PJ' ? 'CNPJ' : 'CPF'}
          </span>
          <br />
          {contractor.type === 'PJ'
            ? maskCnpj(contractor.document)
            : maskCpf(contractor.document)}
        </p>
        <p>
          <span className="text-gray-500">Contato de cobrança</span>
          <br />
          {contractor.email}
        </p>
        {contractor.representativeName && (
          <p>
            <span className="text-gray-500">Representante legal</span>
            <br />
            {contractor.representativeName}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
