'use client'

// Next
import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'

// UI
import { Card, CardContent } from '@/components/ui/card'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { Button } from '@/components/ui/button'

// Icons
import { IconReceipt, IconPlus, IconUserPlus } from '@tabler/icons-react'

// Logos
import startLogo from '@/assets/images/start-logo.png'
import liteLogo from '@/assets/images/lite-logo.png'
import proLogo from '@/assets/images/pro-logo.png'
import eliteLogo from '@/assets/images/elite-logo.png'
import fullLogo from '@/assets/images/full-logo.png'

// Utils
import { formatCurrencyToBrl } from '@/lib/utils'

const planLogos: Record<string, StaticImageData> = {
  START: startLogo,
  LITE: liteLogo,
  PRO: proLogo,
  ELITE: eliteLogo,
  FULL: fullLogo,
}

interface SubscriptionFeature {
  feature: { name: string; key: string }
  price: number
  isActive: boolean
}

interface SubscriptionSummaryCardsProps {
  subscription: {
    id: string
    status: string
    plan: {
      name: string
      basePrice: number
      planType: string
    }
    value: number
    additionalUsers: number
    subscriptionFeatures: SubscriptionFeature[]
  }
  /**
   * Retirar módulos e incluir usuários é do Administrador Principal da Conta
   * (contrato 1.1, 4.2): para os demais, os atalhos não aparecem.
   */
  isPrincipalAdmin?: boolean
}

export function SubscriptionSummaryCards({
  subscription,
  isPrincipalAdmin = true,
}: SubscriptionSummaryCardsProps) {
  // All active extra modules (subscription-level features added by user)
  const activeModules =
    subscription.subscriptionFeatures?.filter(
      (f) => f.isActive !== false && f.feature?.key,
    ) || []

  // Separate NF-related modules for the dedicated NF cards
  const nfMainModule = activeModules.find(
    (f) =>
      f.feature.key === 'nota_fiscal' ||
      (f.feature.key.includes('nf') && !f.feature.key.includes('nf_adicional')),
  )

  const nfTotal = nfMainModule ? nfMainModule.price || 0 : 0

  const isTrial = subscription.plan.planType === 'TRIAL'
  const isCanceled = subscription.status !== 'ACTIVE'
  const canChange = !isTrial && !isCanceled && isPrincipalAdmin

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Plan Card */}
        <Card>
          <CardContent className="p-5 flex items-center justify-center min-h-[88px]">
            {isTrial ? (
              <div className="flex flex-col items-center justify-center">
                <span className="font-semibold text-gray-700 text-lg">
                  Período de Teste
                </span>
              </div>
            ) : (
              <Image
                src={planLogos[subscription.plan.planType] || startLogo}
                alt={subscription.plan.name}
                priority
                className="h-7 w-auto"
              />
            )}
          </CardContent>
        </Card>

        {/* NF Card */}
        <Card>
          <CardContent className="relative p-5 flex items-center gap-3 min-h-[88px]">
            <FeaturedIcon variant="neutralLight" Icon={IconReceipt} />
            <div className="min-w-0">
              <p className="text-sm text-gray-500">
                NF ({nfMainModule ? 1 : 0})
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {formatCurrencyToBrl(nfTotal)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* NF Adicional Card 
        <Card>
          <CardContent className="relative p-5 flex items-center gap-3 min-h-[88px]">
            <FeaturedIcon variant="neutralLight" Icon={IconReceipt} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">
                NF adicional ({nfAdicionalFeatures.length})
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {formatCurrencyToBrl(nfAdicionalTotal)}
              </p>
            </div>
            {!isCanceled && (
              <Button
                type="button"
                variant="light"
                size="iconSm"
                RightIcon={IconPlus}
                className="absolute top-3 right-3"
              />
            )}
          </CardContent>
        </Card> */}

        {/* Usuário Adicional Card */}
        <Card>
          <CardContent className="relative p-5 flex items-center gap-3 min-h-[88px]">
            <FeaturedIcon variant="neutralLight" Icon={IconUserPlus} />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500">
                Usuário adicional ({subscription.additionalUsers || 0})
              </p>
              <p className="text-lg font-semibold text-gray-800">
                {formatCurrencyToBrl(
                  (subscription.additionalUsers || 0) * 1500,
                )}
              </p>
            </div>
            {canChange && (
              <Button
                asChild
                variant="light"
                size="iconSm"
                className="absolute top-3 right-3"
              >
                <Link href="/assinatura" aria-label="Adicionar usuários">
                  <IconPlus size={16} />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
