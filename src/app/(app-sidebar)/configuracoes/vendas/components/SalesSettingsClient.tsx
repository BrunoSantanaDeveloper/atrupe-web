'use client'

// Component Imports
import { CompanySettingsList } from '../../components/CompanySettingsList'

// Type Imports
import type { CompanySettingsType } from '../../components/CompanySettingsList'

// Icon Imports
import {
  IconBolt,
  IconUserCircle,
  IconStatusChange,
  IconTransactionDollar,
  IconAlertSquareRounded,
  IconRoute,
  IconTruckDelivery,
} from '@tabler/icons-react'

// Hooks / Consts
import { FEATURES } from '@/consts/features'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'

const defaultPath = 'vendas'

export function SalesSettingsClient() {
  const { canManageRejectionReasons, canManageBudgetStatus, hasFeature } =
    usePlanFeatures()

  const allSettings: CompanySettingsType[] = [
    {
      category: 'Vendas',
      items: [
        // Recurso do LITE: a venda de balcão, sem cadastro (área 12, VR-4)
        ...(hasFeature(FEATURES.SALES.QUOTATION_QUICK_SALE)
          ? [
              {
                title: 'Venda rápida',
                icon: IconBolt,
                description:
                  'Pule o cadastro do orçamento e caia direto na escolha do item.',
                link: `${defaultPath}/venda-rapida`,
                permission: 'sales_settings:series:view',
                demo: true,
              },
            ]
          : []),
        {
          title: 'Séries de venda',
          icon: IconTransactionDollar,
          description: 'Defina os padrões básicos de vendas.',
          link: `${defaultPath}/series-de-venda`,
          permission: 'sales_settings:series:view',
        },
        // O markup padrão do terceirizado avulso (MS-16, T-4), do LITE em
        // diante, junto do "Acrescentar a este item" (API desde a Fase 4.2)
        ...(hasFeature(FEATURES.PRODUCTS.PRODUCT_COMPOSITION)
          ? [
              {
                title: 'Terceirizado avulso',
                icon: IconTruckDelivery,
                description:
                  'Defina o markup padrão aplicado ao custo do terceirizado lançado na hora.',
                link: `${defaultPath}/terceirizados`,
                permission: 'sales_settings:series:view',
              },
            ]
          : []),
        {
          title: 'Origens de contato',
          icon: IconRoute,
          description: 'Gerencie as origens de onde seus clientes chegam.',
          link: `${defaultPath}/origens-de-contato`,
        },
        {
          title: 'Perfil de vendedor',
          icon: IconUserCircle,
          description: 'Gerencie os vendedores, suas comissões e permissões.',
          link: `${defaultPath}/perfil-de-vendedor`,
          permission: 'sales_settings:seller_profile:view',
        },
        ...(canManageRejectionReasons()
          ? [
              {
                title: 'Motivos de rejeição e cancelamento',
                icon: IconAlertSquareRounded,
                description:
                  'Defina motivos para mapear rejeições e cancelamentos.',
                link: `${defaultPath}/motivos-de-rejeicao-e-cancelamento`,
                permission: 'sales_settings:rejection_reasons:view',
              },
            ]
          : []),
        ...(canManageBudgetStatus()
          ? [
              {
                title: 'Status de orçamento',
                icon: IconStatusChange,
                description: 'Defina status para acompanhamento das propostas.',
                link: `${defaultPath}/status-de-orcamento`,
                permission: 'sales_settings:quotation_status:view',
              },
            ]
          : []),
      ],
    },
  ]

  return <CompanySettingsList settings={allSettings} />
}
