import { Categories } from '../../components/Categories'

export function metadata() {
  return { title: 'Grupos de fornecedores' }
}

export default function SupplierCategoriesPage() {
  return <Categories context="supplier" />
}
