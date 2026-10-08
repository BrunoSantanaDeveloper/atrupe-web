'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { VisualPlanType } from '@/types/plans'
import { Skeleton } from '@/components/ui/skeleton'
import Image, { StaticImageData } from 'next/image'
import { Separator } from '@/components/ui/separator'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { IconCheck, IconPlayerPlayFilled } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'
import { VideoDialog } from '@/app/(app-sidebar)/academy/_components/VideoDialog'

import pro from '@/assets/images/pro-logo.png'
import lite from '@/assets/images/lite-logo.png'
import full from '@/assets/images/full-logo.png'
import elite from '@/assets/images/elite-logo.png'
import start from '@/assets/images/start-logo.png'
import atrupe from '@/assets/images/atrupe-logo.png'

const planLogos: Record<string, StaticImageData> = {
  start,
  lite,
  pro,
  elite,
  full,
}

// TODO: Implementar logos dos planos no backend, receber url de cada logo
function getPlanLogo(planName: string) {
  return planLogos[planName.toLowerCase()] || atrupe
}

interface PlanCardProps {
  plans: VisualPlanType[]
  selectedPlanId: string
  onSelectPlan: (planId: string) => void
  isLoading?: boolean
}

export function PlanCard({
  plans,
  selectedPlanId,
  onSelectPlan,
  isLoading = false,
}: PlanCardProps) {
  const [videoDialog, setVideoDialog] = useState<{
    open: boolean
    url: string
    title: string
  }>({
    open: false,
    url: '',
    title: '',
  })

  const handleOpenVideo = (url: string, title: string) => {
    setVideoDialog({ open: true, url, title })
  }

  const isDisabled = (plan: VisualPlanType) => !plan.isActive
  const isSelected = (plan: VisualPlanType) => selectedPlanId === plan.id

  const handleCheckClick = (
    plan: VisualPlanType,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.stopPropagation()
    if (plan.isActive) {
      onSelectPlan(plan.id)
    }
  }

  if (isLoading) {
    return (
      <>
        {[1, 2, 3].map((index) => (
          <Card key={index} className="w-full">
            <CardHeader className="pb-[18px]">
              <div className="flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <Separator />
            <CardContent>
              <div>
                <div className="flex justify-between items-center p-6">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
                <Separator />
                <div className="flex justify-between items-center p-6">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  if (plans.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600">Nenhum plano disponível no momento.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {plans.map((plan) => (
        <Card
          key={plan.id}
          className={cn(
            'w-full transition-colors',
            isSelected(plan) && 'outline outline-1 outline-brand-200',
          )}
        >
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex gap-4 items-center">
                <Button
                  type="button"
                  variant={isSelected(plan) ? 'default' : 'neutralLight'}
                  size="iconXs"
                  rounded="full"
                  RightIcon={isSelected(plan) ? IconCheck : undefined}
                  onClick={(e) => handleCheckClick(plan, e)}
                  disabled={isDisabled(plan)}
                  aria-label={`Selecionar plano ${plan.name}`}
                  className={cn(!isSelected(plan) && 'border border-gray-300')}
                />
                <Image
                  src={getPlanLogo(plan.name)}
                  alt="plano"
                  priority
                  className="max-w-32"
                />
                {plan.videoUrl && (
                  <Button type="button" variant="none" size="none">
                    <Badge
                      variant="neutralLight"
                      LeftIcon={IconPlayerPlayFilled}
                      onClick={() => handleOpenVideo(plan.videoUrl!, plan.name)}
                    >
                      Ver vídeo
                    </Badge>
                  </Button>
                )}
                {plan.badge && (
                  <Badge variant={plan.badge.variant}>{plan.badge.text}</Badge>
                )}
              </div>
              {plan.basePrice ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-xl text-gray-700 font-semibold">
                    {formatCurrencyToBrl(plan.basePrice)}
                  </span>
                  <span className="text-sm text-gray"> /mês</span>
                </div>
              ) : null}
            </div>
          </CardHeader>
          <Separator />
          <CardContent>
            <Accordion type="multiple">
              {plan.sections.concept && (
                <AccordionItem value="item-1" className="p-6 m-0 border-0">
                  <div className="flex justify-between">
                    <div className="flex gap-3 items-center">
                      <p className="text-gray-700 font-semibold text-base">
                        Conceito
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <AccordionTrigger
                        className={cn(
                          buttonVariants({
                            variant: 'neutralLight',
                            size: 'icon',
                          }),
                          'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                        )}
                      ></AccordionTrigger>
                    </div>
                  </div>
                  <AccordionContent className="space-y-4 pt-4">
                    <p className="text-gray-600">
                      {plan.sections.concept.description}
                    </p>
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">Objetivo</p>
                      <p className="text-gray-600">
                        {plan.sections.concept.objective}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">
                        Principais Ações
                      </p>
                      <ul className="pl-2">
                        {plan.sections.concept.mainActions.map(
                          (action, index) => (
                            <li
                              key={index}
                              className="text-gray-600 flex gap-2 items-start"
                            >
                              <span className="inline-block w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0" />
                              <span>{action}</span>
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-700 font-medium">
                        Resultados Esperados
                      </p>
                      {typeof plan.sections.concept.expectedResults ===
                      'string' ? (
                        <p className="text-gray-600">
                          {plan.sections.concept.expectedResults}
                        </p>
                      ) : (
                        <>
                          {plan.sections.concept.expectedResults.text && (
                            <p className="text-gray-600">
                              {plan.sections.concept.expectedResults.text}
                            </p>
                          )}
                          <ul className="pl-2">
                            {plan.sections.concept.expectedResults.list
                              ?.length &&
                              plan.sections.concept.expectedResults.list.map(
                                (result, index) => (
                                  <li
                                    key={index}
                                    className="text-gray-600 flex gap-2 items-start"
                                  >
                                    <span className="inline-block w-1 h-1 rounded-full bg-gray-600 mt-2 flex-shrink-0" />
                                    <span>{result}</span>
                                  </li>
                                ),
                              )}
                          </ul>
                        </>
                      )}
                    </div>
                    {plan.sections.concept.footer && (
                      <p className="text-gray-600 font-semibold pt-2">
                        {plan.sections.concept.footer}
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}
              {plan.sections.features && (
                <>
                  <Separator />
                  <AccordionItem value="item-2" className="p-6 m-0 border-0">
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <p className="text-gray-700 font-semibold text-base">
                          Funcionalidades
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <AccordionTrigger
                          className={cn(
                            buttonVariants({
                              variant: 'neutralLight',
                              size: 'icon',
                            }),
                            'mr-0 [&>svg]:text-gray [&>svg]:size-5',
                          )}
                        ></AccordionTrigger>
                      </div>
                    </div>
                    <AccordionContent className="space-y-4 pt-4">
                      {plan.sections.features.map((feature, index) => (
                        <div key={index} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <p className="text-gray-700 font-medium">
                              {feature.title}
                            </p>
                            {feature.videoUrl && (
                              <Button type="button" variant="none" size="none">
                                <Badge
                                  variant="neutralLight"
                                  LeftIcon={IconPlayerPlayFilled}
                                  onClick={() =>
                                    handleOpenVideo(
                                      feature.videoUrl!,
                                      feature.title,
                                    )
                                  }
                                >
                                  Ver vídeo
                                </Badge>
                              </Button>
                            )}
                          </div>
                          <ul className="space-y-2">
                            {feature.items.map((item, itemIndex) => (
                              <li
                                key={itemIndex}
                                className="text-gray-600 flex gap-2 items-start"
                              >
                                <Icon
                                  icon={IconCheck}
                                  size="sm"
                                  className="text-brand-400 mt-0.5 flex-shrink-0"
                                />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </>
              )}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      <VideoDialog
        open={videoDialog.open}
        onOpenChange={(open) => setVideoDialog((prev) => ({ ...prev, open }))}
        video={videoDialog.url}
        title={videoDialog.title}
      />
    </>
  )
}
