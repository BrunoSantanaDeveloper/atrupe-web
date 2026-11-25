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
import { Skeleton } from '@/components/ui/skeleton'
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
  title: string
  description: string
  checked: boolean
  files?: Array<{ url: string; name: string }>
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

  // Forma da tela (progresso + seções) no lugar de spinner com texto
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="w-full">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-5 w-48" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (isError || !academyResponse?.success) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="w-full">
          <CardContent className="p-8 text-center">
            <FeaturedIcon
              tone="error"
              Icon={IconCircleX}
              size="lg"
              className="mb-4"
            />
            <h3 className="type-card-title mb-2">Erro ao carregar Academy</h3>
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
              tone="brand"
              Icon={IconBook}
              size="lg"
              className="mb-4"
            />
            <h3 className="type-card-title mb-2">
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

  // Determina qual seção deve estar aberta por padrão
  const getDefaultOpenSection = () => {
    // Primeiro, procura por seções com progresso parcial (alguns itens checados, mas não todos)
    const sectionWithPartialProgress = academyData.sections.find(
      (section) =>
        section.items.length > 0 &&
        section.items.some((item) => item.checked) &&
        !section.items.every((item) => item.checked),
    )

    if (sectionWithPartialProgress) {
      return `item-${sectionWithPartialProgress.title}`
    }

    // Se não há seções com progresso parcial, procura pela primeira seção não completamente concluída
    const firstIncompleteSection = academyData.sections.find(
      (section) =>
        section.items.length > 0 &&
        !section.items.every((item) => item.checked),
    )

    if (firstIncompleteSection) {
      return `item-${firstIncompleteSection.title}`
    }

    // Se todas as seções estão completas, abre a primeira seção
    return academyData.sections.length > 0
      ? `item-${academyData.sections[0].title}`
      : ''
  }

  const totalItems = academyData.sections.reduce(
    (acc, s) => acc + s.items.length,
    0,
  )
  const totalChecked = academyData.sections.reduce(
    (acc, s) => acc + s.items.filter((i) => i.checked).length,
    0,
  )
  const overallPercent =
    totalItems > 0 ? Math.round((totalChecked / totalItems) * 100) : 0

  return (
    <>
      {/* Overall Progress */}
      <Card className="w-full mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progresso geral
            </span>
            <span className="text-sm font-semibold text-brand-600">
              {totalChecked}/{totalItems} ({overallPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Accordion
        type="single"
        collapsible
        defaultValue={getDefaultOpenSection()}
      >
        <div className="flex flex-col gap-4">
          {/* Seção sem aula não aparece: nada de "Em breve" (Maicol, 25/11/2026) */}
          {academyData.sections
            .filter((section) => section.items.length > 0)
            .map((section, index) => (
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
                          <IconCircleCheckFilled
                            aria-hidden
                            className="text-success"
                          />
                        ) : section.items.some((item) => item.checked) ? (
                          <IconCircleDotFilled
                            aria-hidden
                            className="text-blue"
                          />
                        ) : (
                          <IconCircleFilled
                            aria-hidden
                            className="text-gray-200"
                          />
                        )}
                        <CardTitle>{section.title}</CardTitle>
                        <span className="text-xs text-gray-400 ml-2">
                          {section.items.filter((i) => i.checked).length}/
                          {section.items.length}
                        </span>
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
                      {section.items.map((item, itemIndex) => (
                        <AcademyItemRow
                          key={item.id}
                          data={item}
                          showVideoInline={index === 0 && itemIndex === 0}
                        />
                      ))}
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Card>
            ))}
        </div>
      </Accordion>
    </>
  )
}
