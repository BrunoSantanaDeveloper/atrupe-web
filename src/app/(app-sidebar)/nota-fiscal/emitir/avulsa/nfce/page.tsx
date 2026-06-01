import { Metadata } from 'next'

// Components
import { FiscalModuleGate } from '../../../components/FiscalModuleGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { StandaloneNfceForm } from './components/StandaloneNfceForm'

export const metadata: Metadata = {
  title: 'NFC-e Nota Avulsa',
  description: 'Emissão de Nota Fiscal de Consumidor Eletrônica Avulsa',
}

export default function NotaAvulsaNfcePage() {
  return (
    <FiscalModuleGate>
      <PermissionGate
        permissions={['nota_fiscal:emitir:create']}
        fallback={
          <div className="p-4">
            Você não tem permissão para emitir nota fiscal de consumidor.
          </div>
        }
      >
        <StandaloneNfceForm />
      </PermissionGate>
    </FiscalModuleGate>
  )
}
