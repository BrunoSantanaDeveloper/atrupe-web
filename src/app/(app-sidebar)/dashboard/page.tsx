// Component Imports
import { Dashboard } from './components/Dashboard'

export function metadata() {
  return {
    title: 'Painel',
  }
}

export default async function DashboardPage() {
  return <Dashboard />
}
