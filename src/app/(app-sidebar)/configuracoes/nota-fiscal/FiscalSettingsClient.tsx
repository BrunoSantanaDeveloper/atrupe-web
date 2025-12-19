'use client'

// Components
import { CompanySettingsList } from '../components/CompanySettingsList'

// Types
import type { CompanySettingsType } from '../components/CompanySettingsList'

// Icons
import { IconSettings, IconReceipt2 } from '@tabler/icons-react'

const defaultPath = 'nota-fiscal'

export function FiscalSettingsClient() {
  const settings: CompanySettingsType[] = [
    {
      category: 'Configurações Fiscais',
      items: [
        {
          title: 'Configurações Gerais',
          icon: IconSettings,
          description:
            'Configure os parâmetros para emissão de notas fiscais',
          link: `${defaultPath}/invoicy`,
        },
        {
          title: 'Gestão de Notas Fiscais',
          icon: IconReceipt2,
          description:
            'Visualize, consulte e gerencie suas notas fiscais emitidas',
          link: `${defaultPath}/gestao`,
        },
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
