'use client'

import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NfeListClient } from './NfeListClient'
import { NfseListClient } from './NfseListClient'
import { TableSkeleton } from '@/components/common/TableSkeleton'

// Icons
import { IconFileInvoice, IconFileDescription } from '@tabler/icons-react'

export function GestaoNotasClient() {
  return (
    <Tabs defaultValue="nfe" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="nfe" className="flex items-center gap-2">
          <IconFileInvoice className="size-4" />
          NF-e (Produtos)
        </TabsTrigger>
        <TabsTrigger value="nfse" className="flex items-center gap-2">
          <IconFileDescription className="size-4" />
          NFS-e (Servicos)
        </TabsTrigger>
      </TabsList>

      <TabsContent value="nfe">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFileInvoice className="size-5" />
              Notas Fiscais de Produto (NF-e)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TableSkeleton />}>
              <NfeListClient />
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="nfse">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFileDescription className="size-5" />
              Notas Fiscais de Servico (NFS-e)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TableSkeleton />}>
              <NfseListClient />
            </Suspense>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
