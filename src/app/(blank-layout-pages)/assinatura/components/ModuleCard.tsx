'use client'

import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { cn, formatCurrencyToBrl } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { IconCheck } from '@tabler/icons-react'
import { Checkbox } from '@/components/ui/checkbox'

interface ModuleFeature {
  title?: string
  items: string[]
}

export interface Module {
  id: string
  name: string
  price: number
  description: string
  features: ModuleFeature[]
}

export const modules: Module[] = [
  {
    id: '1',
    name: 'Nota Fiscal',
    price: 7000,
    description:
      'Emita notas fiscais eletrônicas diretamente pelo sistema, com total integração ao financeiro.',
    features: [
      {
        items: [
          'NF-e (Nota Fiscal Eletrônica)',
          'NFS-e (Nota Fiscal de Serviço Eletrônica)',
          'NFC-e (Nota Fiscal de Consumidor Eletrônica)',
        ],
      },
    ],
  },
]

interface ModuleCardProps {
  selectedModules: string[]
  onToggleModule: (moduleId: string) => void
}

export function ModuleCard({
  selectedModules,
  onToggleModule,
}: ModuleCardProps) {
  const isSelected = (moduleId: string) => selectedModules.includes(moduleId)

  return (
    <>
      {modules.map((module) => (
        <Card
          key={module.id}
          className={cn(
            'w-full transition-colors',
            isSelected(module.id) && 'outline outline-1 outline-brand-200',
          )}
        >
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex gap-4 items-center">
                <Checkbox
                  checked={isSelected(module.id)}
                  onCheckedChange={() => onToggleModule(module.id)}
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
                            <IconCheck
                              size={16}
                              className="text-brand-400 mt-0.5 flex-shrink-0 stroke-[3px]"
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
        </Card>
      ))}
    </>
  )
}
