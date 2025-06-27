import { Categories } from '../../components/Categories'

export function metadata() {
  return { title: 'Categorias de fornecedores' }
}

export default function SupplierCategoriesPage() {
  return <Categories context="supplier" />
}
