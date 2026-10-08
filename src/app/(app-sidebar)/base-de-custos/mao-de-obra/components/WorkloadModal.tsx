'use client'

// React / Next
import { useEffect, useState } from 'react'

// UI
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'

// Components
import { EmptyState } from '@/components/ui/empty-state'
import {
  RateInput,
  parseHours,
  formatHours,
  formatHoursLabel,
} from '@/components/common/RateInput'

// Types
import type { LaborSector } from '../../types'

// Actions
import { updateLaborHours } from '@/actions/cost-base'

// Hooks / Store / Consts
import { formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons

interface Props {
  sector?: LaborSector
  open: boolean
  onOpenChange: () => void
}

export function WorkloadModal({ sector, open, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [hours, setHours] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!sector) return

    setHours(
      Object.fromEntries(
        sector.collaborators.map((person) => [person.id, person.hours]),
      ),
    )
  }, [sector])

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateLaborHours({
        sectorId: sector?.id || '',
        hours: Object.entries(hours).map(([id, value]) => ({
          id,
          hours: value,
        })),
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Carga horária salva')
      queryClient.invalidateQueries({ queryKey: ['labor-sectors'] })
      onOpenChange()
    },
    onError: () => toast.error('Erro ao salvar a carga horária'),
  })

  const totalHours = Object.values(hours).reduce((sum, value) => sum + value, 0)
  const cost = sector?.distributedCost || 0
  const costPerHour = totalHours ? Math.round(cost / totalHours) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>Carga de produção por colaborador</DialogTitle>
            <DialogDescription className="sr-only">
              Informe quantas horas cada colaborador dedica à produção do setor.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-3 gap-4 pb-5">
            <div>
              <p className="type-kpi-label">Custo distribuído</p>
              <p className="type-kpi-value">
                {cost ? formatCurrencyToBrl(cost) : '-'}
              </p>
            </div>
            <div>
              <p className="type-kpi-label">Carga horária estimada</p>
              <p className="type-kpi-value">
                {totalHours ? formatHoursLabel(totalHours) : '-'}
              </p>
            </div>
            <div>
              <p className="type-kpi-label">Custo hora estimado</p>
              <p className="type-kpi-value">
                {costPerHour ? formatCurrencyToBrl(costPerHour) : '-'}
              </p>
            </div>
          </div>

          {sector?.collaborators.length ? (
            <div className="space-y-4">
              {sector.collaborators.map((person) => (
                <div
                  key={person.id}
                  className="flex flex-wrap items-center gap-4"
                >
                  <div className="min-w-[160px]">
                    <p className="text-sm font-medium">{person.name}</p>
                    <p className="text-sm text-gray">{person.role}</p>
                  </div>
                  <Slider
                    className="flex-1 min-w-[140px]"
                    min={0}
                    // O limite da barra é de desenho: o campo pode passar dele
                    max={Math.max(220, Math.ceil(hours[person.id] ?? 0))}
                    step={1}
                    value={[hours[person.id] ?? 0]}
                    aria-label={`Carga horária — ${person.name}`}
                    onValueChange={([value]) =>
                      setHours((current) => ({
                        ...current,
                        [person.id]: value,
                      }))
                    }
                  />
                  <RateInput
                    className="h-10 w-[112px]"
                    value={hours[person.id] ?? 0}
                    format={formatHours}
                    parse={parseHours}
                    placeholder="0:00"
                    endAdornment={<span className="text-sm">h</span>}
                    aria-label={`Carga horária em horas e minutos — ${person.name}`}
                    onCommit={(value) =>
                      setHours((current) => ({
                        ...current,
                        [person.id]: value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              iconType="data"
              title="Nenhum colaborador ativo neste setor"
              description="Para estimar o custo hora deste setor é necessário ao menos um colaborador cadastrado."
            />
          )}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!sector?.collaborators.length}
            onClick={() => mutate()}
          >
            {isPending ? 'Salvando...' : 'Salvar carga'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
