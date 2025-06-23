import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const ProductWrapper = () => {
  const [open, setOpen] = useState(true)
  const NewProduct = dynamic(() =>
    import(
      '@/app/(app-sidebar)/configuracoes/produtos/components/NewProduct'
    ).then((module) => ({ default: module.NewProduct })),
  )
  return <NewProduct open={open} onOpenChange={setOpen} />
}

export const modalRegistry: Record<string, React.ComponentType<unknown>> = {
  CompanyInfoModal: dynamic(
    () =>
      import(
        '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/components/CompanyInfo'
      ).then((module) => ({ default: module.CompanyInfo })),
    {
      loading: () => (
        <Button size="sm" isLoading>
          Aguarde
        </Button>
      ),
      ssr: false,
    },
  ),
  MeasureStandards: dynamic(
    () =>
      import(
        '@/app/(app-sidebar)/configuracoes/empresa-e-sistema/padrao-de-medida/components/Dialog'
      ).then((module) => ({ default: module.MeasureDefaultsDialog })),
    {
      loading: () => (
        <Button size="sm" isLoading>
          Aguarde
        </Button>
      ),
      ssr: false,
    },
  ),
  ProductManagementModal: ProductWrapper,
  // Adicione outros modais aqui - cada um só carrega quando usado!
}
