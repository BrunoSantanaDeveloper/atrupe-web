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

// Types
import type { StepKind } from '../types'

// Actions
import { getProcesses } from '@/actions/processes'
import { getAvailableParts, addCompositionStep } from '@/actions/compositions'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

interface Props {
  productId: string
}

// A etapa é um processo de um setor ou outro produto usado como parte
// (D3 §10 e IP-9): a fachada tem painel, forro e telhado, cada um com a sua
// composição
export function AddStepModal({ productId }: Props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [kind, setKind] = useState<StepKind>('PROCESS')
  const [processId, setProcessId] = useState('')
  const [partId, setPartId] = useState('')
  const [minutes, setMinutes] = useState('10')
  const [cost, setCost] = useState('')

  const { data } = useQuery({
    staleTime: Infinity,
    queryKey: ['processes'],
    queryFn: () => getProcesses({}),
  })

  const { data: partsData } = useQuery({
    staleTime: Infinity,
    queryKey: ['available-parts', productId],
    queryFn: () => getAvailableParts({ productId }),
  })

  const processes = data?.data || []
  const parts = partsData?.data || []
  const selected = processes.find((process) => process.id === processId)
  const selectedPart = parts.find((part) => part.id === partId)
  const isPart = kind === 'PART'

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      addCompositionStep({
        productId,
        step: {
          kind,
          name: (isPart ? selectedPart?.name : selected?.name) || 'Etapa',
          sector: isPart ? 'Parte do produto' : selected?.sector || '',
          partId: isPart ? partId : null,
          processId: isPart ? null : processId || null,
          setupMinutes: isPart
            ? selectedPart?.setupMinutes || 0
            : selected?.setupMinutes || 0,
          estimatedMinutes: Number(minutes || 0),
          cost: Math.round(Number(cost || 0) * 100),
        },
        // As variáveis que o processo consome viram campos do produto, sem
        // repetir nome nem valor (IP-4)
        fields: isPart
          ? []
          : (selected?.extraFields || []).map((field) => ({
              name: field.name,
              defaultValue: field.defaultValue,
            })),
      }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Etapa acrescentada')
      queryClient.invalidateQueries({ queryKey: ['composition', productId] })
      queryClient.invalidateQueries({ queryKey: ['compositions'] })
      setProcessId('')
      setPartId('')
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
            name="kind"
            label="O que forma esta etapa"
            value={kind}
            onChange={(value) => setKind(value as StepKind)}
            options={[
              { value: 'PROCESS', label: 'Um processo de um setor' },
              { value: 'PART', label: 'Outro produto, como parte' },
            ]}
          />
          {isPart ? (
            <>
              <SelectBasic
                name="part"
                label="Produto usado como parte"
                value={partId}
                onChange={setPartId}
                options={parts.map((part) => ({
                  value: part.id,
                  label: part.releasedForSale
                    ? part.name
                    : `${part.name} — parte`,
                }))}
              />
              <p className="text-sm text-gray">
                A parte entra com as medidas dela, não com as do produto: a
                largura da calha é a do telhado, não a da fachada.
              </p>
            </>
          ) : (
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
          )}
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
            disabled={(isPart ? !partId : !processId) || !cost}
            onClick={() => mutate()}
          >
            {isPending ? 'Acrescentando...' : 'Acrescentar etapa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
