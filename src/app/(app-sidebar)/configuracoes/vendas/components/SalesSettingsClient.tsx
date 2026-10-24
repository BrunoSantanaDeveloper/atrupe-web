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
        // Primeiro o que todo plano tem (START), do mais usado ao menos;
        // depois o que entra no LITE (decisão do produto, 24/10/2026)
        {
          title: 'Séries de venda',
          icon: IconTransactionDollar,
          description: 'Defina os padrões básicos de vendas.',
          link: `${defaultPath}/series-de-venda`,
          permission: 'sales_settings:series:view',
        },
        {
          title: 'Perfil de vendedor',
          icon: IconUserCircle,
          description: 'Gerencie os vendedores, suas comissões e permissões.',
          link: `${defaultPath}/perfil-de-vendedor`,
          permission: 'sales_settings:seller_profile:view',
        },
        {
          title: 'Origens de contato',
          icon: IconRoute,
          description: 'Gerencie as origens de onde seus clientes chegam.',
          link: `${defaultPath}/origens-de-contato`,
          permission: 'sales_settings:contact_sources:view',
        },
        // O acréscimo sobre o custo do terceirizado avulso (MS-16, T-4),
        // já no START (T-5), junto do "Acrescentar a este item"
        ...(hasFeature(FEATURES.SALES.OUTSOURCED_ITEM)
          ? [
              {
                title: 'Terceirizado avulso',
                icon: IconTruckDelivery,
                description:
                  'Defina o acréscimo sobre o custo do terceirizado lançado na hora.',
                link: `${defaultPath}/terceirizados`,
                permission: 'sales_settings:series:view',
              },
            ]
          : []),
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
      ],
    },
  ]

  return <CompanySettingsList settings={allSettings} />
}
