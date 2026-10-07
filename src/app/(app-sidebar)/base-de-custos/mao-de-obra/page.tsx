import { LaborCosts } from './components/LaborCosts'
import { pageTitle } from '@/lib/metadata'

export function metadata() {
  return { title: pageTitle('Mão de obra', 'Base de custos') }
}

export default function LaborCostsPage() {
  return <LaborCosts />
}
