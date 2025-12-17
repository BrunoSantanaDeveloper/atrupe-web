import { Suspense } from 'react'
import { Topbar } from '@/components/common/Topbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NfeListClient } from './components/NfeListClient'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Icons
import { IconReceipt2 } from '@tabler/icons-react'

export default function GestaoNfePage() {
  return (
    <>
      <Topbar title="Gestão de Notas Fiscais" />

      <PermissionGate permissions={['invoice_settings:nfse:view']}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconReceipt2 className="size-5" />
              Notas Fiscais Emitidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TableSkeleton />}>
              <NfeListClient />
            </Suspense>
          </CardContent>
        </Card>
      </PermissionGate>
    </>
  )
}
