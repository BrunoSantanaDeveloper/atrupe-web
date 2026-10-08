'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconAlertTriangle } from '@tabler/icons-react'
import { IssueNfseForm } from '../../[orderId]/components/IssueNfseForm'

interface Props {
  orderIds: string[]
}

export function IssueConsolidatedNfseForm({ orderIds }: Props) {
  if (orderIds.length < 2) {
    return (
      <div className="space-y-6 pb-10">
        <Card className="border-error-200 bg-error-50">
          <CardContent className="flex items-center gap-4 py-6">
            <FeaturedIcon tone="error" Icon={IconAlertTriangle} />
            <div>
              <p className="font-semibold text-error-700">
                Seleção insuficiente
              </p>
              <p className="text-sm text-error-600">
                Selecione ao menos duas OSs do mesmo cliente para consolidar a
                NFS-e.
              </p>
            </div>
            <Button
              variant="neutralOutline"
              onClick={() => window.history.back()}
              className="ml-auto"
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <IssueNfseForm orderIds={orderIds} />
}
