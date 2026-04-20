import { Metadata } from 'next'

// Components
import { FiscalModuleGate } from '../../../components/FiscalModuleGate'
import { PermissionGate } from '@/components/common/PermissionGate'
import { StandaloneNfseForm } from './components/StandaloneNfseForm'

export const metadata: Metadata = {
  title: 'NFS-e Nota Avulsa',
  description: 'Emissão de Nota Fiscal de Serviço Eletrônica Avulsa',
}

export default function NotaAvulsaNfsePage() {
  return (
    <FiscalModuleGate>
      <PermissionGate
        permissions={['nota_fiscal:emitir:create']}
        fallback={
          <div className="p-4">
            Você não tem permissão para emitir nota fiscal de serviço.
          </div>
        }
      >
        <StandaloneNfseForm />
      </PermissionGate>
    </FiscalModuleGate>
  )
}
