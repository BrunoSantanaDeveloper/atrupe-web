// Components
import { PayrollStructure } from './components/PayrollStructure'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Folha de pagamento - Config.',
  }
}

export default function Page() {
  return (
    <PermissionGate
      requireAll
      permissions={['financial_settings:payroll:view', 'values:values:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações de folha de
          pagamento.
        </div>
      }
    >
      {/* A estrutura da folha (ALT-18 e ALT-19) na API: acréscimo, desconto
          e comportamento por item, e os encargos da CLT gerados do salário */}
      <PayrollStructure />
    </PermissionGate>
  )
}
