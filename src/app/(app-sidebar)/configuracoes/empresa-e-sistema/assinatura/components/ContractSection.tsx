'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { IconFileText } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getItem } from '@/actions/_cruds'

import { ContractModal } from './ContractModal'
import { contractorDocumentLabel, type AcceptedContract } from './contract'

/**
 * O contrato da assinatura à vista na página, e não só num ícone do topo: a
 * versão aceita, quando e por quem, e em nome de quem.
 */
export function ContractSection() {
  const [open, setOpen] = useState(false)
  const { data, isLoading, isError } = useQuery({
    queryKey: ['accepted-contract'],
    queryFn: async () => {
      const response = await getItem({ route: '/contract/accepted' })
      if (!response.success) throw new Error(response.message)
      return response.data as AcceptedContract
    },
    retry: false,
  })

  return (
    <Card data-contrato>
      <CardHeader>
        <CardTitle className="text-base">Contrato</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-56" />
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-gray-500">
            Nenhum contrato aceito encontrado para esta assinatura.
          </p>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <dl className="grid gap-1 text-sm text-gray-600">
              <dt className="sr-only">Versão</dt>
              <dd className="font-semibold text-gray-900">
                {data.name || `Versão ${data.version}`}
              </dd>
              <dt className="sr-only">Aceite</dt>
              <dd>
                Aceito em{' '}
                {format(new Date(data.acceptedAt), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
                {data.acceptedBy ? ` por ${data.acceptedBy.name}` : ''}
              </dd>
              {data.contractor && (
                <>
                  <dt className="sr-only">Contratante</dt>
                  <dd>
                    Contratante: {data.contractor.name},{' '}
                    {contractorDocumentLabel(data.contractor)}
                  </dd>
                </>
              )}
              {data.principalAdmin && (
                <>
                  <dt className="sr-only">Administrador principal</dt>
                  <dd>
                    Administrador principal (Usuário nº 1):{' '}
                    {data.principalAdmin.name}
                  </dd>
                </>
              )}
              {data.representative && (
                <>
                  <dt className="sr-only">Representante legal</dt>
                  <dd>
                    Representante legal: {data.representative.name}
                    {data.representative.verified
                      ? ' (conferido no registro público)'
                      : ' (informado na contratação)'}
                  </dd>
                </>
              )}
            </dl>
            <Button
              variant="neutralOutline"
              className="flex-none"
              LeftIcon={IconFileText}
              onClick={() => setOpen(true)}
            >
              Ver contrato
            </Button>
          </div>
        )}
      </CardContent>
      {data && (
        <ContractModal open={open} onOpenChange={setOpen} contract={data} />
      )}
    </Card>
  )
}
