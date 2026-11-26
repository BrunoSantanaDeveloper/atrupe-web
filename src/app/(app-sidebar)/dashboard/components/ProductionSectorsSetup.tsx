'use client'

// "Seus setores de produção" (área 9 §4.16; Maicol, 26/11/2026). A conta que
// entra no LITE diz em quais setores produz: cada etapa de cobrança dos
// produtos aponta um deles, e deles saem os ícones da Agenda de entrega.
// Diferente da pergunta do START ("o que a empresa produz"). Os setores não
// marcados ficam inativos, sem apagar; muda-se depois em Configurações ›
// Setores. Aparece uma vez, no painel.

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  IconArrowRight,
  IconBuildingFactory2,
  IconPlus,
} from '@tabler/icons-react'

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icon'
import { createItemNew, getItem } from '@/actions/_cruds'
import { FEATURES } from '@/consts/features'
import {
  sectorIconByName,
  sectorIcons,
  sectorKeyByName,
} from '@/consts/sectors'
import { usePlanFeatures } from '@/hooks/usePlanFeatures'
import { usePermissions } from '@/hooks/usePermissions'
import { usePlanErrorToast } from '@/hooks/usePlanErrorToast'
import { cn } from '@/lib/utils'

type SetupSector = {
  id: string
  name: string
  icon: string | null
  isActive: boolean
}
type Setup = { done: boolean; sectors: SetupSector[] }

const QUERY_KEY = ['production-sectors-setup']

const iconOf = (sector: { name: string; icon?: string | null }) =>
  (sector.icon && sectorIcons[sector.icon]?.icon) ||
  sectorIconByName(sector.name)

export function ProductionSectorsBanner() {
  const { hasFeature } = usePlanFeatures()
  const { hasPermission } = usePermissions()
  const [open, setOpen] = useState(false)
  const enabled =
    hasFeature(FEATURES.PRODUCTS.PRODUCT_PRODUCTION_STAGES) &&
    hasPermission('company_settings:sectors:edit')

  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await getItem({ route: '/sector/production-setup' })
      return res.success ? (res.data as Setup) : null
    },
    enabled,
  })

  if (!enabled || !data || data.done) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-brand-200 bg-brand-50 p-4 flex items-center gap-3 hover:bg-brand-100 transition-colors group text-left animate-in fade-in-0 duration-base"
      >
        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
          <Icon
            icon={IconBuildingFactory2}
            size="md"
            className="text-brand-600"
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-800">
            Monte o fluxo de produção da sua empresa
          </p>
          <p className="text-sm text-brand-600">
            Diga por quais setores os trabalhos passam até a entrega. É por eles
            que você acompanha a produção na Agenda de entrega.
          </p>
        </div>
        <Icon
          icon={IconArrowRight}
          size="md"
          className="text-brand-400 group-hover:text-brand-600 transition-colors"
        />
      </button>
      <ProductionSectorsDialog
        open={open}
        onOpenChange={setOpen}
        sectors={data.sectors}
      />
    </>
  )
}

function ProductionSectorsDialog({
  open,
  onOpenChange,
  sectors,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectors: SetupSector[]
}) {
  const queryClient = useQueryClient()
  const { notifyActionError } = usePlanErrorToast()
  const [active, setActive] = useState<string[]>([])
  const [created, setCreated] = useState<string[]>([])
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setActive(sectors.filter((sector) => sector.isActive).map((s) => s.id))
    setCreated([])
    setName('')
  }, [open, sectors])

  const toggle = (id: string, checked: boolean) =>
    setActive((current) =>
      checked ? [...current, id] : current.filter((item) => item !== id),
    )

  const norm = (value: string) => value.trim().toLowerCase()
  const exists = (value: string) =>
    sectors.some((sector) => norm(sector.name) === norm(value)) ||
    created.some((item) => norm(item) === norm(value))

  const addNew = () => {
    const value = name.trim()
    if (value.length < 2) return
    if (exists(value)) {
      toast.error('Já existe um setor com esse nome')
      return
    }
    setCreated((current) => [...current, value])
    setName('')
  }

  const total = active.length + created.length

  const save = async () => {
    setSaving(true)
    const res = await createItemNew({
      route: '/sector/production-setup',
      data: {
        activeIds: active,
        newSectors: created.map((item) => ({
          name: item,
          icon: sectorKeyByName(item),
        })),
      },
    })
    setSaving(false)
    if (!res.success) {
      notifyActionError(res, 'Não foi possível salvar os setores')
      return
    }
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    queryClient.invalidateQueries({ queryKey: ['sectors'] })
    toast.success('Setores de produção salvos')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Por onde passam os trabalhos?</DialogTitle>
          <DialogDescription>
            Marque os setores por onde os trabalhos da sua empresa passam até a
            entrega, como criação, impressão, acabamento e instalação. Cada
            setor vira uma etapa na Agenda de entrega: você vê em que setor está
            cada pedido, o que ainda falta e, filtrando pelo setor, a fila de
            trabalho dele. Os que você não marcar ficam guardados e podem ser
            ligados depois em Configurações › Setores.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sectors.map((sector) => {
              const checked = active.includes(sector.id)
              return (
                <label
                  key={sector.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors',
                    checked
                      ? 'border-brand-300 bg-brand-50'
                      : 'border-gray-200 hover:bg-gray-50',
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => toggle(sector.id, !!value)}
                  />
                  <Icon icon={iconOf(sector)} size="md" />
                  <span className="truncate">{sector.name}</span>
                </label>
              )
            })}
            {created.map((item) => (
              <label
                key={item}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-300 bg-brand-50 p-3 text-sm"
              >
                <Checkbox
                  checked
                  onCheckedChange={() =>
                    setCreated((current) => current.filter((c) => c !== item))
                  }
                />
                <Icon icon={iconOf({ name: item })} size="md" />
                <span className="truncate">{item}</span>
                <span className="ml-auto type-caption text-brand-700">
                  novo
                </span>
              </label>
            ))}
          </div>

          <div className="flex items-end gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label
                htmlFor="new-production-sector"
                className="text-sm font-medium text-gray-700"
              >
                Falta algum setor? Crie aqui
              </label>
              <Input
                id="new-production-sector"
                value={name}
                placeholder="Ex.: Serralheria, Letra caixa"
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addNew()
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="neutralOutline"
              onClick={addNew}
              disabled={name.trim().length < 2}
            >
              <Icon icon={IconPlus} size="sm" />
              Acrescentar
            </Button>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            type="button"
            variant="neutralGhost"
            onClick={() => onOpenChange(false)}
          >
            Depois
          </Button>
          <Button type="button" onClick={save} disabled={!total || saving}>
            Salvar setores
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
