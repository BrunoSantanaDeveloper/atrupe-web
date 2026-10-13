import { SectorCosts } from './components/SectorCosts'
import { pageTitle } from '@/lib/metadata'

export function metadata() {
  return { title: pageTitle('Por setor', 'Base de custos') }
}

export default function SectorCostsPage() {
  return <SectorCosts />
}
