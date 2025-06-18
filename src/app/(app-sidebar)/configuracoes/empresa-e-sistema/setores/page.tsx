// Components
import { Main } from './components/Main'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { Button } from '@/components/ui/button'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

// Icons
import { IconLock } from '@tabler/icons-react'
import Link from 'next/link'

export default function Page({ searchParams }: SearchParamsType) {
  return (
    <FeatureGate
      features={['sectors_management']}
      showUpgradeMessage={true}
      fallback={
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-orange-100 rounded-full">
            <IconLock className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Funcionalidade Premium
            </h2>
            <p className="text-gray-600 max-w-md">
              A gestão de setores está disponível apenas no plano Lite. Faça
              upgrade para organizar sua empresa por setores.
            </p>
          </div>
          <Button asChild>
            <Link href="/assinatura/contratar">Fazer Upgrade</Link>
          </Button>
        </div>
      }
    >
      <PermissionGate
        permissions={['company_settings:measurement_standards:view']}
        fallback={
          <div className="p-4">
            Você não tem permissão para visualizar os setores.
          </div>
        }
      >
        <Main searchParams={searchParams} />
      </PermissionGate>
    </FeatureGate>
  )
}
