// Components
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { InvoicyConfigForm } from './components/InvoicyConfigForm'

export function metadata() {
  return {
    title: 'Configurações Gerais',
  }
}

export default function InvoicyConfigPage() {
  return (
    <PermissionGate permissions={['invoice_settings:nf:view']}>
      <div>
        <Topbar
          title="Configurações Gerais"
          previousPage="/configuracoes/nota-fiscal"
        />
        <div className="p-6">
          <InvoicyConfigForm />
        </div>
      </div>
    </PermissionGate>
  )
}
