// UI component Imports
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

// Libs
import { cn } from '@/lib/utils'

interface Props {
  name: string
  placeholder?: string
  width?: string
  value?: string
  onChange?: (value: string) => void
}

export function SortSelectorField({
  name,
  width = 'flex-[1_0_100px]',
  value,
  onChange,
}: Props) {
  const options = [
    { value: 'padrao', label: 'Padrão' },
    { value: 'data', label: 'Data' },
    { value: 'nome', label: 'Nome' },
  ]

  return (
    <div className={cn('flex flex-col gap-2', width)}>
      <Label htmlFor={name}>Ordenar por</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={name}>
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          {options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
