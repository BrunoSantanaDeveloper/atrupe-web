'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { IconLock } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Skeleton } from '@/components/ui/skeleton'
import { SUBSCRIPTION_PAGE } from '@/config/routes'
import { usePlanCatalog } from '@/hooks/usePlanCatalog'
import { ASK_PRINCIPAL_ADMIN } from '@/lib/plans/planAccess'
import { cn } from '@/lib/utils'
import type { PlanAvailableFrom } from '@/types/planError'

/**
 * `plan`: recurso de plano, liberado a partir de um plano da trilha.
 * `module`: módulo contratado à parte, como a Nota Fiscal.
 */
type WallKind = 'plan' | 'module'

export interface UpgradeFallbackProps {
  title?: string
  /** Só sobre o recurso: o plano que o libera vem do mapa de chaves. */
  description?: string
  /** A chave que a tela exige; com lista, basta uma (ver `requireAll`). */
  feature?: string | string[]
  requireAll?: boolean
  kind?: WallKind
  /**
   * A parede ocupa a página inteira: o título dela é o `h1` da página. Dentro
   * de uma página que já tem título (as abas do cadastro), é um `h2`.
   */
  pageTitle?: boolean
  className?: string
}

/**
 * O texto de disponibilidade da parede, e se há o que contratar.
 *
 * `undefined`: o mapa não chegou (ou não tem a chave) e o texto é o genérico;
 * `null`: nenhum plano tem o recurso.
 */
export function describeWallAvailability(
  kind: WallKind,
  availableFrom: PlanAvailableFrom | null | undefined,
) {
  const availability =
    kind === 'module'
      ? 'Módulo contratado à parte.'
      : availableFrom === null
        ? 'Este recurso não está disponível nos planos atuais.'
        : availableFrom && !availableFrom.isActive
          ? `Disponível a partir do plano ${availableFrom.name}, que chega em breve.`
          : availableFrom
            ? `Disponível a partir do plano ${availableFrom.name}.`
            : 'Este recurso não faz parte do seu plano atual.'
  const contractable =
    kind === 'module' ||
    availableFrom === undefined ||
    (!!availableFrom && availableFrom.isActive)

  return { availability, contractable }
}

export interface UpgradeWallViewProps {
  title: string
  description?: string
  /** O texto que diz de onde o recurso vem (`describeWallAvailability`). */
  availability: string
  /** Há o que contratar na trilha. */
  contractable: boolean
  /** Só o titular contrata: ele vê o botão; os demais, a quem pedir. */
  isOwner: boolean
  /**
   * O mapa de planos ainda está chegando: no lugar da disponibilidade fica
   * um esqueleto, e o botão espera, para o texto e o botão não trocarem
   * depois de aparecer.
   */
  loading?: boolean
  kind?: WallKind
  pageTitle?: boolean
  className?: string
}

/**
 * A parede em si, sem sessão nem mapa de chaves: quem chama diz o que
 * mostrar. A vitrine `/sandbox/estados-de-plano` usa esta parte para exibir
 * todos os estados lado a lado.
 */
export function UpgradeWallView({
  title,
  description,
  availability,
  contractable,
  isOwner,
  loading = false,
  kind = 'plan',
  pageTitle = false,
  className = '',
}: UpgradeWallViewProps) {
  const Heading = pageTitle ? 'h1' : 'h2'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] p-8 text-center',
        className,
      )}
      aria-busy={loading || undefined}
    >
      <FeaturedIcon Icon={IconLock} tone="neutral" size="lg" className="mb-6" />
      <Heading className="type-card-title mb-2">{title}</Heading>
      {description ? (
        <p className="text-gray-600 max-w-md mb-2">{description}</p>
      ) : null}
      {loading ? (
        <Skeleton className="h-5 w-64 max-w-full" />
      ) : (
        <p className="font-medium text-gray-800 max-w-md">{availability}</p>
      )}
      {!loading && contractable && !isOwner ? (
        <p className="text-gray-600 max-w-md mt-2">{ASK_PRINCIPAL_ADMIN}</p>
      ) : null}
      {!loading && contractable && isOwner ? (
        <Button type="button" asChild className="mt-6">
          <Link href={SUBSCRIPTION_PAGE}>
            {kind === 'module' ? 'Contratar módulo' : 'Fazer upgrade'}
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

/**
 * Parede de recurso fora do plano ou de módulo não contratado.
 *
 * O plano que libera o recurso vem do mapa público de chaves, nunca escrito
 * à mão: o superadmin muda a composição dos planos no painel. Só o titular
 * contrata — para ele, o botão leva à trilha de contratação; para os demais,
 * o texto diz a quem pedir. Enquanto o mapa chega, a disponibilidade e o
 * botão esperam; se o mapa falhar, fica o texto genérico.
 */
export function UpgradeFallback({
  title = 'Recurso fora do seu plano',
  description,
  feature,
  requireAll = false,
  kind = 'plan',
  pageTitle = false,
  className = '',
}: UpgradeFallbackProps) {
  const { data: session } = useSession()
  const isOwner = !!session?.company?.isOwner
  const { getAvailableFrom, isLoading } = usePlanCatalog()

  const usesMap = kind === 'plan' && !!feature
  const availableFrom = usesMap
    ? getAvailableFrom(feature, requireAll)
    : undefined

  const { availability, contractable } = describeWallAvailability(
    kind,
    availableFrom,
  )

  return (
    <UpgradeWallView
      title={title}
      description={description}
      availability={availability}
      contractable={contractable}
      isOwner={isOwner}
      loading={usesMap && isLoading}
      kind={kind}
      pageTitle={pageTitle}
      className={className}
    />
  )
}
