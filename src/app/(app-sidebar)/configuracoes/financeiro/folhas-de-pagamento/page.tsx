// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'

export function metadata() {
  return {
    title: 'Folha de pagamento - Config.',
  }
}

// A folha filtra por setor e por colaborador dentro da própria tela, sem
// parâmetros na URL: escolher uma pessoa não é navegação
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
      <Main />
    </PermissionGate>
  )
}
