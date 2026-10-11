import { Distribution } from './components/Distribution'
import { pageTitle } from '@/lib/metadata'

export function metadata() {
  return { title: pageTitle('Distribuição', 'Base de custos') }
}

export default function DistributionPage() {
  return <Distribution />
}
