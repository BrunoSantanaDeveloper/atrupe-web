// Components
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ServicosFiscaisClient } from './components/ServicosFiscaisClient'

export function metadata() {
  return {
    title: 'NFS-e - Lista de Serviços',
  }
}

export default function ServicosFiscaisPage() {
  return (
    <PermissionGate permissions={['invoice:nfse:view']}>
      <div>
        <Topbar
          title="Lista de Serviços"
          previousPage="/configuracoes/nota-fiscal"
        />
        <div className="p-6">
          <ServicosFiscaisClient />
        </div>
      </div>
    </PermissionGate>
  )
}
