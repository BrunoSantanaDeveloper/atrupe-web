'use client'

// React / Next
import Link from 'next/link'

// UI
import { Button } from '@/components/ui/button'

// Hooks / Consts
import { FEATURES } from '@/consts/features'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

// Icons
import { IconReportMoney } from '@tabler/icons-react'

// A folha do START ganha profundidade no PRO, sem virar outro cadastro (DC-1):
// o custo completo por colaborador fica na tela de custos.
export function PayrollCostsLink() {
  const { hasFeature } = usePlanFeatures()

  if (!hasFeature(FEATURES.COSTS.COST_BASE)) return null

  return (
    <Button variant="neutralOutline" LeftIcon={IconReportMoney} asChild>
      <Link href="/configuracoes/financeiro/folhas-de-pagamento/custos">
        Custos da folha
      </Link>
    </Button>
  )
}
