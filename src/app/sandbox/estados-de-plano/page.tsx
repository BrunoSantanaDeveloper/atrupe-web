'use client'

// Vitrine dos estados de plano (plano de implantação dos planos, Fase 1):
// o que o cliente vê quando um recurso está fora do plano dele, pela parede
// da tela e pelos avisos das ações. As paredes usam a mesma função de texto
// e o mesmo componente da tela real, com o plano e o papel fixados aqui.

// UI
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Heading, Text } from '@/components/ui/typography'

// Components
import {
  UpgradeWallView,
  describeWallAvailability,
} from '@/components/common/UpgradeFallback'

// Hooks
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'

// Types
import type { PlanAvailableFrom, PlanError } from '@/types/planError'

const LITE: PlanAvailableFrom = {
  planType: 'LITE',
  name: 'Lite',
  isActive: true,
}
const PRO_SOON: PlanAvailableFrom = {
  planType: 'PRO',
  name: 'Pro',
  isActive: false,
}

interface WallSample {
  label: string
  note: string
  kind: 'plan' | 'module'
  /** `undefined`: o mapa de chaves não chegou; `null`: nenhum plano tem. */
  availableFrom?: PlanAvailableFrom | null
  isOwner: boolean
  /** O mapa de planos ainda está chegando. */
  loading?: boolean
  title: string
  description: string
}

const WALLS: WallSample[] = [
  {
    label: 'Titular, plano à venda',
    note: 'O botão leva à contratação.',
    kind: 'plan',
    availableFrom: LITE,
    isOwner: true,
    title: 'Controle de caixa',
    description: 'A abertura, o fechamento e a conferência do caixa do dia.',
  },
  {
    label: 'Colaborador, plano à venda',
    note: 'Só o titular contrata: o texto diz a quem pedir.',
    kind: 'plan',
    availableFrom: LITE,
    isOwner: false,
    title: 'Controle de caixa',
    description: 'A abertura, o fechamento e a conferência do caixa do dia.',
  },
  {
    label: 'Plano ainda fora de venda',
    note: 'Sem botão e sem pedido: não há o que contratar.',
    kind: 'plan',
    availableFrom: PRO_SOON,
    isOwner: true,
    title: 'Base de custos',
    description:
      'O custo de cada setor, com mão de obra, despesas e patrimônios.',
  },
  {
    label: 'Nenhum plano tem o recurso',
    note: 'A chave existe e está fora de todos os planos.',
    kind: 'plan',
    availableFrom: null,
    isOwner: true,
    title: 'Faturamento na entrega',
    description: 'O faturamento da venda na entrega ou na frente de caixa.',
  },
  {
    label: 'Carregando o mapa de planos',
    note: 'O texto e o botão esperam o mapa, para não trocarem depois de aparecer.',
    kind: 'plan',
    availableFrom: undefined,
    isOwner: true,
    loading: true,
    title: 'Controle de caixa',
    description: 'A abertura, o fechamento e a conferência do caixa do dia.',
  },
  {
    label: 'Sem o mapa de planos',
    note: 'O mapa falhou: o texto é o genérico e o botão continua.',
    kind: 'plan',
    availableFrom: undefined,
    isOwner: true,
    title: 'Contas a pagar',
    description: 'Os lançamentos a pagar, com baixa, estorno e cancelamento.',
  },
  {
    label: 'Módulo à parte, titular',
    note: 'A Nota Fiscal é contratada fora da trilha de planos.',
    kind: 'module',
    isOwner: true,
    title: 'Nota Fiscal',
    description: 'A emissão de NF-e, NFC-e e NFS-e a partir das vendas.',
  },
  {
    label: 'Módulo à parte, colaborador',
    note: 'O mesmo módulo para quem não é o titular.',
    kind: 'module',
    isOwner: false,
    title: 'Nota Fiscal',
    description: 'A emissão de NF-e, NFC-e e NFS-e a partir das vendas.',
  },
]

interface NoticeSample {
  label: string
  note: string
  error: PlanError
}

const NOTICES: NoticeSample[] = [
  {
    label: 'Recurso fora do plano, plano à venda',
    note: 'Aviso de erro com o texto do servidor. O titular vê "Ver planos".',
    error: {
      code: 'FEATURE_NOT_AVAILABLE',
      feature: 'cash_control',
      planType: 'START',
      availableFrom: LITE,
      message:
        'O recurso "Controle de caixa" está disponível a partir do plano Lite.',
    },
  },
  {
    label: 'Recurso fora do plano, plano fora de venda',
    note: 'Sem "Ver planos": não há o que contratar.',
    error: {
      code: 'FEATURE_NOT_AVAILABLE',
      feature: 'cost_base',
      planType: 'LITE',
      availableFrom: PRO_SOON,
      message:
        'O recurso "Base de custos" está disponível a partir do plano Pro.',
    },
  },
  {
    label: 'Limite de usuários',
    note: 'Diálogo com o plano e o máximo.',
    error: {
      code: 'PLAN_LIMIT_REACHED',
      limit: 'max_users',
      value: 3,
      planType: 'START',
      message:
        'Limite do plano Start atingido: usuários (máximo 3). Evolua o plano ou contrate adicionais para aumentar.',
    },
  },
]

export default function EstadosDePlanoSandbox() {
  const { notifyPlanError } = usePlanErrorToast()

  return (
    <main className="min-h-screen space-y-8 bg-gray-100 p-6">
      <header className="space-y-1">
        <Heading as="h1">Estados de plano</Heading>
        <Text variant="page-subtitle">
          O que o cliente vê quando um recurso está fora do plano dele.
        </Text>
      </header>

      <section className="space-y-4">
        <Heading as="h2">Parede da tela</Heading>
        <Text variant="secondary">
          O plano que libera o recurso vem do mapa de chaves do servidor, e o
          botão só aparece para o titular da conta. Aqui o plano e o papel estão
          fixados para mostrar cada caso.
        </Text>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {WALLS.map((wall) => {
            const { availability, contractable } = describeWallAvailability(
              wall.kind,
              wall.availableFrom,
            )

            return (
              <Card key={wall.label}>
                <CardHeader>
                  <CardTitle>{wall.label}</CardTitle>
                  <CardDescription>{wall.note}</CardDescription>
                </CardHeader>
                <CardContent className="border-t border-gray-200">
                  <UpgradeWallView
                    title={wall.title}
                    description={wall.description}
                    availability={availability}
                    contractable={contractable}
                    isOwner={wall.isOwner}
                    loading={wall.loading}
                    kind={wall.kind}
                  />
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <Heading as="h2">Aviso da ação</Heading>
        <Text variant="secondary">
          Quando a API recusa uma ação por plano. Os avisos usam a sua sessão:
          entre como titular e como colaborador para ver os dois textos.
        </Text>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {NOTICES.map((notice) => (
            <Card key={notice.label}>
              <CardHeader>
                <CardTitle>{notice.label}</CardTitle>
                <CardDescription>{notice.note}</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => notifyPlanError(notice.error)}
                >
                  Mostrar o aviso
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
