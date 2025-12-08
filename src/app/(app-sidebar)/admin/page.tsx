import { PermissionGate } from '@/components/common/PermissionGate'

export default function SystemHomePage() {
  return (
    <PermissionGate permissions={['admin:dashboard:view']}>
      <div className="space-y-4 mt-1 w-full">
        <div className="flex flex-wrap gap-4">
          <p className="text-gray-700 font-semibold text-base">Dashboard</p>
        </div>
      </div>
    </PermissionGate>
  )
}
