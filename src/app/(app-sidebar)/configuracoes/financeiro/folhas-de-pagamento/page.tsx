// Components
import { Main } from './components/Main'
import { PermissionGate } from '@/components/common/PermissionGate'
import { pageTitle } from '@/lib/metadata'

export function metadata() {
  return {
    title: pageTitle('Folhas de pagamento', 'Configurações'),
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
