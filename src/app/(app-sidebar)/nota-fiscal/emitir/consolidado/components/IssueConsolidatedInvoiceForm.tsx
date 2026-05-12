'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Topbar } from '@/components/common/Topbar'
import { IconAlertTriangle } from '@tabler/icons-react'
import { IssueInvoiceForm } from '../../[orderId]/components/IssueInvoiceForm'

interface Props {
  orderIds: string[]
}

export function IssueConsolidatedInvoiceForm({ orderIds }: Props) {
  if (orderIds.length < 2) {
    return (
      <div className="space-y-6 pb-10">
        <Topbar
          title="Emissao consolidada de NF-e"
          previousPage="/nota-fiscal/emitir"
        />
        <Card className="border-error-200 bg-error-50">
          <CardContent className="flex items-center gap-4 py-6">
            <FeaturedIcon variant="errorLight" Icon={IconAlertTriangle} />
            <div>
              <p className="font-semibold text-error-700">
                Selecao insuficiente
              </p>
              <p className="text-sm text-error-600">
                Selecione ao menos duas OSs do mesmo cliente para consolidar.
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

  return <IssueInvoiceForm orderIds={orderIds} />
}
