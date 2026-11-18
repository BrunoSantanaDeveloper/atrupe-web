'use client'

// As leituras do contador do bem (hodômetro, horímetro, contador de m²): a
// diferença entre elas é o volume do bem no período, e o comparativo da base
// de custos usa esse volume antes do vendido e da produtividade do cadastro

// React
import { InfoHint } from '@/components/common/InfoHint'
import { useState } from 'react'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { ActionButton } from '@/components/common/ActionButton'
import { PermissionGate } from '@/components/common/PermissionGate'

// Types
import type { AssetUnit } from '../../types'

// Actions
import {
  getAssetReadings,
  createAssetReading,
  deleteAssetReading,
} from '@/actions/asset'

// Hooks / Store / Consts
import { useAlertDialog } from '@/store/useAlertDialog'
import { assetUnitShort } from '@/consts/assets'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Hoje no fuso de quem usa, AAAA-MM-DD
const today = () => {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

const formatDate = (date: string) =>
  date ? new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR') : '-'

export function AssetReadingsCard({
  assetId,
  unit,
}: {
  assetId: string
  unit: AssetUnit | null
}) {
  const queryClient = useQueryClient()
  const alertDialog = useAlertDialog()
  const [date, setDate] = useState(today)
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['asset-readings', assetId],
    queryFn: () => getAssetReadings({ assetId }),
  })
  const readings = data?.data?.readings ?? []
  const unitLabel = unit ? assetUnitShort[unit] : ''
  const formatReading = (reading: number) =>
    `${reading.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${unitLabel ? ` ${unitLabel}` : ''}`

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['asset-readings', assetId] })

  const save = async () => {
    const number = Number(value.replace(',', '.'))
    setSaving(true)
    const res = await createAssetReading({ assetId, date, value: number })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Leitura registrada')
    setValue('')
    refresh()
  }

  const remove = (readingId: string) =>
    alertDialog.open({
      title: 'Excluir a leitura?',
      description:
        'O volume do período no comparativo passa a vir das outras leituras.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      confirmVariant: 'error',
      iconTone: 'error',
      onConfirm: async () => {
        const res = await deleteAssetReading({ assetId, readingId })
        if (!res.success) throw new Error(res.message)
        refresh()
      },
      toastMsg: {
        success: 'Leitura excluída',
        error: 'Erro ao excluir a leitura',
      },
    })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-1.5">
          <CardTitle>Leituras do contador</CardTitle>
          <InfoHint title="Leituras do contador">
            <p>
              Hodômetro, horímetro ou contador de m². A diferença entre as
              leituras é o volume do bem no período, e o comparativo da base de
              custos usa esse volume para prever os custos por unidade.
            </p>
          </InfoHint>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <PermissionGate permissions={['cost:base:edit']}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="reading-date">Data</Label>
              <Input
                id="reading-date"
                type="date"
                value={date}
                max={today()}
                onChange={(event) => setDate(event.target.value)}
                className="w-44"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reading-value">
                O contador marca{unitLabel ? ` (${unitLabel})` : ''}
              </Label>
              <Input
                id="reading-value"
                type="number"
                min={0}
                step="0.01"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="w-44"
              />
            </div>
            <Button
              type="button"
              onClick={save}
              isLoading={saving}
              disabled={!date || value === ''}
            >
              Registrar leitura
            </Button>
          </div>
        </PermissionGate>

        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : readings.length ? (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[30%]">Data</TableHead>
                <TableHead numeric className="w-[30%]">
                  Leitura
                </TableHead>
                <TableHead className="w-[30%]">Registrada por</TableHead>
                <TableHead className="w-[10%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>{formatDate(reading.date)}</TableCell>
                  <TableCell numeric>{formatReading(reading.value)}</TableCell>
                  <TableCell className="text-gray">
                    {reading.createdByName || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <PermissionGate permissions={['cost:base:edit']}>
                      <ActionButton
                        gesto="excluir"
                        variant="neutralGhost"
                        tooltip="Excluir a leitura"
                        onClick={() => remove(reading.id)}
                      />
                    </PermissionGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-gray">
            Nenhuma leitura registrada. Sem leituras, o comparativo usa o
            vendido pelas composições ou o volume mensal previsto do cadastro.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
