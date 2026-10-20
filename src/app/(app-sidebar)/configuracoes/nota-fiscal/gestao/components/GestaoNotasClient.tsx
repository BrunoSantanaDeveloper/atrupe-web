'use client'

import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NfeListClient } from './NfeListClient'
import { NfseListClient } from './NfseListClient'
import { TableSkeleton } from '@/components/common/TableSkeleton'

// Icons
import { IconFileInvoice, IconFileDescription } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

export function GestaoNotasClient() {
  return (
    <Tabs defaultValue="nfe" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="nfe" className="flex items-center gap-2">
          <Icon icon={IconFileInvoice} size="sm" />
          NF-e (Produtos)
        </TabsTrigger>
        <TabsTrigger value="nfse" className="flex items-center gap-2">
          <Icon icon={IconFileDescription} size="sm" />
          NFS-e (Servicos)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="nfe">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon={IconFileInvoice} size="md" />
              Notas Fiscais de Produto (NF-e)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TableSkeleton cols={7} />}>
              <NfeListClient />
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="nfse">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon={IconFileDescription} size="md" />
              Notas fiscais de serviço (NFS-e)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TableSkeleton cols={8} />}>
              <NfseListClient />
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
