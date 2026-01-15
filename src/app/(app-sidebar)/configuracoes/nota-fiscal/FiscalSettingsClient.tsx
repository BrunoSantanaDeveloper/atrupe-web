'use client'

// Components
import { CompanySettingsList } from '../components/CompanySettingsList'

// Types
import type { CompanySettingsType } from '../components/CompanySettingsList'

// Icons
import {
  IconSettings,
  IconReceipt2,
  IconBuilding,
  IconArrowsSplit,
  IconPackage,
  IconBriefcase,
} from '@tabler/icons-react'

const defaultPath = 'nota-fiscal'

export function FiscalSettingsClient() {
  const settings: CompanySettingsType[] = [
    {
      category: 'Configurações Fiscais',
      items: [
        {
          title: 'Configurações Gerais',
          icon: IconSettings,
          description: 'Configure os parâmetros para emissão de notas fiscais',
          link: `${defaultPath}/invoicy`,
          permission: 'invoice_settings:nf:view',
        },
        {
          title: 'Configurar Emissores',
          icon: IconBuilding,
          description: 'Configure os dados do emitente para suas notas fiscais',
          link: `${defaultPath}/emissores`,
          permission: 'invoice_settings:nf:view',
        },
        {
          title: 'NF-e Natureza de Operação e CFOP',
          icon: IconArrowsSplit,
          description: 'Configure as naturezas de operação e CFOPs para NF-e',
          link: `${defaultPath}/cfop`,
          permission: 'invoice_settings:nf:view',
        },
        {
          title: 'NF-e - Lista de Produtos e Serviços',
          icon: IconPackage,
          description: 'Visualize e configure os produtos para emissão de NF-e',
          link: `${defaultPath}/produtos`,
          permission: 'invoice_settings:nf:view',
        },
        {
          title: 'NFS-e - Lista de Serviços',
          icon: IconBriefcase,
          description:
            'Visualize e configure os serviços para emissão de NFS-e',
          link: `${defaultPath}/servicos`,
          permission: 'invoice_settings:nf:view',
        },
        {
          title: 'Gestão de Notas Fiscais',
          icon: IconReceipt2,
          description:
            'Visualize, consulte e gerencie suas notas fiscais emitidas',
          link: `${defaultPath}/gestao`,
          permission: 'invoice_settings:nf:view',
        },
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
