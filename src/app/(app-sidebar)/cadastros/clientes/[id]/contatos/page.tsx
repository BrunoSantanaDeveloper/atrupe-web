import { PermissionGate } from '@/components/common/PermissionGate'
import { FeatureGate } from '@/components/common/FeatureGate'
import { FEATURES } from '@/consts/features'
import { ClientContacts } from './components/ClientContacts'

interface Props {
  params: { id: string }
}

// A aba Contatos do cliente (CRM-4, 27/10/2026): a linha do tempo dos
// contatos de todos os orçamentos, a última compra e há quantos dias
export default function ClientContactsPage({ params }: Props) {
  return (
    <PermissionGate
      permissions={['sale:quotation:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar os contatos.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.CONTACTS.CLIENT_ADDITIONAL_TABS]}
        wall={{
          title: 'Abas adicionais de cliente',
          description:
            'A aba Contatos reúne no cadastro o acompanhamento comercial do cliente.',
        }}
      >
        <div className="my-6">
          <ClientContacts clientId={params.id} />
        </div>
      </FeatureGate>
    </PermissionGate>
  )
}
