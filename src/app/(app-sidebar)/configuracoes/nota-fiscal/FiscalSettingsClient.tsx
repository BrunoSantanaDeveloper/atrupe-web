'use client'

// Components
import { CompanySettingsList } from '../components/CompanySettingsList'

// Types
import type { CompanySettingsType } from '../components/CompanySettingsList'

// Icons
import {
  IconBuilding,
  IconArrowsSplit,
  IconSettings,
} from '@tabler/icons-react'

const defaultPath = 'nota-fiscal'

export function FiscalSettingsClient() {
  const settings: CompanySettingsType[] = [
    {
      category: 'Configurações Fiscais',
      items: [
        {
          title: 'Dados do Emissor',
          icon: IconBuilding,
          description: 'Configure os dados do emitente para suas notas fiscais',
          link: `${defaultPath}/emissores`,
          permission: 'invoice_settings:nf:view',
        },
        {
          title: 'Natureza de Operação e CFOP',
          icon: IconArrowsSplit,
          description:
            'Configure as naturezas de operação e CFOPs para emissão de notas',
          link: `${defaultPath}/cfop`,
          permission: 'invoice_settings:nf:view',
        },
        {
          title: 'Configurações Gerais',
          icon: IconSettings,
          description:
            'Configure séries, numeração e informações complementares padrão',
          link: `${defaultPath}/invoicy`,
          permission: 'invoice_settings:nf:view',
        },
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
