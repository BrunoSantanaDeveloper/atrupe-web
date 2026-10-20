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
import { Input } from '@/components/ui/input'

// Components
import { IconComponent } from '@/components/common/Icon'
import { FormInput } from '@/components/common/form/FormInput'
import { FormSelect, SelectBasic } from '@/components/common/form/FormSelect'
import { CheckboxBasic } from '@/components/common/form/FormCheckbox'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

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
import {
  sectorIcons,
  SECTOR_PALETTE,
  sectorDefaultColor,
} from '@/consts/sectors'

// Hooks
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePermissions } from '@/hooks/usePermissions'
import { FEATURES } from '@/consts/features'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'
import { useSectorColor, SECTOR_COLORS_QUERY_KEY } from '@/hooks/useSectorColor'

// Components
import { SectorIcon } from '@/components/common/SectorIcon'

// Lib
import { cn } from '@/lib/utils'

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
        size="md"
        className="[&>path]:stroke-[2px]"
      />
      {value.text}
    </div>
  ),
  value: key,
}))

// Como o setor vende (AB-19): por hora, ou pela produção do equipamento.
// O setor que vende pelo equipamento não tem linha de mão de obra
const saleUnitOptions = [
  { value: 'HOUR', label: 'Por hora' },
  { value: 'M2', label: 'Por m² do equipamento' },
  { value: 'M', label: 'Por metro do equipamento' },
  { value: 'UN', label: 'Por unidade do equipamento' },
  { value: 'KM', label: 'Por km' },
]

type SaleUnit = NonNullable<ListSectorDataType['saleUnit']>

const moneyText = (cents?: number | null) =>
  cents === null || cents === undefined ? '' : String(cents / 100)
const centsOrNull = (value: string) => {
  if (!value.trim()) return null
  const number = Number(value.replace(',', '.'))
  return Number.isFinite(number) ? Math.round(number * 100) : null
}

export function EditItemDialog({ open, setOpen, rowData }: Props) {
  const queryClient = useQueryClient()
  const { canManageProductionStages, hasFeature } = usePlanFeatures()
  const { hasAnyPermission } = usePermissions()
  const { notifyActionError } = usePlanErrorToast()

  const canConfigProductionStages = canManageProductionStages()
  // A composição custeia a mão de obra e o preparo pela hora do setor
  const composition = hasFeature(FEATURES.COSTS.COST_BASE)
  const seesValues = hasAnyPermission(['values:values:view'])
  const [saleUnit, setSaleUnit] = useState<SaleUnit>('HOUR')
  const [hourCost, setHourCost] = useState('')
  const [hourSale, setHourSale] = useState('')

  useEffect(() => {
    if (!open) return
    setSaleUnit(rowData?.saleUnit || 'HOUR')
    setHourCost(moneyText(rowData?.hourCost))
    setHourSale(moneyText(rowData?.hourSale))
  }, [open, rowData])

  const form = useForm<FormType>({
    resolver: zodResolver(schema),
    values: {
      name: rowData?.name || '',
      icon: rowData?.icon || '',
      isProductionStage: rowData?.isProductionStage || false,
    },
  })

  const { handleSubmit, setValue, watch } = form

  // A cor do setor (área 9 §4.14): a escolhida (campo `color` do setor) ou
  // o padrão do ícone
  const colorOf = useSectorColor()
  const [color, setColor] = useState('')
  const [initialColor, setInitialColor] = useState('')
  useEffect(() => {
    if (open && rowData) {
      const current =
        rowData.color ||
        colorOf({ id: rowData.id, name: rowData.name, icon: rowData.icon })
      setColor(current)
      setInitialColor(current)
    }
  }, [open, rowData, colorOf])

  const mutation = useMutation({
    mutationFn: async (data: FormType) => {
      // A cor só vai no corpo quando foi trocada. A que coincide com o padrão
      // do ícone vai como nulo: o setor continua seguindo o padrão
      const body: FormType & {
        color?: string | null
        saleUnit?: SaleUnit
        hourCost?: number | null
        hourSale?: number | null
      } = { ...data }
      // Vai só o que mudou: gravar custo ou venda da hora pede a permissão
      // de valores
      if (composition) {
        if (saleUnit !== (rowData?.saleUnit || 'HOUR')) {
          body.saleUnit = saleUnit
        }
        if (seesValues) {
          const cost = centsOrNull(hourCost)
          const sale = centsOrNull(hourSale)
          if (cost !== (rowData?.hourCost ?? null)) body.hourCost = cost
          if (sale !== (rowData?.hourSale ?? null)) body.hourSale = sale
        }
      }
      if (color !== initialColor) {
        const padrao = sectorDefaultColor({ name: data.name, icon: data.icon })
        body.color = color && color !== padrao ? color : null
      }
      return updateItemNew({
        route: `/sector/${rowData?.id}`,
        data: body,
      })
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
                  agenda, composição e lista de processos */}
              <div className="w-full space-y-1.5">
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
              {composition && (
                <div className="w-full space-y-3 rounded-lg border border-gray-200 p-3">
                  <div>
                    <p className="text-sm font-medium">Composição</p>
                    <p className="text-xs text-gray">
                      Como o setor vende e quanto vale a hora dele. Os processos
                      e as composições custeiam a mão de obra e o preparo por
                      estes valores, até a Base de custos calcular a hora.
                    </p>
                  </div>
                  <SelectBasic
                    name="sector-sale-unit"
                    label="Como o setor vende"
                    options={saleUnitOptions}
                    value={saleUnit}
                    onChange={(value) =>
                      value && setSaleUnit(String(value) as SaleUnit)
                    }
                  />
                  {seesValues && (
                    <div className="flex flex-wrap gap-4">
                      <div className="flex-[1_0_160px] space-y-1.5">
                        <label
                          htmlFor="sector-hour-cost"
                          className="text-sm font-medium"
                        >
                          Custo da hora
                        </label>
                        <Input
                          id="sector-hour-cost"
                          type="number"
                          min={0}
                          step="0.01"
                          startAdornment={<span className="text-sm">R$</span>}
                          value={hourCost}
                          onChange={(event) => setHourCost(event.target.value)}
                        />
                      </div>
                      <div className="flex-[1_0_160px] space-y-1.5">
                        <label
                          htmlFor="sector-hour-sale"
                          className="text-sm font-medium"
                        >
                          Hora vendida
                        </label>
                        <Input
                          id="sector-hour-sale"
                          type="number"
                          min={0}
                          step="0.01"
                          startAdornment={<span className="text-sm">R$</span>}
                          value={hourSale}
                          onChange={(event) => setHourSale(event.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
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
