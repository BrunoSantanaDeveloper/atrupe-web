'use client'

// React / Next
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
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
import { SelectBasic } from '@/components/common/form/FormSelect'

// Actions
import { getProcesses } from '@/actions/processes'
import { addCompositionStep } from '@/actions/compositions'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

interface Props {
  productId: string
}

// A etapa usa um processo pronto ou composição própria (D3 §10)
export function AddStepModal({ productId }: Props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [processId, setProcessId] = useState('')
  const [minutes, setMinutes] = useState('10')
  const [cost, setCost] = useState('')

  const { data } = useQuery({
    staleTime: Infinity,
    queryKey: ['processes'],
    queryFn: () => getProcesses({}),
  })

  const processes = data?.data || []
  const selected = processes.find((process) => process.id === processId)

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      addCompositionStep({
        productId,
        step: {
          name: selected?.name || 'Etapa',
          sector: selected?.sector || '',
          processId: processId || null,
          estimatedMinutes: Number(minutes || 0),
          cost: Math.round(Number(cost || 0) * 100),
        },
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Etapa acrescentada')
      queryClient.invalidateQueries({ queryKey: ['composition', productId] })
      queryClient.invalidateQueries({ queryKey: ['compositions'] })
      setProcessId('')
      setCost('')
      setOpen(false)
    },
    onError: () => toast.error('Erro ao acrescentar a etapa'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
        Nova etapa
      </Button>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPlus} />
            <DialogTitle>Nova etapa da composição</DialogTitle>
            <DialogDescription className="sr-only">
              Escolha o processo que forma esta etapa do produto.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <SelectBasic
            name="process"
            label="Processo"
            value={processId}
            onChange={setProcessId}
            options={processes.map((process) => ({
              value: process.id,
              label: `${process.name} — ${process.sector}`,
            }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="step-minutes" className="text-sm font-medium">
                Tempo previsto
              </label>
              <Input
                id="step-minutes"
                type="number"
                min={0}
                endAdornment={<span className="text-sm">min</span>}
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="step-cost" className="text-sm font-medium">
                Custo da etapa
              </label>
              <Input
                id="step-cost"
                type="number"
                min={0}
                step="0.01"
                startAdornment={<span className="text-sm">R$</span>}
                value={cost}
                onChange={(event) => setCost(event.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-gray">
            O custo da etapa vem do processo, calculado pela medida do produto.
            Enquanto os cálculos não vêm da API, ele é informado aqui.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!processId || !cost}
            onClick={() => mutate()}
          >
            {isPending ? 'Acrescentando...' : 'Acrescentar etapa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
