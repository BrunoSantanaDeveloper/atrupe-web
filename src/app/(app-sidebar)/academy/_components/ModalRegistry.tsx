import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'

export const modalRegistry: Record<string, React.ComponentType> = {
  CompanyInfo: dynamic(
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
  // Adicione outros modais aqui - cada um só carrega quando usado!
}
