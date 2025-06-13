// Component Imports
import { Dashboard } from './components/Dashboard'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Dashboard',
  }
}

export default async function DashboardPage() {
  return (
    <PermissionGate
      permissions={[
        'reports:sales_dashboard:view',
        'reports:results_dashboard:view',
      ]}
      requireAll={false}
      fallback={
        <div className="p-4 text-center">
          <h3 className="text-lg font-medium mb-2">Acesso restrito</h3>
          <p className="text-gray-600">
            Você não tem permissão para visualizar o dashboard.
          </p>
        </div>
      }
    >
      <Dashboard />
    </PermissionGate>
  )
}
