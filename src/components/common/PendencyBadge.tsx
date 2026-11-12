'use client'

// A marcação "⚠️ Pendência" do título que libera uma venda pendente de
// pagamento (PA-5, 12/11/2026): o mesmo nome e o mesmo símbolo da aba
// "⚠️ Pendente" de Orçamentos. Ao passar o mouse, diz o que a baixa faz

// Next
import Link from 'next/link'

// UI
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type Pendency = {
  quotationId: string
  reference: string
} | null

export function PendencyBadge({
  pendency,
  clientName,
}: {
  pendency?: Pendency
  clientName?: string | null
}) {
  if (!pendency) return null
  const sale = `#${pendency.reference}${clientName ? ` (${clientName})` : ''}`
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={`/vendas/orcamentos/${pendency.quotationId}`}
            onClick={(event) => event.stopPropagation()}
          >
            <Badge size="sm" variant="warningLight" className="shrink-0">
              ⚠️ Pendência
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          {`Ao receber, libera a venda ${sale}: ela vira ordem de serviço.`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
