'use client'

import { useSession } from 'next-auth/react'

// Components
import { CompanyInfo } from '../components/CompanyInfo'

// Hooks / Consts
import { FEATURES } from '@/consts/features'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { CompanySettingsList } from '../../components/CompanySettingsList'

// Types
import type { CompanySettingsType } from '../../components/CompanySettingsList'

// Icons
import {
  IconRuler2,
  IconBuilding,
  IconCalendarTime,
  IconFileDollar,
  IconUserShield,
  IconSettingsCog,
  IconBuildingWarehouse,
} from '@tabler/icons-react'
import { MeasureDefaultsDialog } from '../padrao-de-medida/components/MeasureDefaultsDialog'

const defaultPath = 'empresa-e-sistema'

export function CompanySettingsClient() {
  const { canManageSectors, hasFeature } = usePlanFeatures()
  const { data: session } = useSession()
  const isAdmin = !!session?.user?.isAdmin

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
        // Assinatura é só do administrador (troca de plano, cancelamento e
        // contrato): não se concede pela tela de cargos
        ...(isAdmin
          ? [
              {
                title: 'Assinatura',
                icon: IconFileDollar,
                description:
                  'Gerencie a assinatura do seu plano, usuários adicionais e faturas.',
                link: `${defaultPath}/assinatura`,
              },
            ]
          : []),
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
        // O expediente da empresa é do ELITE (GP-49): o padrão de cada
        // gerenciador novo; o cadastro fica com o da produção
        ...(hasFeature(FEATURES.PRODUCTION.PRODUCTION_MANAGER)
          ? [
              {
                title: 'Expediente',
                icon: IconCalendarTime,
                description:
                  'Dias e horário de trabalho, intervalo e feriados. Cada setor novo da produção começa com esse horário.',
                link: 'producao?aba=expediente',
                permission: 'production:production:view',
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
        // Recurso do PRO: aparece só quando o plano tiver a chave
        ...(hasFeature(FEATURES.COSTS.COST_BASE)
          ? [
              {
                title: 'Patrimônios',
                icon: IconBuildingWarehouse,
                description:
                  'Cadastre máquinas, equipamentos, móveis e veículos, com depreciação e custo por unidade',
                link: `${defaultPath}/patrimonios`,
                permission: ['cost:base:view', 'values:values:view'],
                demo: true,
              },
            ]
          : []),
      ],
    },
  ]

  return <CompanySettingsList settings={settings} />
}
