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

// Types
import type { SearchParamsType } from '@/types/coreTypes'

export function metadata() {
  return {
    title: 'Motivos de Rejeição e Cancelamento',
  }
}

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={['rejection_reasons_full']}
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
            A configuração de motivos de rejeição e cancelamento não está
            incluída no seu plano atual. Faça upgrade para acessar esta
            funcionalidade.
          </p>
          <Button type="button" asChild>
            <Link href="/assinatura/contratar">Fazer Upgrade</Link>
          </Button>
        </div>
      }
    >
      <PermissionGate
        permissions={['sales_settings:rejection_reasons:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar os motivos de rejeição e
            cancelamento.
          </div>
        }
      >
        <Main searchParams={searchParams} />
      </PermissionGate>
    </FeatureGate>
  )
}
