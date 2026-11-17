'use client'

// React / Next
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
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

// Types
import type { AssetRecord, AssetSetupItem } from '../../types'

// Actions
import { createAssetSetup, updateAssetSetup } from '@/actions/asset'

// Hooks / Store / Consts
import { assetUnitShort } from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus } from '@tabler/icons-react'

interface Props {
  asset: AssetRecord
  // Com a configuração, a mesma janela edita (28/10/2026)
  setup?: AssetSetupItem
  // Controlada de fora (a linha da tabela); sem isso, traz o próprio botão
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Configuração produtiva (P-2). A produtividade do bem é a soma das
// configurações (P-31), e o tempo de atividade sai de tempo × produtividade.
export function SetupModal({
  asset,
  setup: editing,
  open: openProp,
  onOpenChange,
}: Props) {
  const queryClient = useQueryClient()
  const [innerOpen, setInnerOpen] = useState(false)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : innerOpen
  const setOpen = (value: boolean) =>
    controlled ? onOpenChange?.(value) : setInnerOpen(value)
  const [name, setName] = useState('')
  const [abbreviation, setAbbreviation] = useState('')
  const [minutes, setMinutes] = useState('5')
  const [productivity, setProductivity] = useState('')

  // Ao abrir para editar, os campos vêm da configuração
  useEffect(() => {
    if (!open || !editing) return
    setName(editing.name)
    setAbbreviation(editing.abbreviation)
    setMinutes(String(editing.timePerUnit))
    setProductivity(String(editing.monthlyProductivity))
  }, [open, editing])

  const unit = asset.unit ? assetUnitShort[asset.unit] : 'un'
  const activityHours = Math.round(
    (Number(minutes || 0) * Number(productivity || 0)) / 60,
  )

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const values = {
        name,
        abbreviation: abbreviation || name.slice(0, 4).toLowerCase(),
        unit: asset.unit || 'UN',
        timePerUnit: Number(minutes || 0),
        monthlyProductivity: Number(productivity || 0),
      }
      return editing
        ? updateAssetSetup({
            assetId: asset.id,
            setupId: editing.id,
            setup: values,
          })
        : createAssetSetup({ assetId: asset.id, setup: values })
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)

      toast.success(
        editing ? 'Configuração atualizada' : 'Configuração produtiva criada',
      )
      queryClient.invalidateQueries({ queryKey: ['asset', asset.id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      setName('')
      setAbbreviation('')
      setProductivity('')
      setOpen(false)
    },
    onError: () =>
      toast.error(
        editing
          ? 'Erro ao salvar a configuração'
          : 'Erro ao criar a configuração',
      ),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!controlled && (
        <Button
          variant="neutralOutline"
          LeftIcon={IconPlus}
          onClick={() => setOpen(true)}
        >
          Nova configuração
        </Button>
      )}
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <DialogTitle>
              {editing
                ? 'Editar configuração produtiva'
                : 'Nova configuração produtiva'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Modo de trabalho do bem, com tempo e volume mensal próprios.
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="setup-name" className="text-sm font-medium">
                Nome
              </label>
              <Input
                id="setup-name"
                value={name}
                placeholder="Ex.: 4 passes"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="setup-abbr" className="text-sm font-medium">
                Abreviatura
              </label>
              <Input
                id="setup-abbr"
                value={abbreviation}
                placeholder="Ex.: 4pas"
                onChange={(event) => setAbbreviation(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="setup-minutes" className="text-sm font-medium">
                Tempo por {unit}
              </label>
              <Input
                id="setup-minutes"
                type="number"
                min={0}
                step="0.1"
                endAdornment={<span className="text-sm">min</span>}
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="setup-productivity"
                className="text-sm font-medium"
              >
                Volume mensal previsto ({unit}/mês)
              </label>
              <Input
                id="setup-productivity"
                type="number"
                min={0}
                value={productivity}
                onChange={(event) => setProductivity(event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-3">
            <p className="text-sm text-gray">Tempo em atividade</p>
            <p className="text-lg font-semibold text-gray-900">
              {activityHours} h/mês
            </p>
            <p className="text-sm text-gray">
              Tempo por {unit} × volume mensal previsto. É a base do rateio do
              custo da máquina entre as configurações.
            </p>
          </div>

          <p className="text-sm text-gray">
            O volume mensal previsto do bem passa a ser a soma das
            configurações.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!name || !productivity}
            onClick={() => mutate()}
          >
            {editing ? 'Salvar' : 'Cadastrar configuração'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
