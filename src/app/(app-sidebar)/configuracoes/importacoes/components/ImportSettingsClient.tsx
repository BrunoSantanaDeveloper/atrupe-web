'use client'

// Components
import { CompanySettingsList } from '../../components/CompanySettingsList'
import { ImportClientModal } from '@/app/(app-sidebar)/cadastros/clientes/components/ImportClient/ImportClientModal'
import { ImportSupplierModal } from '@/app/(app-sidebar)/cadastros/fornecedores/components/ImportSupplier/ImportSupplierModal'
import { ImportProductModal } from '@/app/(app-sidebar)/configuracoes/produtos/components/ImportProduct/ImportProductModal'
import { ImportFinancialModal } from '@/app/(app-sidebar)/financeiro/fluxo-financeiro/components/ImportFinancial/ImportFinancialModal'
import { ImportQuotationModal } from '@/app/(app-sidebar)/vendas/orcamentos/components/ImportQuotation/ImportQuotationModal'
import { ImportOrderModal } from '@/app/(app-sidebar)/vendas/ordens-de-servico/components/ImportOrder/ImportOrderModal'

// Types
import type { CompanySettingsType } from '../../components/CompanySettingsList'

// Icons
import { IconUpload } from '@tabler/icons-react'

export function ImportSettingsClient() {
  const settings: CompanySettingsType[] = [
    {
      category: 'Importações',
      items: [
        {
          title: 'Importar clientes',
          icon: IconUpload,
          description: 'Traga sua base de clientes para o Atrupe.',
          cta: <ImportClientModal />,
          permission: 'import_settings:clients:view',
        },
        {
          title: 'Importar fornecedores',
          icon: IconUpload,
          description: 'Cadastre seus fornecedores no sistema.',
          cta: <ImportSupplierModal />,
          permission: 'import_settings:suppliers:view',
        },
        {
          title: 'Importar produtos',
          icon: IconUpload,
          description: 'Importe seus produtos ou serviços.',
          cta: <ImportProductModal />,
          permission: 'import_settings:products:view',
        },
        {
          title: 'Importar Orçamentos',
          icon: IconUpload,
          description: 'Importe seus orçamentos para o sistema.',
          cta: <ImportQuotationModal />,
          permission: 'import_settings:quotations:view',
        },
        {
          title: 'Importar ordens de serviço',
          icon: IconUpload,
          description: 'Importe suas ordens de serviço para o sistema.',
          cta: <ImportOrderModal />,
          permission: 'import_settings:quotations:view',
        },
        {
          title: 'Importar Receitas e Despesas',
          icon: IconUpload,
          description:
            'Traga suas receitas e despesas para o controle financeiro.',
          cta: <ImportFinancialModal />,
          permission: 'import_settings:financial:view',
        },
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
