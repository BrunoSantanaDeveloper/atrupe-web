// Components
import { Main } from './components/Main'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// UI Components
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Next.js
import Link from 'next/link'

// Icons
import { IconLock } from '@tabler/icons-react'

export function metadata() {
  return { title: 'Status de orçamento' }
}

export default function QuotationStatusPage() {
  return (
    <FeatureGate
      features={['budget_status_full']}
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <FeaturedIcon
            Icon={IconLock}
            variant="neutralBorderedLight"
            size="xl"
            rounded
            className="mb-6"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Funcionalidade Bloqueada
          </h3>
          <p className="text-gray-600 text-center mb-6 max-w-md">
            A configuração de status de orçamento não está incluída no seu plano
            atual. Faça upgrade para acessar esta funcionalidade.
          </p>
          <Button type="button" asChild>
            <Link href="/assinatura/contratar">Fazer Upgrade</Link>
          </Button>
        </div>
      }
    >
      <PermissionGate
        permissions={['sales_settings:quotation_status:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar os status de orçamento.
          </div>
        }
      >
        <Main />
      </PermissionGate>
    </FeatureGate>
  )
}
