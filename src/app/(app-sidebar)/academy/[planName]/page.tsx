'use client'

import { usePathname } from 'next/navigation'

// React Query
import { useQuery } from '@tanstack/react-query'

// Actions
import { getData } from '@/actions/_cruds'

// UI
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { buttonVariants, Button } from '@/components/ui/button'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'

// Components
import { AcademyItemRow } from '../_components/AcademyItemRow'

// Libs
import { cn } from '@/lib/utils'

// Icons
import {
  IconBook,
  IconCircleX,
  IconCircleFilled,
  IconCircleDotFilled,
  IconCircleCheckFilled,
} from '@tabler/icons-react'

export interface AcademyItem {
  id: string
  description: string
  checked: boolean
  files?: string[]
  video?: string
  page?: string
  modal?: string
  buttonTitle?: string
}

interface AcademySection {
  title: string
  items: AcademyItem[]
}

interface AcademyData {
  plan: string
  sections: AcademySection[]
}

export default function AcademyPage() {
  const pathname = usePathname()
  const currentPlan = pathname.split('/').pop() || 'start'

  const {
    data: academyResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['academy', currentPlan],
    queryFn: () => getData({ route: `/academy/${currentPlan}` }),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antiga cacheTime)
    retry: 2, // Tenta 2 vezes em caso de erro
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando conteúdo...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !academyResponse?.success) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <FeaturedIcon
              variant="errorBorderedLight"
              rounded
              Icon={IconCircleX}
              size="xl"
              className="mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro ao carregar Academy
            </h3>
            <p className="text-gray-600 mb-4">
              {academyResponse?.message || error?.message}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const academyData: AcademyData = academyResponse?.data

  if (!academyData?.sections || academyData.sections.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <FeaturedIcon
              variant="borderedLight"
              rounded
              Icon={IconBook}
              size="xl"
              className="mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Academy{' '}
              {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
            </h3>
            <p className="text-gray-600">
              Nenhum conteúdo disponível para este plano no momento.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Accordion
      type="single"
      collapsible
      // defaultValue={`item-${academyData.sections[0].title}`}
    >
      <div className="flex flex-col gap-4">
        {academyData.sections.map((section, index) => (
          <Card key={section.title + index} className="w-full">
            <AccordionItem
              value={`item-${section.title}`}
              className="p-0 m-0 border-0"
            >
              <CardHeader>
                <div className="flex justify-between">
                  <div className="flex gap-3 items-center">
                    {section.items.every((item) => item.checked) &&
                    section.items.length > 0 ? (
                      <IconCircleCheckFilled className="text-success" />
                    ) : section.items.some((item) => item.checked) ? (
                      <IconCircleDotFilled className="text-blue" />
                    ) : (
                      <IconCircleFilled className="text-gray-200" />
                    )}
                    <CardTitle className="text-gray-700 font-semibold text-base">
                      {section.title}
                    </CardTitle>
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
                    />
                  </div>
                </div>
              </CardHeader>
              <AccordionContent>
                <Separator />
                <CardContent className="p-0">
                  {section.items.length > 0 ? (
                    section.items.map((item) => (
                      <AcademyItemRow
                        key={item.id}
                        description={item.description}
                        checked={item.checked}
                        files={item.files}
                        video={item.video}
                        page={item.page}
                        modal={item.modal}
                        buttonTitle={item.buttonTitle}
                      />
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Em breve
                    </div>
                  )}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </div>
    </Accordion>
  )
}
