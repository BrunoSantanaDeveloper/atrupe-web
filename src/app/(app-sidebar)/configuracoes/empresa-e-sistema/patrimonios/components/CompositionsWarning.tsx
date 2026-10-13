// Types
import type { AssetComposition } from '../types'

interface Props {
  compositions: AssetComposition[]
}

// De detalhado para simplificado, as configurações do bem saem: a API recusa
// enquanto alguma está em composição e devolve a lista, que a tela mostra
// antes de pedir a confirmação (P-16)
export function CompositionsWarning({ compositions }: Props) {
  return (
    <div className="space-y-1 rounded-lg border border-warning-200 bg-warning-25 p-3 text-sm text-warning-700">
      <p>
        As configurações deste bem são usadas nestas composições, que perdem o
        custo da máquina ao simplificar o cadastro:
      </p>
      <ul className="list-disc pl-5">
        {compositions.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            {item.kind === 'PROCESS' ? 'Processo' : 'Produto'} {item.name}
          </li>
        ))}
      </ul>
    </div>
  )
}
