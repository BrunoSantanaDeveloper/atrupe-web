'use client'

// Components
import { CompanyInfo } from '../components/CompanyInfo'
import { CompanySettingsList } from '../../components/CompanySettingsList'

// Types
import type { CompanySettingsType } from '../../components/CompanySettingsList'

// Icons
import {
  IconRuler2,
  IconBuilding,
  IconFileDollar,
  IconUserShield,
  IconSettingsCog,
} from '@tabler/icons-react'
import { MeasureDefaultsDialog } from '../padrao-de-medida/components/MeasureDefaultsDialog'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

const defaultPath = 'empresa-e-sistema'

export function CompanySettingsClient() {
  const { canManageSectors } = usePlanFeatures()

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
          permission: 'company_settings:company:edit',
        },
        {
          title: 'Assinatura',
          icon: IconFileDollar,
          description:
            'Gerencie a assinatura do seu plano, usuários adicionais e faturas.',
          link: `${defaultPath}/assinatura`,
          permission: 'company_settings:subscription:view',
        },
        // Setores é recurso de plano (configurado pelo superadmin).
        ...(canManageSectors()
          ? [
              {
                title: 'Setores',
                icon: IconSettingsCog,
                description:
                  'Defina os setores da sua empresa que serão utilizados em cadastros e etapas de produção.',
                link: `${defaultPath}/setores`,
                permission: 'company_settings:sectors:view',
              },
            ]
          : []),
        {
          title: 'Padrão de medida',
          icon: IconRuler2,
          description:
            'Defina os padrões usados para quantificar diferentes propriedades.',
          cta: <MeasureDefaultsDialog />,
          permission: 'company_settings:measurement_standards:edit',
        },
        {
          title: 'Colaboradores e usuários',
          icon: IconUserShield,
          description: 'Gerencie os usuários e suas permissões',
          link: `${defaultPath}/colaboradores-e-usuarios`,
          permission: 'company_settings:users:view',
        },
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
