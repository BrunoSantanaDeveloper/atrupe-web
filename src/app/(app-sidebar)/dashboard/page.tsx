// Component Imports
import { Dashboard } from './components/Dashboard'

export function metadata() {
  return {
    title: 'Dashboard',
  }
}

export default async function DashboardPage() {
  return <Dashboard />
}
