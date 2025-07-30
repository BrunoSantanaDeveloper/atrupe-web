import { Categories } from '../../components/Categories'

export function metadata() {
  return { title: 'Grupos de clientes' }
}

export default function ClientCategoriesPage() {
  return <Categories context="client" />
}
