import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { useEffect, useState, useRef } from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { NewProductsFormType } from './schema'

import { Reorder } from 'motion/react'
import { ProductionStageItem } from './ProductionStage/ProductionStageItem'

import { useSector } from '@/hooks/queries/useSector'
import { cn } from '@/lib/utils'
import { fixedSectorIds } from './unitSectors'

// Sem título dentro da sanfona (ProductionStagesSection), que já o mostra
export function ProductionStages({
  hideTitle = false,
  hint,
}: {
  hideTitle?: boolean
  // O (i) ao lado do título (18/11/2026)
  hint?: React.ReactNode
}) {
  const { control, setValue, getValues } = useFormContext<NewProductsFormType>()
  const [draggingIndex, setDraggingIndex] = useState<null | number>(null)
  const hasInitialized = useRef(false)
  const { data: sectors } = useSector({ isProductionStage: true })

  const stages = useFieldArray({
    name: 'productionStages',
    control,
  })

  // Os ícones fixos (área 9 §4.16): os setores das etapas de cobrança. Ficam
  // ligados e não se desligam aqui; os outros são livres ("também passa
  // por…")
  const units = useWatch({ control, name: 'items' })
  const productSector = useWatch({ control, name: 'sectorId' })
  const productionSectorIds = new Set(
    (sectors ?? []).filter((sector) => sector.isActive).map((s) => s.id),
  )
  const fixed = fixedSectorIds(units, productSector, productionSectorIds)
  const fixedKey = fixed.join(',')
  // Os valores do formulário: o `id` dos fields é a chave do useFieldArray,
  // não o do setor
  const values = useWatch({ control, name: 'productionStages' }) || []
  const sectorIdAt = (index: number) => values[index]?.id

  useEffect(() => {
    if (!fixed.length) return
    for (const id of fixed) {
      const current = getValues('productionStages') || []
      const index = current.findIndex((stage) => stage?.id === id)
      if (index === -1) {
        // O setor que ainda não está na lista do produto (edição): entra
        // ligado, logo depois dos ligados
        const sector = sectors?.find((item) => item.id === id)
        if (!sector) continue
        const lastActive = current.reduce(
          (last, stage, i) => (stage?.isActive ? i : last),
          -1,
        )
        stages.insert(lastActive + 1, {
          id: sector.id,
          name: sector.name,
          icon: sector.icon,
          isActive: true,
        })
        continue
      }
      if (current[index].isActive) continue
      setValue(`productionStages.${index}.isActive`, true, {
        shouldDirty: true,
      })
      // Entra logo depois dos ligados, como ao ligar à mão
      const lastActive = current.reduce(
        (last, stage, i) => (stage?.isActive && i !== index ? i : last),
        -1,
      )
      if (lastActive + 1 < index) stages.move(index, lastActive + 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedKey, stages.fields.length, sectors])

  useEffect(() => {
    if (hasInitialized.current) return
    if (!sectors) return

    // Obter apenas os setores ativos para etapas de produção
    const activeSectors = sectors.filter((sector) => sector.isActive === true)

    // Se não há etapas no formulário, adicionar todas as etapas ativas
    if (stages.fields.length === 0) {
      activeSectors.forEach((sector) => {
        stages.append({
          id: sector.id,
          name: sector.name,
          icon: sector?.icon,
          isActive: false,
        })
      })
    } else {
      // Modo edição: as etapas já vêm filtradas e enriquecidas do NewProduct.tsx
      // Não precisamos fazer nada aqui, pois as etapas já estão corretas
    }

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
    <div
      className={cn(
        'flex flex-col gap-4 w-full select-none',
        !hideTitle && 'border-t border-gray-300',
      )}
    >
      {!hideTitle && (
        <div className="my-4 flex items-center gap-1.5">
          <p className="font-semibold text-base text-gray-700">
            Etapas de produção
          </p>
          {hint}
        </div>
      )}

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
                fixed={fixed.includes(sectorIdAt(index) ?? '')}
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
