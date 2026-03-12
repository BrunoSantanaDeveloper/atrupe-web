'use client'

// Next
import Image, { StaticImageData } from 'next/image'

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

interface SubscriptionSummaryCardsProps {
  subscription: {
    plan: {
      name: string
      basePrice: number
      planType: string
    }
    value: number
    additionalUsers: number
    subscriptionFeatures: {
      feature: { name: string; key: string }
      price: number
      isActive: boolean
    }[]
  }
}

export function SubscriptionSummaryCards({
  subscription,
}: SubscriptionSummaryCardsProps) {
  const nfFeatures =
    subscription.subscriptionFeatures?.filter(
      (f) => f.isActive !== false && f.feature?.key?.includes('nf'),
    ) || []

  const nfAdicionalFeatures =
    subscription.subscriptionFeatures?.filter(
      (f) => f.isActive !== false && f.feature?.key?.includes('nf_adicional'),
    ) || []

  const nfTotal = nfFeatures.reduce((sum, f) => sum + (f.price || 0), 0)
  const nfAdicionalTotal = nfAdicionalFeatures.reduce(
    (sum, f) => sum + (f.price || 0),
    0,
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Plan Card */}
      <Card>
        <CardContent className="p-5 flex items-center justify-center min-h-[88px]">
          {subscription.plan.planType === 'TRIAL' ? (
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
        <CardContent className="p-5 flex items-center gap-3 min-h-[88px]">
          <FeaturedIcon variant="neutralLight" Icon={IconReceipt} />
          <div className="min-w-0">
            <p className="text-sm text-gray-500">NF ({nfFeatures.length})</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrencyToBrl(nfTotal)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* NF Adicional Card */}
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
          <Button
            type="button"
            variant="light"
            size="iconSm"
            RightIcon={IconPlus}
            className="absolute top-3 right-3"
          />
        </CardContent>
      </Card>

      {/* Usuário Adicional Card */}
      <Card>
        <CardContent className="relative p-5 flex items-center gap-3 min-h-[88px]">
          <FeaturedIcon variant="neutralLight" Icon={IconUserPlus} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-500">
              Usuário adicional ({subscription.additionalUsers || 0})
            </p>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrencyToBrl((subscription.additionalUsers || 0) * 1500)}
            </p>
          </div>
          <Button
            type="button"
            variant="light"
            size="iconSm"
            RightIcon={IconPlus}
            className="absolute top-3 right-3"
          />
        </CardContent>
      </Card>
    </div>
  )
}
