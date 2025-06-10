// Component Imports
import { CompanySettingsList } from '../components/CompanySettingsList'

// Type Imports
import type { CompanySettingsType } from '../components/CompanySettingsList'

// Icon Imports
import { IconSettings } from '@tabler/icons-react'

const defaultPath = 'gerenciamento-de-projetos'

const settings: CompanySettingsType[] = [
  {
    category: 'Gerenciamento de projetos',
    items: [
      {
        title: 'Título',
        icon: IconSettings,
        description: 'Edite as informações da sua empresa',
        link: `${defaultPath}/#`,
      },
    ],
  },
]

export default function ProjectManagementSettings() {
  return <CompanySettingsList settings={settings} />
}
