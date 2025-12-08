// Component Imports
import { CompanySettingsList } from '../components/CompanySettingsList'
import { PermissionGate } from '@/components/common/PermissionGate'

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
  return (
    <PermissionGate
      permissions={['project_management:settings:view']}
      fallback={
        <div className="p-4">
          Você não tem permissão para visualizar as configurações de
          gerenciamento de projetos.
        </div>
      }
    >
      <CompanySettingsList settings={settings} />
    </PermissionGate>
  )
}
