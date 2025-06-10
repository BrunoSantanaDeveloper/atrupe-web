import { Topbar } from '@/components/common/Topbar'
import { UnderConstruction } from '@/components/UnderConstruction'

export function metadata() {
  return {
    title: 'Configurações de Nota Fiscal',
  }
}

export default function InvoicePage() {
  return (
    <div>
      <Topbar title="Nota fiscal" />
      <UnderConstruction />
    </div>
  )
}
