'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { IconLock } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { SUBSCRIPTION_PAGE } from '@/config/routes'
import { usePlanCatalog } from '@/hooks/usePlanCatalog'
import { ASK_PRINCIPAL_ADMIN } from '@/lib/plans/planAccess'
import { cn } from '@/lib/utils'

export interface UpgradeFallbackProps {
  title?: string
  /** Só sobre o recurso: o plano que o libera vem do mapa de chaves. */
  description?: string
  /** A chave que a tela exige; com lista, basta uma (ver `requireAll`). */
  feature?: string | string[]
  requireAll?: boolean
  /**
   * `plan`: recurso de plano, liberado a partir de um plano da trilha.
   * `module`: módulo contratado à parte, como a Nota Fiscal.
   */
  kind?: 'plan' | 'module'
  /**
   * A parede ocupa a página inteira: o título dela é o `h1` da página. Dentro
   * de uma página que já tem título (as abas do cadastro), é um `h2`.
   */
  pageTitle?: boolean
  className?: string
}

/**
 * Parede de recurso fora do plano ou de módulo não contratado.
 *
 * O plano que libera o recurso vem do mapa público de chaves, nunca escrito
 * à mão: o superadmin muda a composição dos planos no painel. Só o titular
 * contrata — para ele, o botão leva à trilha de contratação; para os demais,
 * o texto diz a quem pedir.
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
  const { getAvailableFrom } = usePlanCatalog()

  const availableFrom =
    kind === 'plan' && feature
      ? getAvailableFrom(feature, requireAll)
      : undefined

  // `undefined`: o mapa não chegou (ou não tem a chave) e o texto é o
  // genérico; `null`: nenhum plano tem o recurso.
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

  const Heading = pageTitle ? 'h1' : 'h2'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] p-8 text-center',
        className,
      )}
    >
      <FeaturedIcon
        Icon={IconLock}
        variant="neutralBorderedLight"
        size="xl"
        rounded
        className="mb-6"
      />
      <Heading className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </Heading>
      {description ? (
        <p className="text-gray-600 max-w-md mb-2">{description}</p>
      ) : null}
      <p className="font-medium text-gray-800 max-w-md">{availability}</p>
      {contractable && !isOwner ? (
        <p className="text-gray-600 max-w-md mt-2">{ASK_PRINCIPAL_ADMIN}</p>
      ) : null}
      {contractable && isOwner ? (
        <Button type="button" asChild className="mt-6">
          <Link href={SUBSCRIPTION_PAGE}>
            {kind === 'module' ? 'Contratar módulo' : 'Fazer upgrade'}
          </Link>
        </Button>
      ) : null}
    </div>
  )
}
