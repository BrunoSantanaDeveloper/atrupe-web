'use client'

// Os dados fiscais do material de venda direta (decisão do PO de 14/10/2026):
// com o módulo Nota Fiscal, o material vendido sozinho no orçamento vai para
// a nota com o NCM, o CFOP e os CSTs daqui. O campo vazio sai do padrão do
// emissor, o mesmo do produto sem cadastro fiscal.

// React
import { useEffect, useState } from 'react'

// UI
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
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Types
import type { Material, MaterialFiscal } from '../types'

// Actions
import { updateMaterialFiscal } from '@/actions/materials'

// Third-party
import { useQueryClient } from '@tanstack/react-query'

// Icons
import { IconCircleCheck, IconReceiptTax } from '@tabler/icons-react'

type Field = {
  key: keyof MaterialFiscal
  label: string
  placeholder: string
  // Só dígitos, com o tamanho que a API confere
  digits?: number[]
  maxLength: number
}

const FIELDS: Field[] = [
  {
    key: 'ncm',
    label: 'NCM',
    placeholder: '39269090',
    digits: [8],
    maxLength: 8,
  },
  {
    key: 'cest',
    label: 'CEST',
    placeholder: 'Opcional',
    digits: [7],
    maxLength: 7,
  },
  {
    key: 'cfopInState',
    label: 'CFOP dentro do estado',
    placeholder: '5102',
    digits: [4],
    maxLength: 4,
  },
  {
    key: 'cfopOutState',
    label: 'CFOP fora do estado',
    placeholder: '6102',
    digits: [4],
    maxLength: 4,
  },
  {
    key: 'icmsOrigin',
    label: 'Origem da mercadoria',
    placeholder: '0',
    digits: [1],
    maxLength: 1,
  },
  {
    key: 'icmsCst',
    label: 'CST/CSOSN do ICMS',
    placeholder: '102',
    digits: [2, 3],
    maxLength: 3,
  },
  {
    key: 'pisCst',
    label: 'CST do PIS',
    placeholder: '99',
    digits: [2],
    maxLength: 2,
  },
  {
    key: 'cofinsCst',
    label: 'CST da COFINS',
    placeholder: '99',
    digits: [2],
    maxLength: 2,
  },
  {
    key: 'ipiCst',
    label: 'CST do IPI',
    placeholder: 'Opcional',
    digits: [2],
    maxLength: 2,
  },
  {
    key: 'commercialUnit',
    label: 'Unidade comercial',
    placeholder: 'M2',
    maxLength: 6,
  },
  {
    key: 'cean',
    label: 'Código de barras',
    placeholder: 'Opcional',
    maxLength: 14,
  },
]

const invalid = (field: Field, value: string) =>
  !!value &&
  !!field.digits &&
  !(/^[0-9]+$/.test(value) && field.digits.includes(value.length))

interface Props {
  material: Material | null
  onOpenChange: () => void
}

export function MaterialFiscalDialog({ material, onOpenChange }: Props) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<MaterialFiscal>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (material) setValues(material.fiscal ?? {})
  }, [material])

  const errors = FIELDS.filter((field) =>
    invalid(field, (values[field.key] ?? '').trim()),
  )

  const save = async () => {
    if (!material) return
    setSaving(true)
    const res = await updateMaterialFiscal({
      materialId: material.id,
      fiscal: values,
    })
    setSaving(false)
    if (!res.success) {
      toast.error(res.message)
      return
    }
    toast.success('Dados fiscais salvos')
    queryClient.invalidateQueries({ queryKey: ['materials'] })
    onOpenChange()
  }

  return (
    <Dialog open={!!material} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconReceiptTax} />
            <div>
              <DialogTitle>Dados fiscais de {material?.name}</DialogTitle>
              <DialogDescription>
                Vale quando o material é vendido sozinho no orçamento. O campo
                vazio sai do padrão do emissor.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => {
              const value = values[field.key] ?? ''
              const wrong = invalid(field, value.trim())
              return (
                <div key={field.key} className="space-y-1.5">
                  <Label htmlFor={`fiscal-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`fiscal-${field.key}`}
                    value={value}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    inputMode={field.digits ? 'numeric' : undefined}
                    aria-invalid={wrong}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                  />
                  {wrong && (
                    <p className="text-xs text-error-600">
                      {field.digits?.length === 1
                        ? `${field.digits[0]} dígitos`
                        : `${field.digits?.join(' ou ')} dígitos`}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="neutralOutline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            RightIcon={IconCircleCheck}
            isLoading={saving}
            disabled={errors.length > 0}
            onClick={save}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
