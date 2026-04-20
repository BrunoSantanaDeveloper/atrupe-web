'use client'

// Components
import { FiscalModuleGate } from '../../../components/FiscalModuleGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { StandaloneNfeForm } from './components/StandaloneNfeForm'

export default function NotaAvulsaNfePage() {
  return (
    <PermissionGate
      permissions={['nota_fiscal:emitir:create']}
      fallback={
        <div className="p-4">
          Você não tem permissão para emitir nota fiscal.
        </div>
      }
    >
      <FiscalModuleGate>
        <StandaloneNfeForm />
      </FiscalModuleGate>
    </PermissionGate>
  )
}
