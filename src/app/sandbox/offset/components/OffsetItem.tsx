'use client'

// O item de offset no orçamento (PRO). O vendedor informa o tamanho final, a
// quantidade, as cores de frente e verso (OF-1) e o papel. O cálculo corta a
// folha inteira em folhas de máquina (OF-2), soma o acerto (OF-3), tenta o
// tira e retira (OF-6) e fica com a máquina de menor custo (OF-5); quem orça
// pode trocar a máquina.

import { IconSparkles } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import {
  COLOR_OPTIONS,
  explain,
  formatBrl,
  formatCm,
  formatInt,
  formatTime,
  type OffsetJob,
  type OffsetMachine,
  type OffsetResult,
  type Paper,
} from '../calc'
import { SheetDiagram } from './SheetDiagram'

// Padrão do setor de gráfica (GR-1.1)
export const SECTOR_BLEED_MM = 2

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      {hint && <p className="text-sm text-gray">{hint}</p>}
    </div>
  )
}

export function OffsetItem({
  job,
  onJob,
  papers,
  paper,
  onPaperId,
  viable,
  unfit,
  chosenId,
  onChosenId,
  markup,
  onMarkup,
}: {
  job: OffsetJob
  onJob: (job: OffsetJob) => void
  papers: Paper[]
  paper: Paper
  onPaperId: (id: string) => void
  viable: OffsetResult[]
  unfit: OffsetMachine[]
  // 'AUTO' é a de menor custo
  chosenId: string
  onChosenId: (id: string) => void
  markup: number
  onMarkup: (markup: number) => void
}) {
  const patch = (changes: Partial<OffsetJob>) => onJob({ ...job, ...changes })
  const best = viable[0]
  const result =
    viable.find((item) => item.machine.id === chosenId) || best || null
  const manual = !!result && !!best && result.machine.id !== best.machine.id
  const colors =
    COLOR_OPTIONS.find(
      (item) => item.front === job.frontColors && item.back === job.backColors,
    )?.id || '4x4'
  const ownBleed = job.bleedMm !== SECTOR_BLEED_MM
  const lines = explain(viable, job)
  const saleCents = result ? Math.round(result.costs.totalCents * markup) : 0

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Item de offset</CardTitle>
          <CardDescription>
            No orçamento, ao adicionar um produto de impressão offset. O
            vendedor digita o tamanho final; a sangria e o resto ficam por conta
            do cálculo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="job-width">Largura final (cm)</Label>
              <Input
                id="job-width"
                type="number"
                min={1}
                step="0.1"
                value={job.width}
                onChange={(event) =>
                  patch({ width: Number(event.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job-height">Altura final (cm)</Label>
              <Input
                id="job-height"
                type="number"
                min={1}
                step="0.1"
                value={job.height}
                onChange={(event) =>
                  patch({ height: Number(event.target.value) || 0 })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="job-quantity">Quantidade</Label>
              <Input
                id="job-quantity"
                type="number"
                min={1}
                value={job.quantity}
                onChange={(event) =>
                  patch({ quantity: Number(event.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cores (frente × verso)</Label>
              <Select
                value={colors}
                onValueChange={(id) => {
                  const next = COLOR_OPTIONS.find((item) => item.id === id)
                  if (next)
                    patch({ frontColors: next.front, backColors: next.back })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Papel</Label>
            <Select value={paper.id} onValueChange={onPaperId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {papers.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray">
              Folha inteira a {formatBrl(paper.costCents)}.
            </p>
          </div>

          <div className="space-y-2 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Sangria de {job.bleedMm} mm por lado
                </p>
                <p className="text-sm text-gray">
                  {ownBleed ? 'Ajustada neste item' : 'Padrão do setor'}
                  {job.bleedMm === 0 ? ' · corte compartilhado' : ''}
                </p>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  min={0}
                  step="0.5"
                  aria-label="Sangria por lado, em mm"
                  value={job.bleedMm}
                  onChange={(event) =>
                    patch({ bleedMm: Number(event.target.value) || 0 })
                  }
                />
              </div>
            </div>
            {ownBleed && (
              <button
                type="button"
                className="text-sm text-brand-700 underline"
                onClick={() => patch({ bleedMm: SECTOR_BLEED_MM })}
              >
                Voltar ao padrão do setor ({SECTOR_BLEED_MM} mm)
              </button>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3">
            <Switch
              id="job-turn"
              checked={job.workAndTurn === 'AUTO'}
              onCheckedChange={(on) =>
                patch({ workAndTurn: on ? 'AUTO' : 'NO' })
              }
            />
            <div>
              <Label htmlFor="job-turn">Usar tira e retira quando der</Label>
              <p className="text-sm text-gray">
                Frente e verso com as mesmas cores na mesma folha: um jogo de
                chapas em vez de dois.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {!result ? (
          <Card>
            <CardContent className="p-6">
              <p role="alert" className="text-sm text-error-700">
                A peça de {formatCm(job.width)} × {formatCm(job.height)} cm não
                cabe em nenhuma máquina offset cadastrada com este papel.
                Diminua a medida, troque o papel ou cadastre uma máquina de
                formato maior em Patrimônios.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <CardTitle>Folhas e chapas</CardTitle>
                    <CardDescription>
                      {result.machine.name}
                      {manual
                        ? ' · escolhida por você'
                        : ' · a de menor custo para este trabalho'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.workAndTurn && (
                      <Badge variant="blueLight">Tira e retira</Badge>
                    )}
                    <Badge variant="neutralLight">
                      {job.frontColors}x{job.backColors}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 px-6 pb-6">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Stat
                    label="Peças por folha"
                    value={formatInt(result.piecesPerSheet)}
                    hint={`folha de ${formatCm(result.sheet.short)} × ${formatCm(result.sheet.long)} cm`}
                  />
                  <Stat
                    label="Folhas de máquina"
                    value={formatInt(result.machineSheets)}
                    hint={`${formatInt(result.runSheets)} + ${formatInt(result.makereadySheets)} de acerto`}
                  />
                  <Stat
                    label="Folhas inteiras"
                    value={formatInt(result.fullSheets)}
                    hint={`${result.sheet.perFullSheet} de máquina por folha`}
                  />
                  <Stat
                    label="Chapas"
                    value={String(result.plates)}
                    hint={
                      result.workAndTurn
                        ? `${job.frontColors + job.backColors} sem tira e retira`
                        : 'uma por cor de cada lado'
                    }
                  />
                </div>
                <SheetDiagram result={result} paper={paper} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <CardTitle>Custo e preço sugerido</CardTitle>
                    <CardDescription>
                      O papel cresce com a tiragem; as chapas e o acerto são do
                      trabalho e se diluem na quantidade.
                    </CardDescription>
                  </div>
                  <div className="w-28 space-y-1.5">
                    <Label htmlFor="job-markup">Markup</Label>
                    <Input
                      id="job-markup"
                      type="number"
                      min={1}
                      step="0.1"
                      value={markup}
                      onChange={(event) =>
                        onMarkup(Math.max(Number(event.target.value) || 1, 1))
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Linha</TableHead>
                      <TableHead>Consumo</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Papel</TableCell>
                      <TableCell>
                        {formatInt(result.fullSheets)} folhas inteiras ×{' '}
                        {formatBrl(paper.costCents)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBrl(result.costs.paperCents)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Chapas e gravação</TableCell>
                      <TableCell>
                        {result.plates} ×{' '}
                        {formatBrl(
                          result.machine.plateCents +
                            result.machine.engravingCents,
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBrl(result.costs.platesCents)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Acerto da máquina</TableCell>
                      <TableCell>
                        {formatTime(result.setupMinutes)} a{' '}
                        {formatBrl(result.machine.hourCents)} por hora
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBrl(result.costs.setupCents)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Impressão</TableCell>
                      <TableCell>
                        {formatInt(result.machineSheets)} folhas ×{' '}
                        {result.passesPerSheet}{' '}
                        {result.passesPerSheet === 1 ? 'passada' : 'passadas'} ·{' '}
                        {formatTime(result.runMinutes)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBrl(result.costs.runCents)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-50 font-semibold">
                      <TableCell colSpan={2}>
                        Custo do trabalho · {formatBrl(result.unitCents, 4)} por
                        peça
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBrl(result.costs.totalCents)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="font-semibold">
                      <TableCell colSpan={2}>
                        Preço sugerido ·{' '}
                        {formatBrl(saleCents / Math.max(job.quantity, 1), 4)}{' '}
                        por peça
                      </TableCell>
                      <TableCell className="text-right text-brand-700">
                        {formatBrl(saleCents)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <p className="mt-3 text-sm text-gray">
                  O corte, o refile e os acabamentos entram como outras etapas
                  da composição, como hoje.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Máquinas para este trabalho</CardTitle>
                <CardDescription>
                  O cálculo testa todas as máquinas offset do patrimônio e fica
                  com a de menor custo. Você pode trocar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Máquina</TableHead>
                      <TableHead>Folha de máquina</TableHead>
                      <TableHead>Peças por folha</TableHead>
                      <TableHead>Chapas</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viable.map((item, index) => {
                      const selected = item.machine.id === result.machine.id
                      return (
                        <TableRow
                          key={item.machine.id}
                          className={cn(selected && 'bg-brand-50')}
                        >
                          <TableCell className="font-medium text-gray-900">
                            {item.machine.name}
                            {index === 0 && (
                              <Badge variant="successLight" className="ml-2">
                                Menor custo
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatCm(item.sheet.short)} ×{' '}
                            {formatCm(item.sheet.long)} cm
                          </TableCell>
                          <TableCell>
                            {item.piecesPerSheet}
                            {item.workAndTurn ? ' · tira e retira' : ''}
                          </TableCell>
                          <TableCell>{item.plates}</TableCell>
                          <TableCell className="text-right">
                            {formatBrl(item.costs.totalCents)}
                          </TableCell>
                          <TableCell className="text-right">
                            {selected ? (
                              <span className="text-sm font-medium text-brand-700">
                                Em uso
                              </span>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="neutralOutline"
                                onClick={() =>
                                  onChosenId(
                                    index === 0 ? 'AUTO' : item.machine.id,
                                  )
                                }
                              >
                                Usar esta
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {unfit.map((machine) => (
                      <TableRow key={machine.id}>
                        <TableCell className="text-gray">
                          {machine.name}
                        </TableCell>
                        <TableCell colSpan={5} className="text-gray">
                          A peça não cabe no formato desta máquina (
                          {formatCm(machine.maxWidth)} ×{' '}
                          {formatCm(machine.maxHeight)} cm)
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {manual && best && (
                  <p className="text-sm text-warning-700">
                    Você trocou a máquina: o trabalho sai{' '}
                    {formatBrl(result.costs.totalCents - best.costs.totalCents)}{' '}
                    mais caro que na {best.machine.name}.{' '}
                    <button
                      type="button"
                      className="underline"
                      onClick={() => onChosenId('AUTO')}
                    >
                      Voltar para a de menor custo
                    </button>
                  </p>
                )}

                {lines.length > 0 && (
                  <div className="flex items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <IconSparkles
                      className="mt-0.5 size-5 shrink-0 text-purple-600"
                      aria-hidden
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-purple-700">
                        Por que esta máquina
                      </p>
                      {lines.map((line) => (
                        <p key={line} className="text-sm text-gray-700">
                          {line}
                        </p>
                      ))}
                      <p className="text-xs text-gray">
                        A IA explica com os números do cálculo. O preço não sai
                        do modelo.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
