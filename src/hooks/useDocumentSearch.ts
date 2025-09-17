import { getItem } from '@/actions/_cruds'
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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
  address?: {
    street: string
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
        name: res.data.name || '',
        legalName: res.data.legalName || '',
        corporateName: res.data.legalName || '',
        phone: res.data.phone || '',
        address: {
          street: res.data.address?.street || '',
          city: res.data.address?.city || '',
          state: res.data.address?.state || '',
          zipcode: res.data.address?.zipcode || '',
          country: res.data.address?.country || '',
          neighborhood: res.data.address?.neighborhood || '',
        },
      }
    : {
        document: res.data.cpf || cleanDocument,
        documentType: 'CPF',
        name: res.data.name || '',
        birthdate: res.data.birthdate || '',
        motherName: res.data.motherName || '',
        rg: res.data.rg || '',
        rgIssuingAgency: res.data.rgIssuingAgency || '',
        rgIssuingState: res.data.rgIssuingState || '',
        phone: res.data.phone || '',
        address: {
          street: res.data.address?.street || '',
          city: res.data.address?.city || '',
          state: res.data.address?.state || '',
          zipcode: res.data.address?.zipcode || '',
          country: res.data.address?.country || '',
          neighborhood: res.data.address?.neighborhood || '',
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
