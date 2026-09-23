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
import { ActionButton } from '@/components/common/ActionButton'

// Types
import type { DimensionRule, Process } from '../types'

// Actions
import { createProcess, updateProcess } from '@/actions/processes'

// Hooks / Store / Consts
import { dimensionRuleOptions } from '@/consts/processes'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconPencil } from '@tabler/icons-react'

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
interface Props {
  // Com o processo informado, o mesmo formulário edita em vez de criar
  process?: Process
}

export function NewProcessModal({ process }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEdit = Boolean(process)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(process?.name || '')
  const [sector, setSector] = useState(process?.sector || sectors[0].value)
  const [dimensionRule, setDimensionRule] = useState<DimensionRule>(
    process?.dimensionRule || 'FREE_SIZE',
  )
  // Tempo de preparo vem preenchido com um padrão; sem preparo, informa zero
  const [setupMinutes, setSetupMinutes] = useState(
    process ? String(process.setupMinutes) : '10',
  )

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      process
        ? updateProcess({
            id: process.id,
            name,
            sector,
            dimensionRule,
            setupMinutes: Number(setupMinutes) || 0,
          })
        : createProcess({
            name,
            sector,
            dimensionRule,
            setupMinutes: Number(setupMinutes) || 0,
          }),
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success(isEdit ? 'Processo atualizado' : 'Processo criado')
      queryClient.invalidateQueries({ queryKey: ['processes'] })
      queryClient.invalidateQueries({ queryKey: ['process'] })
      setOpen(false)

      if (isEdit) return

      setName('')

      if (response.data) {
        router.push(`/configuracoes/produtos/processos/${response.data.id}`)
      }
    },
    onError: () =>
      toast.error(
        isEdit ? 'Erro ao atualizar o processo' : 'Erro ao criar o processo',
      ),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <ActionButton
          Icon={IconPencil}
          tooltip={`Editar ${process?.name}`}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
          Novo processo
        </Button>
      )}
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon
              variant="neutralOutline"
              Icon={isEdit ? IconPencil : IconPlus}
            />
            <DialogTitle>
              {isEdit ? 'Editar processo' : 'Novo processo'}
            </DialogTitle>
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
          <div className="space-y-1.5">
            <label htmlFor="process-setup" className="text-sm font-medium">
              Tempo de preparo (minutos)
            </label>
            <Input
              id="process-setup"
              type="number"
              min={0}
              value={setupMinutes}
              onChange={(event) => setSetupMinutes(event.target.value)}
            />
            <p className="text-sm text-gray">
              O preparo acontece uma vez por pedido, não por peça: acerto de
              máquina, separação de material, montagem de gabarito. Sem preparo,
              informe zero.
            </p>
          </div>
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
            {isEdit ? 'Salvar alterações' : 'Criar processo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
