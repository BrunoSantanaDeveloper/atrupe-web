import { CostSummaryView } from './components/CostSummaryView'
import { pageTitle } from '@/lib/metadata'

export function metadata() {
  return { title: pageTitle('Resumo', 'Base de custos') }
}

export default function CostSummaryPage() {
  return <CostSummaryView />
}
