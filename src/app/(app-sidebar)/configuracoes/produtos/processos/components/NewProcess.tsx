'use client'

// React / Next
import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
import type { DimensionRule } from '../types'

// Actions
import { createProcess } from '@/actions/processes'

// Hooks / Store / Consts
import { dimensionRuleOptions } from '@/consts/processes'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

const sectors = [
  'Impressão',
  'Produção',
  'Criação',
  'CNC',
  'Marcenaria',
  'Instalação',
  'Gráfica',
].map((sector) => ({ value: sector, label: sector }))

// Cada processo pertence a um setor (D3 §9). Os recursos entram na página do
// processo, depois de criado.
export function NewProcessModal() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [sector, setSector] = useState(sectors[0].value)
  const [dimensionRule, setDimensionRule] = useState<DimensionRule>('FREE_SIZE')

  const { mutate, isPending } = useMutation({
    mutationFn: () => createProcess({ name, sector, dimensionRule }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success('Processo criado')
      queryClient.invalidateQueries({ queryKey: ['processes'] })
      setOpen(false)
      setName('')

      if (response.data) {
        router.push(`/configuracoes/produtos/processos/${response.data.id}`)
      }
    },
    onError: () => toast.error('Erro ao criar o processo'),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
        Novo processo
      </Button>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPlus} />
            <DialogTitle>Novo processo</DialogTitle>
            <DialogDescription className="sr-only">
              Crie a etapa produtiva e escolha o setor responsável.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="process-name" className="text-sm font-medium">
              Nome
            </label>
            <Input
              id="process-name"
              value={name}
              placeholder="Ex.: Impressão em lona"
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <SelectBasic
            name="sector"
            label="Setor responsável"
            value={sector}
            onChange={setSector}
            options={sectors}
          />
          <SelectBasic
            name="dimension"
            label="Como a medida entra no cálculo"
            value={dimensionRule}
            onChange={(value) => setDimensionRule(value as DimensionRule)}
            options={dimensionRuleOptions}
          />
          <p className="text-sm text-gray">
            Os recursos — máquina, material, mão de obra e terceirizado — entram
            na página do processo, com a fórmula de cada um.
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
            disabled={!name}
            onClick={() => mutate()}
          >
            {isPending ? 'Criando...' : 'Criar processo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
