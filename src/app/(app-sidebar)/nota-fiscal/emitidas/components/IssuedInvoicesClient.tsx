'use client'

import { useState } from 'react'
import { toast } from 'sonner'

// UI
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icons
import { IconFileInvoice, IconRefresh } from '@tabler/icons-react'

// Components
import { NfeTab } from './NfeTab'
import { NfseTab } from './NfseTab'
import { NfceTab } from './NfceTab'

// Actions
import { getData } from '@/actions/_cruds'

// Types
import { useQuery } from '@tanstack/react-query'

async function getNfes(page = 1, limit = 20) {
  const result = await getData({
    route: '/fiscal/nfe',
    filters: { page: String(page), limit: String(limit) },
  })

  if (!result.success) {
    toast.error('Erro ao buscar notas fiscais: ' + result.message)
    return { items: [], total: 0 }
  }

  return result.data
}

async function getNfces(page = 1, limit = 20) {
  const result = await getData({
    route: '/fiscal/nfce',
    filters: { page: String(page), limit: String(limit) },
  })

  if (!result.success) {
    toast.error('Erro ao buscar notas fiscais (NFC-e): ' + result.message)
    return { items: [], total: 0 }
  }

  return result.data
}

async function getNfses(page = 1, limit = 20) {
  const result = await getData({
    route: '/fiscal/nfse',
    filters: { page: String(page), limit: String(limit) },
  })

  if (!result.success) {
    toast.error('Erro ao buscar NFS-e: ' + result.message)
    return { items: [], total: 0 }
  }

  return result.data
}

export function IssuedInvoicesClient() {
  const [page] = useState(1)

  const {
    data: nfeData,
    isLoading: isLoadingNfe,
    refetch: refetchNfe,
  } = useQuery({
    queryKey: ['nfes', page],
    queryFn: () => getNfes(page),
  })

  const {
    data: nfceData,
    isLoading: isLoadingNfce,
    refetch: refetchNfce,
  } = useQuery({
    queryKey: ['nfces', page],
    queryFn: () => getNfces(page),
  })

  const {
    data: nfseData,
    isLoading: isLoadingNfse,
    refetch: refetchNfse,
  } = useQuery({
    queryKey: ['nfses', page],
    queryFn: () => getNfses(page),
  })

  const refetchAll = () => {
    refetchNfe()
    refetchNfce()
    refetchNfse()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <FeaturedIcon variant="neutralOutline" Icon={IconFileInvoice} />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Notas Fiscais Emitidas
            </h2>
            <p className="text-muted-foreground">
              Gerencie suas notas fiscais eletrônicas (NF-e) e de consumidor
              (NFC-e).
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={refetchAll}
          aria-label="Atualizar notas fiscais"
        >
          <IconRefresh size={20} />
        </Button>
      </div>

      <Tabs defaultValue="nfe" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nfe">NF-e (Nota Fiscal Eletrônica)</TabsTrigger>
          <TabsTrigger value="nfse">NFS-e (Serviços)</TabsTrigger>
          <TabsTrigger value="nfce">NFC-e (Consumidor)</TabsTrigger>
        </TabsList>
        <TabsContent value="nfe" className="space-y-4">
          <NfeTab
            items={nfeData?.items || []}
            isLoading={isLoadingNfe}
            onRefetch={() => refetchNfe()}
          />
        </TabsContent>
        <TabsContent value="nfse" className="space-y-4">
          <NfseTab items={nfseData?.items || []} isLoading={isLoadingNfse} />
        </TabsContent>
        <TabsContent value="nfce" className="space-y-4">
          <NfceTab items={nfceData?.items || []} isLoading={isLoadingNfce} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
