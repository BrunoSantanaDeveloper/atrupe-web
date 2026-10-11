'use client'

// React
import { useEffect, useState } from 'react'

// UI
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { IconComponent } from '@/components/common/Icon'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect } from '@/components/common/form/FormSelect'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'

// Icons
import { IconCircleCheck, IconPencil } from '@tabler/icons-react'

// Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { schema, type FormType } from './schema'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Types
import type { SearchParamsType } from '@/types/coreTypes'
import { ListSectorDataType } from '@/types/settings/sector'

// Actions
import { updateItemNew } from '@/actions/_cruds'

// Consts
import { sectorIcons, SECTOR_PALETTE } from '@/consts/sectors'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'
import { useSectorColor, SECTOR_COLORS_QUERY_KEY } from '@/hooks/useSectorColor'

// Actions (cor do setor, mock até a API ter o campo)
import { setSectorColor } from '@/actions/sector-colors'

// Components
import { SectorIcon } from '@/components/common/SectorIcon'

// Lib
import { cn } from '@/lib/utils'
import { DEMO_DATA } from '@/lib/demo'

interface Props extends SearchParamsType {
  open: boolean
  setOpen: (open: string) => void
  rowData?: ListSectorDataType
}

const iconOptions = Object.entries(sectorIcons).map(([key, value]) => ({
  label: (
    <div className="flex items-center gap-2 text-nowrap">
      <IconComponent
        icon={value.icon}
        className="size-5 [&>path]:stroke-[2px]"
      />
      {value.text}
    </div>
  ),
  value: key,
}))

export function EditItemDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()
  const { canManageProductionStages } = usePlanFeatures()
  const { notifyActionError } = usePlanErrorToast()

  const canConfigProductionStages = canManageProductionStages()

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      name: rowData?.name || '',
      icon: rowData?.icon || '',
      isProductionStage: rowData?.isProductionStage || false,
    },
  })

  const { handleSubmit, setValue, watch } = form

  // A cor do setor (área 9 §4.14): a escolhida ou o padrão. Fica no mock por
  // id e nome até a API do setor ganhar o campo
  const colorOf = useSectorColor()
  const [color, setColor] = useState('')
  useEffect(() => {
    if (open && rowData) {
      setColor(
        colorOf({ id: rowData.id, name: rowData.name, icon: rowData.icon }),
      )
    }
  }, [open, rowData, colorOf])

  const mutation = useMutation({
    mutationFn: async (data: FormType) => {
      const res = await updateItemNew({
        route: `/sector/${rowData?.id}`,
        data,
      })
      // A cor só é gravada depois que o servidor aceitou o setor (e só com a
      // flag de demonstração, enquanto a API do setor não tem o campo)
      if (res.success && DEMO_DATA) {
        await setSectorColor({
          sectorId: String(rowData?.id),
          name: data.name,
          color: color || null,
        })
      }
      return res
    },
    onSuccess: (res) => {
      if (!res.success) {
        // Setores e etapas de produção são recursos de plano: o servidor
        // recusa sem eles.
        notifyActionError(res, 'Ocorreu um erro.')
        return
      }
      queryClient.invalidateQueries()
      queryClient.invalidateQueries({ queryKey: [SECTOR_COLORS_QUERY_KEY] })
      toast.success('Setor atualizado')
      handleOpenChange(false)
    },
    onError: () => {
      toast.error('Ocorreu um erro.')
    },
  })

  const onSubmit = async (data: FormType) => {
    if (mutation.isPending) return

    await mutation.mutateAsync(data)
  }

  const handleOpenChange = (value: boolean) => {
    setOpen(value ? 'edit' : '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconPencil} />
              <span>Editar setor</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Form {...form}>
            <form
              id="edit-sector"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-wrap gap-5"
              noValidate
            >
              <FormSelect<FormType>
                name="icon"
                label="Icone"
                options={iconOptions}
                width="flex-[1_0_190px]"
              />
              <FormInput<FormType>
                name="name"
                label="Nome"
                width="flex-[1_0_190px]"
              />
              {/* A cor acompanha o setor em todo lugar: gerenciador, ficha,
                  agenda, composição e lista de processos. Ainda é gravada
                  em dado de demonstração: o campo só aparece com a flag */}
              <div className={cn('w-full space-y-1.5', !DEMO_DATA && 'hidden')}>
                <Label>Cor</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <SectorIcon
                    size="lg"
                    name={watch('name')}
                    icon={watch('icon')}
                    style={{
                      color,
                      backgroundColor: `${color}1A`,
                      borderColor: `${color}66`,
                    }}
                  />
                  <div className="flex flex-wrap gap-2">
                    {SECTOR_PALETTE.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-label={`Cor ${option}`}
                        aria-pressed={color === option}
                        onClick={() => setColor(option)}
                        className={cn(
                          'size-7 rounded-full border-2',
                          color === option ? 'border-gray-900' : 'border-white',
                        )}
                        style={{ backgroundColor: option }}
                      />
                    ))}
                    <label className="flex size-7 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-300 text-xs text-gray">
                      <input
                        type="color"
                        aria-label="Outra cor"
                        value={color || '#4B5563'}
                        onChange={(event) =>
                          setColor(event.target.value.toUpperCase())
                        }
                        className="size-5 cursor-pointer border-0 bg-transparent p-0"
                      />
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray">
                  Aparece no gerenciador, na ficha de produção, na Agenda de
                  entrega e na composição do produto.
                </p>
              </div>
            </form>
          </Form>
        </DialogBody>

        <DialogFooter className="sm:justify-between">
          <div className="flex items-center">
            {canConfigProductionStages && (
              <CheckboxBasic
                name="isProductionStage"
                label="Exibir nas etapas de produção"
                defaultChecked={rowData?.isProductionStage}
                onCheckedChange={(value) => {
                  setValue('isProductionStage', !!value)
                }}
              />
            )}
          </div>
          <div className="space-x-4">
            <DialogTrigger asChild>
              <Button type="button" variant="neutralOutline">
                Cancelar
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              form="edit-sector"
              isLoading={mutation.isPending}
              RightIcon={IconCircleCheck}
            >
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
