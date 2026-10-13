'use client'

// Components
import { CompanySettingsList } from '../components/CompanySettingsList'

// Types
import type { CompanySettingsType } from '../components/CompanySettingsList'

// Icons
import { IconBuilding, IconArrowsSplit } from '@tabler/icons-react'

const defaultPath = 'nota-fiscal'

export function FiscalSettingsClient() {
  const settings: CompanySettingsType[] = [
    {
      category: 'Configurações fiscais',
      items: [
        {
          title: 'Dados do emissor',
          icon: IconBuilding,
          description:
            'Configure emitente, séries, numeração e padrões para emissão de notas fiscais',
          link: `${defaultPath}/emissores`,
          permission: 'nota_fiscal:config:view',
        },
        {
          title: 'Natureza de operação e CFOP',
          icon: IconArrowsSplit,
          description:
            'Configure as naturezas de operação e CFOPs para emissão de notas',
          link: `${defaultPath}/cfop`,
          permission: 'nota_fiscal:config:view',
        },
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
