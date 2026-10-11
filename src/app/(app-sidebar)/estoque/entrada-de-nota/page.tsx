import { InvoiceEntry } from './components/InvoiceEntry'
import { FeatureGate } from '@/components/common/FeatureGate'
import { PermissionGate } from '@/components/common/PermissionGate'

// Consts
import { FEATURES } from '@/consts/features'

export function metadata() {
  return { title: 'Entrada de nota' }
}

export default function InvoiceEntryPage() {
  return (
    <PermissionGate
      permissions={['stock:invoice_entry:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar a entrada de nota.
        </div>
      }
    >
      <FeatureGate
        features={[FEATURES.STOCK.INVOICE_ENTRY]}
        wall={{
          title: 'Entrada de nota',
          description:
            'Cada item da nota vira material interno, com a conversão da unidade de compra.',
          pageTitle: true,
        }}
      >
        <InvoiceEntry />
      </FeatureGate>
    </PermissionGate>
  )
}
