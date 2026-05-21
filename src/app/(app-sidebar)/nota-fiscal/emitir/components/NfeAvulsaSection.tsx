'use client'

import { useEffect, useState, useCallback } from 'react'

// UI
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { TablePagination } from '@/components/common/TablePagination'
import { NfeActionsDropdown } from '@/components/common/fiscal/NfeActionsDropdown'

// Actions
import { getData } from '@/actions/_cruds'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

interface NfeAvulsaItem {
  id: string
  numero: number
  serie: number
  status: string
  valorTotal: number
  dataEmissao: string
  danfeUrl?: string | null
  chaveAcesso?: string | null
  xmlAutorizado?: string | null
  destinatario?: {
    nome?: string
  }
}

export function NfeAvulsaSection({ searchParams }: SearchParamsType) {
  const [isLoading, setIsLoading] = useState(true)
  const [nfes, setNfes] = useState<NfeAvulsaItem[]>([])
  const [totalPages, setTotalPages] = useState(1)

  const currentPage = parseInt((searchParams?.page as string) || '1', 10)
  const currentNfeStatus =
    (searchParams?.nfeStatus as string | undefined) || 'TODAS'
  const startDate = searchParams?.startDate as string | undefined
  const endDate = searchParams?.endDate as string | undefined

  const fetchNfes = useCallback(async () => {
    setIsLoading(true)

    try {
      const filters: Record<string, string | undefined> = {
        page: currentPage.toString(),
        avulsa: 'true',
      }

      if (currentNfeStatus !== 'TODAS') {
        if (currentNfeStatus === 'EMITIDA') filters.status = 'AUTHORIZED'
        if (currentNfeStatus === 'EM_DIGITACAO') filters.status = 'DRAFT'
      }

      if (startDate) filters.startDate = startDate
      if (endDate) filters.endDate = endDate

      const result = await getData({
        route: '/fiscal/nfe',
        filters,
        perPage: '10',
      })

      if (result.success && result.data) {
        const rawData = result.data as unknown as Record<string, unknown>
        const dataArray = Array.isArray(rawData)
          ? rawData
          : Array.isArray(rawData?.data)
            ? rawData.data
            : []
        setNfes(dataArray as NfeAvulsaItem[])
        setTotalPages(result.lastPage || 1)
      } else {
        setNfes([])
      }
    } catch (error) {
      console.error('Erro ao buscar NF-es avulsas:', error)
      setNfes([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, currentNfeStatus, startDate, endDate])

  useEffect(() => {
    fetchNfes()
  }, [fetchNfes])

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00'
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  const getStatusBadge = (status: string) => {
    const map: Record<
      string,
      {
        label: string
        variant:
          | 'successLight'
          | 'blueLight'
          | 'errorLight'
          | 'warningLight'
          | 'purpleLight'
          | 'neutralLight'
      }
    > = {
      AUTHORIZED: { label: 'Autorizada', variant: 'successLight' },
      DRAFT: { label: 'Rascunho', variant: 'blueLight' },
      CANCELLED: { label: 'Cancelada', variant: 'errorLight' },
      PENDING: { label: 'Pendente', variant: 'warningLight' },
      REJECTED: { label: 'Rejeitada', variant: 'errorLight' },
      CORRECTION_SENT: { label: 'CC-e', variant: 'purpleLight' },
    }
    const config = map[status] || { label: status, variant: 'neutralLight' }
    return (
      <Badge variant={config.variant} status>
        {config.label}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card className="flex flex-col mt-6">
        <CardHeader>
          <CardTitle>NF-e Avulsas Emitidas</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (nfes.length === 0) {
    return null
  }

  return (
    <Card className="flex flex-col mt-6">
      <CardHeader>
        <CardTitle>NF-e Avulsas Emitidas</CardTitle>
      </CardHeader>

      <CardContent className="overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-y border-gray-100">
              <TableHead className="px-4">Nº / Série</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nfes.map((nfe) => (
              <TableRow key={nfe.id} className="hover:bg-gray-50">
                <TableCell className="px-4 font-medium">
                  {nfe.numero} / {nfe.serie}
                </TableCell>
                <TableCell className="text-gray-600">
                  {nfe.destinatario?.nome || 'Não informado'}
                </TableCell>
                <TableCell className="font-semibold text-gray-800">
                  {formatCurrency(nfe.valorTotal)}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {nfe.dataEmissao ? formatDate(nfe.dataEmissao) : '-'}
                </TableCell>
                <TableCell>{getStatusBadge(nfe.status)}</TableCell>
                <TableCell>
                  <NfeActionsDropdown nfe={nfe} onRefetch={fetchNfes} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="border-t border-gray-100 p-4 mt-auto">
        <TablePagination
          searchParams={searchParams}
          lastPage={totalPages}
          activeVariant="success"
        />
      </CardFooter>
    </Card>
  )
}
