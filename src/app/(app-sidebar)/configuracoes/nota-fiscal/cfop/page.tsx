// Components
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { CfopListClient } from './components/CfopListClient'

export function metadata() {
  return {
    title: 'NF-e Natureza de Operação e CFOP',
  }
}

export default function CfopConfigPage() {
  return (
    <PermissionGate permissions={['invoice:nfse:view']}>
      <div>
        <Topbar
          title="Natureza de Operação e CFOP"
          previousPage="/configuracoes/nota-fiscal"
        />
        <div className="p-6">
          <CfopListClient />
        </div>
      </div>
    </PermissionGate>
  )
}

