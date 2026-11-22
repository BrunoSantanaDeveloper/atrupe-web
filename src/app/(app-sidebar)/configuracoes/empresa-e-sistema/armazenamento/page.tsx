// Components
import { StorageOverviewClient } from './components/StorageOverview'
import { AdminGate } from '@/components/common/AdminGate'

export function metadata() {
  return {
    title: 'Armazenamento',
  }
}

export default function Page() {
  return (
    // Só o administrador: a limpeza apaga arquivos e não tem volta
    <AdminGate
      fallback={
        <div className="p-4">
          Só o administrador da empresa vê o armazenamento.
        </div>
      }
    >
      <StorageOverviewClient />
    </AdminGate>
  )
}
