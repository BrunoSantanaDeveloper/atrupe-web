import { Topbar } from '@/components/common/Topbar'
import { NfcePdvClient } from './components/NfcePdvClient'
import { PermissionGate } from '@/components/common/PermissionGate'

export default function EmitirNfcePage() {
  return (
    <PermissionGate
      permissions={['nota_fiscal:emitir:create']}
      fallback={
        <div className="p-4">
          Você não tem permissão para emitir NFC-e.
        </div>
      }
    >
      <div className="space-y-4">
        <Topbar
          title="Emitir NFC-e"
          supportText="Ponto de venda — Nota Fiscal de Consumidor Eletrônica"
          previousPage="/nota-fiscal/emitidas"
        />
        <NfcePdvClient />
      </div>
    </PermissionGate>
  )
}
