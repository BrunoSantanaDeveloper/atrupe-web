'use client'

// As contas das fontes do comparativo que não vêm de um patrimônio: o
// material das composições vendidas e o custo financeiro sobre o recebido.
// Sem escolha, vale a conta padrão ("Matéria Prima" e "Tarifa de Cartão de
// Crédito"), que a API já devolve resolvida.

// React
import { useEffect, useState } from 'react'

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
import { Button } from '@/components/ui/button'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Actions
import {
  getComparisonSettings,
  updateComparisonSettings,
} from '@/actions/cost-base'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// A opção "padrão" do seletor: o Select não aceita valor vazio
const DEFAULT_ACCOUNT = 'padrao'

export function ComparisonSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [material, setMaterial] = useState(DEFAULT_ACCOUNT)
  const [financial, setFinancial] = useState(DEFAULT_ACCOUNT)
  const [saving, setSaving] = useState(false)

  const { data, isLoading } = useQuery({
    enabled: open,
    queryKey: ['cost-comparison-settings'],
    queryFn: () => getComparisonSettings(),
  })
  const settings = data?.data

  useEffect(() => {
    if (!open || !settings) return
    setMaterial(settings.materialSubCategoryId ?? DEFAULT_ACCOUNT)
    setFinancial(settings.financialCostSubCategoryId ?? DEFAULT_ACCOUNT)
  }, [open, settings])

  const options = [
    { value: DEFAULT_ACCOUNT, label: 'A conta padrão' },
    ...(settings?.accounts ?? []).map((account) => ({
      value: account.id,
      label: `${account.chartAccount} · ${account.name}`,
    })),
  ]

  const save = async () => {
    setSaving(true)
    const res = await updateComparisonSettings({
      materialSubCategoryId: material === DEFAULT_ACCOUNT ? null : material,
      financialCostSubCategoryId:
        financial === DEFAULT_ACCOUNT ? null : financial,
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    toast.success('Contas salvas')
    queryClient.invalidateQueries({ queryKey: ['cost-comparison-settings'] })
    queryClient.invalidateQueries({ queryKey: ['cost-comparison'] })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Contas das fontes</DialogTitle>
          <DialogDescription>
            Em que conta do plano de contas o comparativo põe o previsto que não
            vem de um patrimônio. Sem escolha, vale a conta padrão: Matéria
            Prima para o material e Tarifa de Cartão de Crédito para o custo
            financeiro.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <SelectBasic
            name="material-account"
            label="Material das composições vendidas"
            value={material}
            onChange={(value) => setMaterial(value || DEFAULT_ACCOUNT)}
            options={options}
            disabled={isLoading}
          />
          <SelectBasic
            name="financial-account"
            label="Custo financeiro (percentual da precificação sobre o recebido)"
            value={financial}
            onChange={(value) => setFinancial(value || DEFAULT_ACCOUNT)}
            options={options}
            disabled={isLoading}
          />
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={save}
            isLoading={saving}
            disabled={isLoading || !settings}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
