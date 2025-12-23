import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

export default function SessionsPage() {
  return (
    <PermissionGate permissions={['admin:sessions:view']}>
      <Main />
    </PermissionGate>
  )
}
