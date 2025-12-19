import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { GestaoNotasClient } from './components/GestaoNotasClient'

export default function GestaoNfePage() {
  return (
    <>
      <Topbar title="Gestao de Notas Fiscais" />

      <PermissionGate permissions={['invoice:nfse:view']}>
        <GestaoNotasClient />
      </PermissionGate>
    </>
  )
}
