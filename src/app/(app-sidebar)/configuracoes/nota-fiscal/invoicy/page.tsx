// Components
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { InvoicyConfigForm } from './components/InvoicyConfigForm'

export function metadata() {
  return {
    title: 'Configuração do Invoicy',
  }
}

export default function InvoicyConfigPage() {
  return (
    <PermissionGate permissions={['invoice:nfse:view']}>
      <div>
        <Topbar title="Configuração do Invoicy" backUrl="/configuracoes/nota-fiscal" />
        <div className="p-6">
          <InvoicyConfigForm />
        </div>
      </div>
    </PermissionGate>
  )
}
