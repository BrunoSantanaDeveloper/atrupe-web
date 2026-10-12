'use client'

// Importar lista de materiais com conciliação (IMP-1, área 4). A planilha
// que vem do SketchUp, da marcenaria ou do fornecedor é colada ou enviada
// aqui; cada linha é conciliada com o material cadastrado e a pessoa
// confirma, linha a linha, o que entra como novo e o que atualiza um
// material que já existe. O vínculo feito à mão fica guardado: da segunda
// vez o sistema já sabe.

// React
import { useEffect, useMemo, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { Material } from '../types'

// Actions
import {
  importMaterials,
  previewMaterialImport,
  type ImportRow,
  type ImportPreviewRow,
} from '@/actions/materials'

// Hooks / Store / Consts
import { useMoney } from '@/hooks/useMoney'
import { importStatusObj } from '@/consts/materials'

// Third-party
import { toast } from 'sonner'

// Icons
import { IconUpload } from '@tabler/icons-react'

interface Props {
  open: boolean
  materials: Material[]
  onOpenChange: (open: boolean) => void
  onDone: () => void
}

const EXAMPLE = `nome;unidade;setor;custo
Lona 440;m²;Impressão;12,50
MDF 10 mm;un;Marcenaria;89,00
Chapa de ACM 3 mm;m²;Serralheria;98,00`

// Planilha salva como texto: ponto e vírgula, vírgula ou tabulação. A
// primeira linha pode ser o cabeçalho; o custo aceita vírgula decimal
const parse = (text: string): ImportRow[] => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  if (!lines.length) return []
  const separator = lines[0].includes(';')
    ? ';'
    : lines[0].includes('\t')
      ? '\t'
      : ','
  const first = lines[0]
    .split(separator)
    .map((cell) => cell.trim().toLowerCase())
  const hasHeader = first.includes('nome') || first.includes('material')
  const nameAt = Math.max(
    0,
    first.findIndex((cell) => cell === 'nome' || cell === 'material'),
  )
  const unitAt = hasHeader
    ? first.findIndex((cell) => cell.startsWith('unid'))
    : 1
  const sectorAt = hasHeader ? first.findIndex((cell) => cell === 'setor') : 2
  const costAt = hasHeader
    ? first.findIndex((cell) => cell.startsWith('custo'))
    : 3

  return (hasHeader ? lines.slice(1) : lines).map((line) => {
    const cells = line.split(separator).map((cell) => cell.trim())
    const cost = costAt >= 0 ? cells[costAt] : ''
    const number = cost
      ? Number(
          cost
            .replace(/[^\d,.-]/g, '')
            .replace(/\./g, '')
            .replace(',', '.'),
        )
      : NaN
    return {
      name: cells[nameAt] || '',
      unit: unitAt >= 0 ? cells[unitAt] || '' : '',
      sector: sectorAt >= 0 ? cells[sectorAt] || '' : '',
      cost: Number.isFinite(number) ? Math.round(number * 100) : null,
    }
  })
}

