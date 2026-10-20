// Vitrine dos ícones — design/openspec/changes/icones
import { IconChevronRight, IconLayoutGrid, IconPlus } from '@tabler/icons-react'

import * as Pictogramas from '@/assets/icons/pictogramas'
import * as Logos from '@/assets/logos'
import { ActionButton } from '@/components/common/ActionButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FeaturedIcon,
  type FeaturedIconTone,
} from '@/components/ui/featured-icon'
import { ICON_SIZE, Icon, type IconSize } from '@/components/ui/icon'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Heading, Text } from '@/components/ui/typography'
import { ICONE, type Gesto } from '@/consts/icones'

export const metadata = { title: 'Ícones · Sandbox' }

const SIZES: { size: IconSize; uso: string }[] = [
  { size: 'sm', uso: 'Texto em linha, botão pequeno, chip, badge' },
  { size: 'md', uso: 'Botão, ação de linha, campo, menu, barra lateral' },
  { size: 'lg', uso: 'Cabeçalho, estado vazio, spinner de página' },
]

const TONES: FeaturedIconTone[] = [
  'brand',
  'neutral',
  'success',
  'warning',
  'error',
  'info',
]

const GESTOS = Object.keys(ICONE) as Gesto[]

export default function IconesSandbox() {
  return (
    <TooltipProvider>
      <main className="min-h-screen space-y-8 bg-gray-100 p-6">
        <header className="space-y-1">
          <Heading as="h1">Ícones</Heading>
          <Text variant="page-subtitle">
            Uma biblioteca, três tamanhos e um ícone por gesto.
          </Text>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Tamanhos</CardTitle>
            <CardDescription>
              O contexto escolhe o tamanho; a tela nunca passa um número.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y" data-vitrine="tamanhos">
              {SIZES.map(({ size, uso }) => (
                <li key={size} className="flex items-center gap-4 py-3">
                  <span
                    className="flex w-10 justify-center"
                    data-icon-size={ICON_SIZE[size]}
                  >
                    <Icon icon={IconLayoutGrid} size={size} />
                  </span>
                  <span className="type-body-strong w-24">
                    {size} · {ICON_SIZE[size]} px
                  </span>
                  <span className="type-secondary">{uso}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Em contexto</CardTitle>
            <CardDescription>
              Botão pequeno e médio, ação de linha, item de menu e de barra
              lateral, badge e estado vazio.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-6">
            <Button size="sm" LeftIcon={IconPlus}>
              Novo
            </Button>
            <Button LeftIcon={IconPlus}>Novo orçamento</Button>
            <ActionButton gesto="editar" tooltip="Editar" />
            <ActionButton
              gesto="excluir"
              tooltip="Excluir"
              variant="errorGhost"
            />
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
              <Icon icon={ICONE.duplicar} size="md" className="text-gray-500" />
              Duplicar
            </div>
            <div className="flex items-center gap-4 rounded-lg bg-brand-25 px-2 py-2 text-sm font-semibold text-brand-600">
              <Icon icon={ICONE.documento} size="md" />
              Orçamentos
              <Icon icon={IconChevronRight} size="sm" className="ml-auto" />
            </div>
            <Badge variant="warningLight" size="sm">
              <Icon icon={ICONE.aviso} size="sm" />
              Atrasado
            </Badge>
            <div className="flex flex-col items-center gap-2 text-center">
              <FeaturedIcon tone="neutral" size="lg" Icon={IconLayoutGrid} />
              <span className="type-secondary">Nenhum item</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicionário de glifos</CardTitle>
            <CardDescription>
              Um gesto, um ícone. Ações usam o gesto (
              <code>gesto=&quot;ver&quot;</code>), nunca um ícone escolhido na
              tela.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul
              className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6"
              data-vitrine="dicionario"
            >
              {GESTOS.map((gesto) => (
                <li
                  key={gesto}
                  className="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2"
                >
                  <Icon
                    icon={ICONE[gesto]}
                    size="md"
                    className="text-gray-700"
                  />
                  <span className="type-secondary">{gesto}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ícone em destaque</CardTitle>
            <CardDescription>
              Só em estado vazio, confirmação e onboarding. Seis tons, três
              tamanhos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <div key={size} className="flex items-center gap-4">
                <span className="type-caption w-8">{size}</span>
                {TONES.map((tone) => (
                  <FeaturedIcon
                    key={tone}
                    tone={tone}
                    size={size}
                    Icon={IconLayoutGrid}
                  />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pictogramas</CardTitle>
            <CardDescription>
              Setores e tipos de recurso. Seguem o contrato do Tabler: tamanho e
              cor vêm do contexto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-8">
              {Object.entries(Pictogramas).map(([name, Glyph]) =>
                typeof Glyph === 'function' ? (
                  <li
                    key={name}
                    className="flex flex-col items-center gap-1 text-gray-700"
                  >
                    <Icon icon={Glyph} size="lg" />
                    <span className="type-caption">
                      {name.replace(/^Icon/, '')}
                    </span>
                  </li>
                ) : null,
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logos</CardTitle>
            <CardDescription>
              Bancos, meios de pagamento e o Atrupe. Não são ícones: mantêm a
              cor da marca e têm nome para leitor de tela.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-wrap gap-4">
              {Object.entries(Logos).map(([name, Logo]) =>
                typeof Logo === 'function' ? (
                  <li key={name}>
                    <Logo size={40} />
                  </li>
                ) : null,
              )}
            </ul>
          </CardContent>
        </Card>
      </main>
    </TooltipProvider>
  )
}
