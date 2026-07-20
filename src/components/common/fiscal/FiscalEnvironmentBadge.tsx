'use client'

import { useQuery } from '@tanstack/react-query'
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react'

import { getDataOld } from '@/actions/_cruds'
import { Badge } from '@/components/ui/badge'

export type FiscalEnvironment = 'HOMOLOGACAO' | 'PRODUCAO'

export interface FiscalEnvironmentConfig {
  activeEnvironment?: FiscalEnvironment | null
  activeEnvironmentNfe?: FiscalEnvironment | null
  activeEnvironmentNfse?: FiscalEnvironment | null
  activeEnvironmentNfce?: FiscalEnvironment | null
  environment?: FiscalEnvironment | null
  ambiente?: number | null
}

export function resolveFiscalEnvironment(
  config?: FiscalEnvironmentConfig,
  documentType: 'NFE' | 'NFSE' | 'NFCE' = 'NFE',
): FiscalEnvironment {
  const specific =
    documentType === 'NFE'
      ? config?.activeEnvironmentNfe
      : documentType === 'NFSE'
        ? config?.activeEnvironmentNfse
        : config?.activeEnvironmentNfce

  return (
    specific ||
    config?.activeEnvironment ||
    config?.environment ||
    (config?.ambiente === 1 ? 'PRODUCAO' : 'HOMOLOGACAO')
  )
}

export function useFiscalEnvironmentConfig() {
  return useQuery<FiscalEnvironmentConfig>({
    queryKey: ['fiscal-environment-config'],
    queryFn: async () => {
      const response = await getDataOld({ route: '/fiscal/invoicy/config' })
      return response || {}
    },
    staleTime: 60_000,
  })
}

export function FiscalEnvironmentBadge({
  documentType = 'NFE',
  showDocumentType = false,
}: {
  documentType?: 'NFE' | 'NFSE' | 'NFCE'
  showDocumentType?: boolean
}) {
  const { data, isLoading } = useFiscalEnvironmentConfig()
  if (isLoading) return null

  const environment = resolveFiscalEnvironment(data, documentType)
  const production = environment === 'PRODUCAO'

  return (
    <Badge variant={production ? 'successLight' : 'warningLight'}>
      {production ? (
        <IconCircleCheck className="mr-1 size-3.5" />
      ) : (
        <IconAlertTriangle className="mr-1 size-3.5" />
      )}
      {showDocumentType
        ? `${documentType.replace('NFSE', 'NFS-e').replace('NFCE', 'NFC-e').replace('NFE', 'NF-e')}: `
        : ''}
      {production ? 'Produção' : 'Homologação'}
    </Badge>
  )
}
