'use client'

import { PermissionGate } from '@/components/common/PermissionGate'

export default function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PermissionGate
      permissions={['values:values:view']}
      fallback={
        <div className="p-4 text-gray-700">
          Você não tem permissão para acessar o financeiro.
        </div>
      }
    >
      {children}
    </PermissionGate>
  )
}
