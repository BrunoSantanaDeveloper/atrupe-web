'use client'

// O cadastro e a edição do papel (GR-0, GR-2): nome, setor, gramatura, o
// formato da folha (os padrões preenchem a medida; o personalizado pede) e a
// área útil, menor ou igual à folha. Área útil vazia é a folha inteira.
// Duplicar (20/11/2026): o papel novo nasce com os dados de outro, para só
// trocar a gramatura ou a folha; o nome acompanha a troca.

// React
import { InfoHint } from '@/components/common/InfoHint'
import { useMemo, useState } from 'react'

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
import { IconPlus, IconPencil, IconCopy } from '@tabler/icons-react'

const text = (value: number | null | undefined) =>
  value === null || value === undefined ? '' : String(value)
const numberOrNull = (value: string) =>
  value.trim() === '' ? null : Number(value.replace(',', '.'))

// Troca, no nome copiado, a gramatura ou o formato do papel de origem pelo
// novo: "Couché fosco 300 g SRA3" com 250 g vira "Couché fosco 250 g SRA3".
// Só a palavra inteira (o 300 de "3000" não troca)
const swapToken = (name: string, from: string, to: string) => {
  if (!from || !to || from === to) return name
  const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return name.replace(
    new RegExp(`(^|[^\\p{L}\\d])${escaped}(?=$|[^\\p{L}\\d])`, 'gu'),
    `$1${to}`,
  )
}

export function PaperDialog({
  paper,
  duplicateFrom,
}: {
  paper?: Paper
  // O papel de origem da cópia: o diálogo cadastra um papel novo
  duplicateFrom?: Paper
}) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(paper)
  const source = paper || duplicateFrom
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(source?.name || '')
  // Na cópia, o nome acompanha a gramatura e o formato até a pessoa
  // mexer nele
  const [nameTouched, setNameTouched] = useState(false)
  // A gramatura e o formato que estão escritos no nome agora (apagar a
  // gramatura para digitar outra não perde a referência)
  const [inName, setInName] = useState({ grammage: '', format: '' })
  const [grammage, setGrammage] = useState(text(source?.grammage))
  const [format, setFormat] = useState<SheetFormat>(
    source?.sheetFormat || 'SRA3',
  )
  const [sheet, setSheet] = useState({
    width: text(source?.sheetWidth),
    height: text(source?.sheetHeight),
  })
  const [usable, setUsable] = useState({
    width: text(source?.usableWidth),
    height: text(source?.usableHeight),
  })
  const [active, setActive] = useState(paper?.active ?? true)

  // O setor: o papel novo sempre pergunta (GP-47, item 9), sem padrão; a
  // cópia vem com o setor da origem
  const { data: sectorList } = useSector()
  const [sectorId, setSectorId] = useState(source?.sectorId || '')

  // Cada abertura começa do papel de origem (a cópia anterior não fica)
  const openDialog = () => {
    if (source) {
      setName(source.name)
      setGrammage(text(source.grammage))
      setFormat(source.sheetFormat || 'SRA3')
      setSheet({
        width: text(source.sheetWidth),
        height: text(source.sheetHeight),
      })
      setUsable({
        width: text(source.usableWidth),
        height: text(source.usableHeight),
      })
      setSectorId(source.sectorId || '')
      setActive(source.active ?? true)
    }
    setNameTouched(false)
    setInName({
      grammage: text(source?.grammage),
      format: source?.sheetFormat
        ? sheetFormatObj[source.sheetFormat].text
        : '',
    })
    setOpen(true)
  }

  const followName = duplicateFrom && !nameTouched
  const changeGrammage = (value: string) => {
    if (followName && value.trim()) {
      setName((current) => swapToken(current, inName.grammage, value.trim()))
      setInName((current) => ({ ...current, grammage: value.trim() }))
    }
    setGrammage(value)
  }
  const changeFormat = (value: SheetFormat) => {
    if (followName && value !== 'CUSTOM') {
      const to = sheetFormatObj[value].text
      setName((current) => swapToken(current, inName.format, to))
      setInName((current) => ({ ...current, format: to }))
    }
    setFormat(value)
  }
  const sectors = useMemo(
    () =>
      (sectorList || [])
        .filter((item) => item.isActive || item.id === paper?.sectorId)
        .map((item) => ({ value: item.id, label: item.name })),
    [sectorList, paper?.sectorId],
  )

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
      if (isEdit) toast.success('Papel atualizado')
      else if (duplicateFrom)
        toast.success(`Papel cadastrado a partir de ${duplicateFrom.name}`)
      else toast.success('Papel cadastrado')
      queryClient.invalidateQueries({ queryKey: ['papers'] })
      queryClient.invalidateQueries({ queryKey: ['materials'] })
      if (!source) {
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
          onClick={openDialog}
        />
      ) : duplicateFrom ? (
        <ActionButton
          Icon={IconCopy}
          tooltip={`Duplicar ${duplicateFrom.name}`}
          onClick={openDialog}
        />
      ) : (
        <Button LeftIcon={IconPlus} onClick={openDialog}>
          Novo papel
        </Button>
      )}
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          {duplicateFrom ? (
            <DialogTitle>Duplicar papel</DialogTitle>
          ) : (
            <DialogTitle>{isEdit ? 'Editar papel' : 'Novo papel'}</DialogTitle>
          )}
          {duplicateFrom ? (
            <DialogDescription>
              Um papel novo com os dados de {duplicateFrom.name}. Troque a
              gramatura ou a folha e cadastre: o nome acompanha a troca.
            </DialogDescription>
          ) : (
            <DialogDescription>
              A folha e a área útil alimentam a contagem de folhas e o
              aproveitamento. Medidas em milímetros.
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="paper-name">Nome</Label>
            <Input
              id="paper-name"
              placeholder="Couché fosco 300 g"
              value={name}
              onChange={(event) => {
                setNameTouched(true)
                setName(event.target.value)
              }}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectBasic
              name="paper-sector"
              label="Setor"
              placeholder="Escolha o setor"
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
                onChange={(event) => changeGrammage(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-gray-200 p-3">
            <SelectBasic
              name="paper-format"
              label="Formato da folha"
              options={sheetFormatOptions}
              value={format}
              onChange={(value) => value && changeFormat(value as SheetFormat)}
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
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium">Área útil</p>
              <InfoHint title="Área útil">
                <p>
                  A parte da folha que a impressora imprime de verdade. Muitas
                  impressoras não imprimem uma borda de alguns milímetros.
                </p>
                <p>
                  O orçamento usa a área útil para contar quantas peças cabem na
                  folha. Deixe vazia para usar a folha inteira.
                </p>
              </InfoHint>
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
              <span className="flex items-center gap-1.5">
                <span className="block text-sm font-medium">Ativo</span>
                <InfoHint title="Papel ativo">
                  <p>
                    Inativo, o papel deixa de aparecer nas listas e nas
                    composições. Os orçamentos já feitos não mudam.
                  </p>
                </InfoHint>
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
