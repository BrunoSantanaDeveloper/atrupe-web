// Components
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { EmissoresListClient } from './components/EmissoresListClient'

export function metadata() {
  return {
    title: 'Configurar Emissores',
  }
}

export default function EmissoresConfigPage() {
  return (
    <PermissionGate permissions={['invoice:nfse:view']}>
      <div>
        <Topbar
          title="Configurar Emissores"
          previousPage="/configuracoes/nota-fiscal"
        />
        <div className="p-6">
          <EmissoresListClient />
        </div>
      </div>
    </PermissionGate>
  )
}
