// Components
import { Topbar } from '@/components/common/Topbar'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ProdutosFiscaisClient } from './components/ProdutosFiscaisClient'

export function metadata() {
  return {
    title: 'NF-e - Lista de Produtos e Serviços',
  }
}

export default function ProdutosFiscaisPage() {
  return (
    <PermissionGate permissions={['invoice:nfse:view']}>
      <div>
        <Topbar
          title="Lista de Produtos e Serviços"
          previousPage="/configuracoes/nota-fiscal"
        />
        <div className="p-6">
          <ProdutosFiscaisClient />
        </div>
      </div>
    </PermissionGate>
  )
}
