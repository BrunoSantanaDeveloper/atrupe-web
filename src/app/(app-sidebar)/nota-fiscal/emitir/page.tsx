// Components
import { IssueInvoice } from './components/IssueInvoice'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { SearchParamsType } from '@/types/coreTypes'

/**
 * A pagina hospeda duas abas com permissoes distintas: emissao e consulta das
 * notas emitidas. Basta UMA delas para entrar; o EmitirTabsWrapper esconde a
 * aba que o usuario nao pode acessar.
 */
export default function IssueInvoicePage({ searchParams }: SearchParamsType) {
  return (
    <PermissionGate
      permissions={['nota_fiscal:emitir:create', 'nota_fiscal:emitidas:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para acessar as notas fiscais.
        </div>
      }
    >
      <div className="flex flex-col h-full space-y-4">
        <IssueInvoice searchParams={searchParams} />
      </div>
    </PermissionGate>
  )
}
