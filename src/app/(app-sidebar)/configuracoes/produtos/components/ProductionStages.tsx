import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useEffect, useState, useRef } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { NewProductsFormType } from './schema'

import { Reorder } from 'motion/react'
import { ProductionStageItem } from './ProductionStage/ProductionStageItem'

import { useSector } from '@/hooks/queries/useSector'

export function ProductionStages() {
  const { control } = useFormContext<NewProductsFormType>()
  const [draggingIndex, setDraggingIndex] = useState<null | number>(null)
  const hasInitialized = useRef(false)
  const { data: sectors } = useSector({ isProductionStage: true })

  const stages = useFieldArray({
    name: 'productionStages',
    control,
  })

  useEffect(() => {
    if (hasInitialized.current) return
    if (!sectors) return
    if (stages.fields.length > 0) return

    sectors
      ?.filter((sector) => sector.isActive === true)
      ?.forEach((sector) => {
        const existingStage = stages?.fields?.find(
          (stage) => stage.id === sector.id,
        )

        if (!existingStage) {
          stages?.append({
            id: sector.id,
            name: sector.name,
            icon: sector?.icon,
            isActive: false,
          })
        }
      })

    hasInitialized.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectors])

  function handleDragStart(index: number) {
    setDraggingIndex(index)
  }

  function handleDragEnd() {
    setDraggingIndex(null)
  }

  function handleReorder(newOrder: typeof stages.fields) {
    if (draggingIndex === null) {
      return
    }

    const draggingStage = stages.fields[draggingIndex]

    newOrder.forEach((stage, index) => {
      if (stage === draggingStage) {
        stages.move(draggingIndex, index)
        setDraggingIndex(index)
      }
    })
  }

  function handleSwap(itemIndex: number) {
    const inactiveIndex = stages.fields.findIndex((stage) => !stage.isActive)

    if (inactiveIndex !== -1 && inactiveIndex !== itemIndex) {
      stages.swap(itemIndex, inactiveIndex)
    }
  }

  function fixInactiveStages() {
    // Garante que itens inativos não fiquem entre ativos
    const reorderedStages = [...stages.fields].sort((a, b) => {
      if (a.isActive === b.isActive) return 0
      return a.isActive ? -1 : 1 // Ativos primeiro, inativos depois
    })
    reorderedStages.forEach((stage, index) => {
      const currentIndex = stages.fields.findIndex((s) => s.id === stage.id)
      if (currentIndex !== index) {
        stages.move(currentIndex, index)
      }
    })
    stages.replace(reorderedStages)
  }

  return (
    <div className="flex flex-col gap-4 w-full border-t border-gray-300 select-none">
      <p className="font-semibold text-base text-gray-700 my-4">
        Etapas de produção
      </p>

      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-b border-gray-200 rounded-t-lg h-[44px]">
            <TableHead className="w-[20%]">Sequência</TableHead>
            <TableHead className="w-[60%]">Etapa</TableHead>
            <TableHead className="w-[20%]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <Reorder.Group
          axis="y"
          as="tbody"
          values={stages.fields}
          onReorder={handleReorder}
          className="space-y-4 w-full"
        >
          {stages?.fields
            ?.filter(
              (stage, index, self) =>
                self.findIndex((t) => t.id === stage.id) === index,
            )
            ?.map((stage, index) => (
              <ProductionStageItem
                key={stage.id}
                stage={stage}
                index={index}
                isDraggingActive={
                  draggingIndex === null ? null : draggingIndex === index
                }
                onDragStart={() => handleDragStart(index)}
                onDragEnd={() => {
                  handleDragEnd()
                  fixInactiveStages() // Garante a ordem após drag-and-drop
                }}
                onActive={() => {
                  const prevIsActive = stages.fields[index - 1]?.isActive
                  const nextIsActive = stages.fields[index + 1]?.isActive

                  if (!prevIsActive || !nextIsActive) {
                    handleSwap(index)
                  }
                  // fixInactiveStages() // Ajusta qualquer inconsistência
                }}
                onInactive={() => {
                  if (stage.isActive) {
                    stages.move(index, stages.fields.length - 1)
                    // fixInactiveStages() // Reordena após mover para o final
                  }
                }}
              />
            ))}
        </Reorder.Group>
      </Table>
    </div>
  )
}