export function ImportMaterialsDialog({
  open,
  materials,
  onOpenChange,
  onDone,
}: Props) {
  const money = useMoney()
  const [text, setText] = useState('')
  const [preview, setPreview] = useState<ImportPreviewRow[] | null>(null)
  // A decisão da pessoa por linha: vincular a um material, ou cadastrar novo
  const [links, setLinks] = useState<{ [line: number]: string }>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setText('')
      setPreview(null)
      setLinks({})
    }
  }, [open])

  const rows = useMemo(() => parse(text), [text])

  const conciliate = async () => {
    const res = await previewMaterialImport({ rows })
    if (!res.success) return toast.error(res.message)
    setPreview([...res.data])
    setLinks(
      Object.fromEntries(
        res.data
          .filter((row) => row.materialId)
          .map((row) => [row.line, row.materialId as string]),
      ),
    )
  }

  const readFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => setText(String(reader.result || ''))
    reader.readAsText(file)
  }

  const valid = (preview || []).filter((row) => row.status !== 'INVALID')
  // A linha nova sem setor não é cadastrada: precisa de vínculo com um
  // material, ou do setor na planilha (o servidor a devolve com o aviso)
  const blocked = (row: ImportPreviewRow) =>
    row.status !== 'INVALID' && !links[row.line] && !!row.problem
  const counts = {
    create: valid.filter((row) => !links[row.line] && !blocked(row)).length,
    update: valid.filter((row) => !!links[row.line]).length,
    invalid: (preview || []).filter(
      (row) => row.status === 'INVALID' || blocked(row),
    ).length,
  }

  const save = async () => {
    setSaving(true)
    const res = await importMaterials({
      rows: valid.map((row) => ({
        name: row.name,
        unit: row.unit,
        sector: row.sector,
        cost: row.cost,
        materialId: links[row.line] || null,
      })),
    })
    setSaving(false)
    if (!res.success || !res.data) return toast.error(res.message)
    const ignored = res.data.ignored
      ? ` · ${res.data.ignored} ${res.data.ignored === 1 ? 'linha ignorada' : 'linhas ignoradas'}`
      : ''
    toast.success(
      `${res.data.created} ${res.data.created === 1 ? 'material cadastrado' : 'materiais cadastrados'} · ${res.data.updated} ${res.data.updated === 1 ? 'atualizado' : 'atualizados'}${ignored}`,
    )
    onDone()
    onOpenChange(false)
  }

  // O Select do Radix não aceita valor vazio: "novo" é a opção sem vínculo
  const NEW = 'new'
  const options = [
    { value: NEW, label: 'Cadastrar como material novo' },
    ...materials
      .filter((material) => material.active)
      .map((material) => ({ value: material.id, label: material.name })),
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconUpload} />
            <div>
              <DialogTitle>Importar lista de materiais</DialogTitle>
              <DialogDescription>
                Cada linha é conciliada com o que já está cadastrado. O que você
                vincular à mão fica guardado: da próxima vez o sistema já sabe.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="max-h-[calc(100vh-240px)] space-y-4 overflow-y-auto">
          {!preview ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="neutralOutline" asChild>
                  <label className="cursor-pointer">
                    Enviar arquivo (.csv ou .txt)
                    <input
                      type="file"
                      accept=".csv,.txt,.tsv"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        if (file) readFile(file)
                      }}
                    />
                  </label>
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={() => setText(EXAMPLE)}
                >
                  Usar um exemplo
                </Button>
              </div>
              <div className="space-y-2">
                <label htmlFor="import-text" className="text-sm font-medium">
                  Ou cole a planilha
                </label>
                <Textarea
                  id="import-text"
                  rows={8}
                  className="font-mono text-xs"
                  placeholder={EXAMPLE}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
                <p className="text-sm text-gray">
                  Colunas: <strong>nome</strong>, <strong>unidade</strong> (m²,
                  m, un, kg, l), setor e custo por unidade. A primeira linha
                  pode ser o cabeçalho. Cadastre o material na unidade em que a
                  empresa vende: é nela que a entrada é convertida.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 text-sm">
                <Badge variant="successLight">
                  {counts.create} {counts.create === 1 ? 'novo' : 'novos'}
                </Badge>
                <Badge variant="blueLight">
                  {counts.update}{' '}
                  {counts.update === 1 ? 'já cadastrado' : 'já cadastrados'}
                </Badge>
                {counts.invalid > 0 && (
                  <Badge variant="errorLight">
                    {counts.invalid}{' '}
                    {counts.invalid === 1
                      ? 'linha ignorada'
                      : 'linhas ignoradas'}
                  </Badge>
                )}
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[32%]">Na planilha</TableHead>
                      <TableHead className="w-[10%]">Unidade</TableHead>
                      <TableHead numeric className="w-[14%]">
                        Custo
                      </TableHead>
                      <TableHead className="w-[16%]">Status</TableHead>
                      <TableHead className="w-[28%]">Entra como</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row) => {
                      const status =
                        row.status === 'INVALID'
                          ? importStatusObj.INVALID
                          : links[row.line]
                            ? row.status === 'LINKED'
                              ? importStatusObj.LINKED
                              : importStatusObj.MATCH
                            : importStatusObj.NEW
                      return (
                        <TableRow key={row.line}>
                          <TableCell>
                            <p className="font-medium text-gray-800">
                              {row.name || '—'}
                            </p>
                            {row.sector && (
                              <p className="text-xs text-gray">{row.sector}</p>
                            )}
                            {row.problem &&
                              (row.status === 'INVALID' || blocked(row)) && (
                                <p className="text-xs text-error-600">
                                  {row.problem}
                                </p>
                              )}
                          </TableCell>
                          <TableCell className="text-sm text-gray">
                            {row.unit || '—'}
                          </TableCell>
                          <TableCell numeric className="text-sm">
                            {row.cost === null ? '-' : money(row.cost)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>
                              {status.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {row.status !== 'INVALID' && (
                              <SelectBasic
                                name={`link-${row.line}`}
                                label=""
                                className="w-full"
                                options={options}
                                value={links[row.line] || NEW}
                                onChange={(value) =>
                                  setLinks((current) => {
                                    const next = { ...current }
                                    if (value && value !== NEW) {
                                      next[row.line] = value
                                    } else delete next[row.line]
                                    return next
                                  })
                                }
                              />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              <p className="text-sm text-gray">
                Material já cadastrado recebe o custo da planilha (quando não
                tem variação). O vínculo com nome diferente fica guardado como
                de-para.
              </p>
            </>
          )}
        </DialogBody>
        <DialogFooter className="flex-wrap sm:justify-between">
          {preview ? (
            <Button
              type="button"
              variant="link"
              className="px-0"
              onClick={() => setPreview(null)}
            >
              Voltar à planilha
            </Button>
          ) : (
            <span />
          )}
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            {preview ? (
              <Button
                type="button"
                isLoading={saving}
                disabled={!valid.length}
                onClick={save}
              >
                Importar {valid.length}{' '}
                {valid.length === 1 ? 'material' : 'materiais'}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!rows.length}
                onClick={conciliate}
              >
                Conciliar {rows.length ? `${rows.length} linhas` : ''}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
