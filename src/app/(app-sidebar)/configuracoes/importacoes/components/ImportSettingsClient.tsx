'use client'

// Components
import { CompanySettingsList } from '../../components/CompanySettingsList'
import { ImportClientModal } from '@/app/(app-sidebar)/cadastros/clientes/components/ImportClient/ImportClientModal'
import { ImportProductModal } from '@/app/(app-sidebar)/configuracoes/produtos/components/ImportProduct/ImportProductModal'
import { ImportFinancialModal } from '@/app/(app-sidebar)/financeiro/fluxo-financeiro/components/ImportFinancial/ImportFinancialModal'

// Types
import type { CompanySettingsType } from '../../components/CompanySettingsList'

// UI
import { Button } from '@/components/ui/button'

// Icons
import { IconUpload } from '@tabler/icons-react'

export function ImportSettingsClient() {
  const settings: CompanySettingsType[] = [
    {
      category: 'Importações',
      items: [
        {
          title: 'Importar Clientes',
          icon: IconUpload,
          description: 'Traga sua base de clientes para o Atrupe.',
          cta: <ImportClientModal />,
        },
        {
          title: 'Importar Fornecedores',
          icon: IconUpload,
          description: 'Cadastre seus fornecedores no sistema.',
          cta: (
            <Button disabled variant="neutralOutline">
              Em breve
            </Button>
          ),
        },
        {
          title: 'Importar Produtos',
          icon: IconUpload,
          description: 'Importe seus produtos ou serviços.',
          cta: <ImportProductModal />,
        },
        {
          title: 'Importar Receitas e Despesas',
          icon: IconUpload,
          description:
            'Traga suas receitas e despesas para o controle financeiro.',
          cta: <ImportFinancialModal />,
        },
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
