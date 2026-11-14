'use client'

// A impressão do produto na gráfica rápida (LITE, 12/11/2026), com Papéis no
// plano: a sangria por lado (GR-1.1) e as folhas de acerto que o orçamento
// usa para contar as folhas. Vazias, valem as do setor; a tela diz o valor
// em uso e de onde ele vem. O papel vem da variação. Grava por ação (botão
// Salvar), depois que o produto existe.

// React
import { useEffect, useState } from 'react'

// UI
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PermissionGate } from '@/components/common/PermissionGate'

// Third-party
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Actions
import { getPrintSettings, savePrintSettings } from '@/actions/print'

const EDIT = ['product_settings:products:edit']

const numberOrNull = (value: string) =>
  value.trim() === '' ? null : Number(value.replace(',', '.'))

export function ProductPrintSettings({ productId }: { productId: string }) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['print-settings', productId],
    queryFn: () => getPrintSettings(productId),
  })
  const settings = data?.data

  const [bleed, setBleed] = useState('')
  const [setup, setSetup] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!settings) return
    setBleed(settings.bleedMm === null ? '' : String(settings.bleedMm))
    setSetup(settings.setupSheets === null ? '' : String(settings.setupSheets))
  }, [settings])

  if (isLoading || !settings) return null

  const sectorBleed = settings.sector.bleedMm
  const sectorSetup = settings.sector.setupSheets
  const bleedHint =
    bleed.trim() === ''
      ? sectorBleed !== null
        ? `Vazio: vale a do setor, ${sectorBleed} mm por lado.`
        : 'Vazio: vale o padrão do sistema, 2 mm por lado.'
      : `Vale ${bleed} mm por lado, deste produto.`
  const setupHint =
    setup.trim() === ''
      ? sectorSetup
        ? `Vazio: vale a do setor, ${sectorSetup} por trabalho.`
        : 'Vazio: nenhuma.'
      : `${setup} por trabalho, deste produto.`

  const handleSave = async () => {
    setSaving(true)
    const res = await savePrintSettings(productId, {
      bleedMm: numberOrNull(bleed),
      setupSheets: numberOrNull(setup),
    })
    setSaving(false)
    if (!res.success) {
      toast.error(res.message)
      return
    }
    toast.success('Impressão do produto salva')
    queryClient.invalidateQueries({ queryKey: ['print-settings', productId] })
  }

  return (
    <div className="w-full space-y-4 rounded-xl border border-gray-200 bg-white p-4">
      <div>
        <h4 className="type-card-title">Impressão</h4>
        <p className="text-sm text-gray">
          Como o orçamento conta as folhas deste produto. O papel vem da
          variação; aqui ficam a sangria e as folhas de acerto.
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <div className="flex flex-[1_0_160px] flex-col gap-1.5">
          <label htmlFor="print-bleed" className="text-sm font-medium">
            Sangria por lado (mm)
          </label>
          <Input
            id="print-bleed"
            type="number"
            min={0}
            max={20}
            step="0.5"
            placeholder={String(sectorBleed ?? 2)}
            value={bleed}
            onChange={(event) => setBleed(event.target.value)}
          />
          <p className="text-xs text-gray">{bleedHint}</p>
        </div>
        <div className="flex flex-[1_0_160px] flex-col gap-1.5">
          <label htmlFor="print-setup" className="text-sm font-medium">
            Folhas de acerto
          </label>
          <Input
            id="print-setup"
            type="number"
            min={0}
            step="1"
            placeholder={String(sectorSetup ?? 0)}
            value={setup}
            onChange={(event) => setSetup(event.target.value)}
          />
          <p className="text-xs text-gray">{setupHint}</p>
        </div>
      </div>

      <PermissionGate permissions={EDIT}>
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            isLoading={saving}
            disabled={saving}
          >
            Salvar impressão
          </Button>
        </div>
      </PermissionGate>
    </div>
  )
}
