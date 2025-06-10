// Components
import { CompanyInfo } from './components/CompanyInfo'
import { CompanySettingsList } from '../components/CompanySettingsList'

// Types
import type { CompanySettingsType } from '../components/CompanySettingsList'

// Icons
import {
  IconRuler2,
  IconBuilding,
  IconUserShield,
  IconSettingsCog,
} from '@tabler/icons-react'
import { MeasureDefaultsDialog } from './padrao-de-medida/components/Dialog'

export function metadata() {
  return {
    title: 'Configurações da Empresa e do Sistema',
  }
}

const defaultPath = 'empresa-e-sistema'

const settings: CompanySettingsType[] = [
  {
    category: 'Empresa e sistema',
    items: [
      {
        title: 'Configuração da empresa',
        icon: IconBuilding,
        description:
          'Defina as informações gerais, endereços e personalização de marca de uma ou mais empresas.',
        cta: <CompanyInfo />,
      },
      {
        title: 'Setores',
        icon: IconSettingsCog,
        description:
          'Defina os setores da sua empresa que serão utilizados em cadastros e etapas de produção.',
        link: `${defaultPath}/setores`,
      },
      {
        title: 'Padrão de medida',
        icon: IconRuler2,
        description:
          'Defina os padrões usados para quantificar diferentes propriedades.',
        cta: <MeasureDefaultsDialog />,
      },
      {
        title: 'Colaboradores e usuários',
        icon: IconUserShield,
        description: 'Gerencie os usuários e suas permissões',
        link: `${defaultPath}/colaboradores-e-usuarios`,
      },
    ],
  },
]

export default function CompanySystemSettings() {
  return <CompanySettingsList settings={settings} />
}
