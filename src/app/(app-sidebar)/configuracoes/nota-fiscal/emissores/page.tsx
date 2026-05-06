// Components
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { EmissoresListClient } from './components/EmissoresListClient'

export function metadata() {
  return {
    title: 'Emissores de Nota Fiscal',
  }
}

export default function EmissoresConfigPage() {
  return (
    <PermissionGate permissions={['invoice:nfse:view']}>
      <div>
        <Topbar
          title="Emissores de Nota Fiscal"
          previousPage="/configuracoes/nota-fiscal"
        />
        <div className="p-6">
          <EmissoresListClient />
        </div>
      </div>
    </PermissionGate>
  )
}
