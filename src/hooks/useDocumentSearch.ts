import { getItem } from '@/actions/_cruds'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { capitalize } from '@/lib/utils'

export interface DocumentSearchData {
  document: string
  documentType: 'CPF' | 'CNPJ'
  name: string
  legalName?: string
  corporateName?: string
  phone?: string
  birthdate?: string
  motherName?: string
  rg?: string
  rgIssuingAgency?: string
  rgIssuingState?: string
  existsInSystem?: boolean
  existingClient?: { id: string; name: string; status: string } | null
  address?: {
    street: string
    number?: string
    complement?: string
    city: string
    state: string
    zipcode: string
    country: string
    neighborhood: string
  }
}

const fetchDocumentData = async (
  document: string,
): Promise<DocumentSearchData | null> => {
  if (!document) return null

  const cleanDocument = document.replace(/[.\-/]/g, '')

  // Validate document length
  if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
    return null
  }

  const isCNPJ = cleanDocument.length === 14

  // Try the new lookup endpoint first (includes existsInSystem check)
  const lookupRes = await getItem({ route: `/client/lookup/${cleanDocument}` })

  if (lookupRes.success && lookupRes.data) {
    const data = lookupRes.data
    const autoFill = data.autoFill

    if (!autoFill) {
      // API external failed but we still have existsInSystem info
      if (data.existsInSystem && data.existingClient) {
        toast.warning(
          `Este ${isCNPJ ? 'CNPJ' : 'CPF'} já está cadastrado como "${data.existingClient.name}"`,
        )
      }
      if (data.error) {
        toast.error(data.error)
      }
      return null
    }

    // Show warning if document already exists in system
    if (data.existsInSystem && data.existingClient) {
      toast.warning(
        `Este ${isCNPJ ? 'CNPJ' : 'CPF'} já está cadastrado como "${data.existingClient.name}"`,
      )
    }

    const searchData: DocumentSearchData = isCNPJ
      ? {
          document: autoFill.cnpj || cleanDocument,
          documentType: 'CNPJ',
          name: capitalize(autoFill.name),
          legalName: capitalize(autoFill.corporateName),
          corporateName: capitalize(autoFill.corporateName),
          phone: autoFill.phone || '',
          existsInSystem: data.existsInSystem,
          existingClient: data.existingClient,
          address: autoFill.address
            ? {
                street: capitalize(autoFill.address.street),
                number: autoFill.address.number || '',
                complement: autoFill.address.complement || '',
                city: capitalize(autoFill.address.city),
                state: autoFill.address.state || '',
                zipcode: autoFill.address.zipcode || '',
                country: 'BR',
                neighborhood: capitalize(autoFill.address.neighborhood),
              }
            : undefined,
        }
      : {
          document: autoFill.cpf || cleanDocument,
          documentType: 'CPF',
          name: capitalize(autoFill.name),
          phone: autoFill.phone || '',
          birthdate: autoFill.birthdate || '',
          rg: autoFill.rg || '',
          existsInSystem: data.existsInSystem,
          existingClient: data.existingClient,
          address: autoFill.address
            ? {
                street: capitalize(autoFill.address.street),
                number: autoFill.address.number || '',
                complement: autoFill.address.complement || '',
                city: capitalize(autoFill.address.city),
                state: autoFill.address.state || '',
                zipcode: autoFill.address.zipcode || '',
                country: 'BR',
                neighborhood: capitalize(autoFill.address.neighborhood),
              }
            : undefined,
        }

    return searchData
  }

  // Fallback to old routes if lookup endpoint fails
  const route = isCNPJ
    ? `/utils/company/${cleanDocument}`
    : `/utils/people/${cleanDocument}`

  const res = await getItem({ route })

  if (!res.success) {
    toast.error(res.message)
    return null
  }

  if (!res.data) {
    toast.error('Nenhum dado recebido')
    return null
  }

  const searchData: DocumentSearchData = isCNPJ
    ? {
        document: res.data.cnpj || cleanDocument,
        documentType: 'CNPJ',
        name: capitalize(res.data.name),
        legalName: capitalize(res.data.legalName),
        corporateName: capitalize(res.data.legalName),
        phone: res.data.phone || '',
        address: {
          street: capitalize(res.data.address?.street),
          number: res.data.address?.number || '',
          complement: res.data.address?.complement || '',
          city: capitalize(res.data.address?.city),
          state: res.data.address?.state || '',
          zipcode: res.data.address?.zipcode || '',
          country: res.data.address?.country || '',
          neighborhood: capitalize(res.data.address?.neighborhood),
        },
      }
    : {
        document: res.data.cpf || cleanDocument,
        documentType: 'CPF',
        name: capitalize(res.data.name),
        birthdate: res.data.birthdate || '',
        motherName: capitalize(res.data.motherName),
        rg: res.data.rg || '',
        rgIssuingAgency: res.data.rgIssuingAgency || '',
        rgIssuingState: res.data.rgIssuingState || '',
        phone: res.data.phone || '',
        address: {
          street: capitalize(res.data.address?.street),
          number: res.data.address?.number || '',
          complement: res.data.address?.complement || '',
          city: capitalize(res.data.address?.city),
          state: res.data.address?.state || '',
          zipcode: res.data.address?.zipcode || '',
          country: res.data.address?.country || '',
          neighborhood: capitalize(res.data.address?.neighborhood),
        },
      }

  return searchData
}

export function useDocumentSearch() {
  const queryClient = useQueryClient()

  const searchByDocument = useCallback(
    async (document: string): Promise<DocumentSearchData | null> => {
      if (!document) return null

      const cleanDocument = document.replace(/[.\-/]/g, '')

      // Validate document length
      if (cleanDocument.length !== 11 && cleanDocument.length !== 14) {
        return null
      }

      try {
        return await queryClient.fetchQuery({
          queryKey: ['document', cleanDocument],
          queryFn: () => fetchDocumentData(cleanDocument),
          staleTime: 5 * 60 * 1000,
        })
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        return null
      }
    },
    [queryClient],
  )

  return {
    searchByDocument,
  }
}

export function useDocumentQuery(document: string | null) {
  const cleanDocument = document?.replace(/[.\-/]/g, '') || ''

  return useQuery({
    queryKey: ['document', cleanDocument],
    queryFn: () => fetchDocumentData(cleanDocument),
    enabled: Boolean(
      cleanDocument &&
        (cleanDocument.length === 11 || cleanDocument.length === 14),
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
