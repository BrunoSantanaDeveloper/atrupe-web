'use client'

// O cadastro e a edição do papel (GR-0, GR-2): nome, setor, gramatura, o
// formato da folha (os padrões preenchem a medida; o personalizado pede) e a
// área útil, menor ou igual à folha. Área útil vazia é a folha inteira.

// React
import { useEffect, useMemo, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { ActionButton } from '@/components/common/ActionButton'
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { Paper, SheetFormat } from '../types'

// Actions
import { createPaper, updatePaper } from '@/actions/papers'

// Hooks / Consts
import { useSector } from '@/hooks/queries/useSector'
import { sheetFormatObj, sheetFormatOptions } from '@/consts/papers'

// Third-party
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconPlus, IconPencil } from '@tabler/icons-react'

const text = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value)
const numberOrNull = (value: string) =>
  value.trim() === '' ? null : Number(value.replace(',', '.'))

export function PaperDialog({ paper }: { paper?: Paper }) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(paper)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(paper?.name || '')
  const [grammage, setGrammage] = useState(text(paper?.grammage))
  const [format, setFormat] = useState<SheetFormat>(
    paper?.sheetFormat || 'SRA3',
  )
  const [sheet, setSheet] = useState({
    width: text(paper?.sheetWidth),
    height: text(paper?.sheetHeight),
  })
  const [usable, setUsable] = useState({
    width: text(paper?.usableWidth),
    height: text(paper?.usableHeight),
  })
  const [active, setActive] = useState(paper?.active ?? true)

  // O setor: o do papel, ou o primeiro de produção (como a API faz)
  const { data: sectorList } = useSector()
  const [sectorId, setSectorId] = useState(paper?.sectorId || '')
  const sectors = useMemo(
    () =>
      (sectorList || [])
        .filter((item) => item.isActive || item.id === paper?.sectorId)
        .map((item) => ({ value: item.id, label: item.name, kind: item.kind })),
    [sectorList, paper?.sectorId],
  )
  useEffect(() => {
    if (sectorId || !sectors.length) return
    const production = sectors.find((item) => item.kind === 'PRODUCTION')
    setSectorId((production || sectors[0]).value)
  }, [sectorId, sectors])

  // O formato padrão preenche a folha e tranca a medida
  const preset = sheetFormatObj[format]
  const custom = format === 'CUSTOM'
  const sheetWidth = custom ? numberOrNull(sheet.width) : preset.width
  const sheetHeight = custom ? numberOrNull(sheet.height) : preset.height

  const usableWidth = numberOrNull(usable.width)
  const usableHeight = numberOrNull(usable.height)
  const usableIncomplete = (usableWidth === null) !== (usableHeight === null)
  const fits =
    usableWidth === null ||
    usableHeight === null ||
    sheetWidth === null ||
    sheetHeight === null ||
    (usableWidth <= sheetWidth && usableHeight <= sheetHeight) ||
    (usableWidth <= sheetHeight && usableHeight <= sheetWidth)

  const canSave =
    !!name.trim() &&
    !!sectorId &&
    (!custom || (!!sheetWidth && !!sheetHeight)) &&
    !usableIncomplete &&
    fits

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const values = {
        name: name.trim(),
        sectorId,
        grammage: numberOrNull(grammage),
        sheetFormat: format,
        sheetWidth,
        sheetHeight,
        usableWidth,
        usableHeight,
        ...(isEdit ? { active } : {}),
      }
      return paper
        ? updatePaper({ id: paper.id, ...values })
        : createPaper(values)
    },
    onSuccess: (response) => {
      if (!response.success) return toast.error(response.message)
      toast.success(isEdit ? 'Papel atualizado' : 'Papel cadastrado')
      queryClient.invalidateQueries({ queryKey: ['papers'] })
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      if (!isEdit) {
        setName('')
        setGrammage('')
        setUsable({ width: '', height: '' })
      }
      setOpen(false)
    },
    onError: () =>
      toast.error(
        isEdit ? 'Erro ao atualizar o papel' : 'Erro ao cadastrar o papel',
      ),
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <ActionButton
          Icon={IconPencil}
          tooltip={`Editar ${paper?.name}`}
          onClick={() => setOpen(true)}
        />
      ) : (
        <Button LeftIcon={IconPlus} onClick={() => setOpen(true)}>
          Novo papel
        </Button>
      )}
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar papel' : 'Novo papel'}</DialogTitle>
          <DialogDescription>
            A folha e a área útil alimentam a contagem de folhas e o
            aproveitamento. Medidas em milímetros.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="paper-name">Nome</Label>
            <Input
              id="paper-name"
              placeholder="Couché fosco 300 g"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectBasic
              name="paper-sector"
              label="Setor"
              options={sectors}
              value={sectorId}
              onChange={(value) => value && setSectorId(String(value))}
            />
            <div className="space-y-1.5">
              <Label htmlFor="paper-grammage">Gramatura (g/m²)</Label>
              <Input
                id="paper-grammage"
                type="number"
                min={1}
                step={1}
                placeholder="300"
                value={grammage}
                onChange={(event) => setGrammage(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 p-3">
            <SelectBasic
              name="paper-format"
              label="Formato da folha"
              options={sheetFormatOptions}
              value={format}
              onChange={(value) => value && setFormat(value as SheetFormat)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="paper-w">Largura (mm)</Label>
                <Input
                  id="paper-w"
                  type="number"
                  min={0}
                  disabled={!custom}
                  value={custom ? sheet.width : text(preset.width)}
                  onChange={(event) =>
                    setSheet((current) => ({
                      ...current,
                      width: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paper-h">Altura (mm)</Label>
                <Input
                  id="paper-h"
                  type="number"
                  min={0}
                  disabled={!custom}
                  value={custom ? sheet.height : text(preset.height)}
                  onChange={(event) =>
                    setSheet((current) => ({
                      ...current,
                      height: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* GR-2: a borda que a impressora não imprime sai daqui */}
          <div className="space-y-3 rounded-lg border border-gray-200 p-3">
            <div>
              <p className="text-sm font-medium">Área útil</p>
              <p className="text-sm text-gray">
                O que a impressora imprime de verdade, descontada a borda.
                Vazia, vale a folha inteira.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="paper-uw">Largura útil (mm)</Label>
                <Input
                  id="paper-uw"
                  type="number"
                  min={0}
                  value={usable.width}
                  onChange={(event) =>
                    setUsable((current) => ({
                      ...current,
                      width: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paper-uh">Altura útil (mm)</Label>
                <Input
                  id="paper-uh"
                  type="number"
                  min={0}
                  value={usable.height}
                  onChange={(event) =>
                    setUsable((current) => ({
                      ...current,
                      height: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            {usableIncomplete && (
              <p className="text-sm text-error-700">
                Informe a largura e a altura da área útil, ou deixe as duas
                vazias.
              </p>
            )}
            {!fits && (
              <p className="text-sm text-error-700">
                A área útil não pode ser maior que a folha.
              </p>
            )}
          </div>

          {isEdit && (
            <label className="flex items-center justify-between gap-4">
              <span>
                <span className="block text-sm font-medium">Ativo</span>
                <span className="block text-sm text-gray">
                  Inativo, o papel sai das listas e das composições.
                </span>
              </span>
              <Switch
                checked={active}
                onCheckedChange={setActive}
                aria-label="Ativo"
              />
            </label>
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
            disabled={!canSave}
            onClick={() => mutate()}
          >
            {isEdit ? 'Salvar' : 'Cadastrar papel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
