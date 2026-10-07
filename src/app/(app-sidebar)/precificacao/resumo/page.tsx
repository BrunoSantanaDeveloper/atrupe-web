import { PricingSummaryView } from './components/PricingSummaryView'
import { pageTitle } from '@/lib/metadata'

export function metadata() {
  return { title: pageTitle('Resumo', 'Precificação') }
}

export default function PricingSummaryPage() {
  return <PricingSummaryView />
}
