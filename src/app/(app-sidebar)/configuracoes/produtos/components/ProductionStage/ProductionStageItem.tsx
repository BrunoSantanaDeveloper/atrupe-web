import { Reorder, useDragControls } from 'motion/react'
import { NewProductsFormType } from '../schema'
import { TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { IconMenuOrder } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'
import { Switch } from '@/components/ui/switch'
import { ProductionStageIcon } from './ProductionStageIcon'
import { useFormContext } from 'react-hook-form'
import { FormField } from '@/components/ui/form'

interface IStageItemProps {
  index: number
  isDraggingActive: null | boolean
  stage: NewProductsFormType['productionStages'][number]
  onDragStart: () => void
  onDragEnd: () => void
  onActive: (index: number) => void
  onInactive: (index: number) => void
}
const tableRowStyle =
  'border-b transition-colors hover:bg-gray-100/50 data-[state=selected]:bg-gray-100'

export function ProductionStageItem({
  stage,
  index,
  isDraggingActive,
  onDragStart,
  onDragEnd,
  onActive,
  onInactive,
}: IStageItemProps) {
  const controls = useDragControls()
  const { control } = useFormContext<NewProductsFormType>()
  return (
    <Reorder.Item
      as="tr"
      key={stage.id}
      value={stage}
      onDragStart={() => {
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      className={cn(
        tableRowStyle,
        'relative h-[72px] bg-white transition-opacity w-full',
        isDraggingActive === false && 'opacity-50 bg-white',
        'bg-white',
      )}
      dragListener={false}
      dragControls={controls}
    >
      <TableCell>
        <div
          className="flex items-center gap-4 hover:cursor-grab "
          onPointerDown={(e) => {
            controls.start(e)
          }}
        >
          <Icon icon={IconMenuOrder} size="sm" className="text-gray-500" />

          <span className="text-gray-900 text-sm font-medium">
            {index + 1}º
          </span>
        </div>
      </TableCell>
      <TableCell className="flex items-center gap-4">
        <ProductionStageIcon
          icon={stage?.icon || ''}
          isActive={stage?.isActive}
        />
        {stage?.name}
      </TableCell>
      <TableCell>
        <FormField
          control={control}
          name={`productionStages.${index}.isActive`}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked)
                if (checked) {
                  onActive(index)
                } else {
                  onInactive(index)
                }
              }}
            />
          )}
        />
      </TableCell>
    </Reorder.Item>
  )
}
