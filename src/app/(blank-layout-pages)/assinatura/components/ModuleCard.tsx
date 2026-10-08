'use client'

import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ModuleType } from '@/types/plans'
import { IconCheck } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

interface ModuleCardProps {
  modules: ModuleType[]
  selectedModules: string[]
  onSelectModule: React.Dispatch<React.SetStateAction<string[]>>
}

export function ModuleCard({
  modules,
  selectedModules,
  onSelectModule,
}: ModuleCardProps) {
  // Usa module.key para seleção (backend espera key, não id)
  const isSelected = (moduleKey: string) => selectedModules.includes(moduleKey)

  const handleToggleModule = (moduleKey: string) => {
    onSelectModule((prev) =>
      prev.includes(moduleKey)
        ? prev.filter((key) => key !== moduleKey)
        : [...prev, moduleKey],
    )
  }

  return (
    <>
      {modules.map((module) => (
        <Card
          key={module.key}
          className={cn(
            'w-full transition-colors',
            isSelected(module.key) && 'outline outline-1 outline-brand-200',
          )}
        >
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex gap-4 items-center">
                <Checkbox
                  checked={isSelected(module.key)}
                  onCheckedChange={() => handleToggleModule(module.key)}
                />
                <span className="text-lg text-gray-700 font-semibold">
                  {module.name}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl text-gray-700 font-semibold">
                  {formatCurrencyToBrl(module.price)}
                </span>
                <span className="text-sm text-gray"> /mês</span>
              </div>
            </div>
          </CardHeader>
          <Separator />
          {module.features && module.features.length > 0 && (
            <CardContent>
              <Accordion type="multiple">
                <AccordionItem value="item-1" className="p-6 m-0 border-0">
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
                    {module.features.map((feature, index) => (
                      <div key={index} className="space-y-3">
                        {feature.title && (
                          <p className="text-gray-700 font-medium">
                            {feature.title}
                          </p>
                        )}
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
              </Accordion>
            </CardContent>
          )}
          {module.description && !module.features?.length && (
            <CardContent>
              <Accordion type="multiple">
                <AccordionItem value="item-1" className="p-6 m-0 border-0">
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
                    <ul className="space-y-2">
                      {module.description.split('\n').map((item, index) => (
                        <li
                          key={index}
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          )}
        </Card>
      ))}
    </>
  )
}
