'use client'

/**
 * BulkNcmDialog
 *
 * Aplica um mesmo NCM aos produtos selecionados na listagem.
 *
 * Corrigir NCM produto a produto não escala numa base recém-migrada, onde
 * dezenas de produtos ficam com o NCM padrão herdado. O backend
 * (POST /fiscal/product/bulk-ncm) altera SOMENTE o ncm de quem já tem cadastro
 * fiscal e cria o cadastro com os defaults da empresa para quem não tem.
 */

// React
import { useEffect, useState } from 'react'

// UI
import { toast } from 'sonner'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icons
import { IconReceiptTax, IconCircleCheck } from '@tabler/icons-react'

// Actions
import { createItemNew } from '@/actions/_cruds'

// Hooks
import { useQueryClient } from '@tanstack/react-query'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  productIds: string[]
  onApplied?: () => void
}

/** Mesma regra do validateNcm do backend: 8 dígitos e nada de genérico. */
export function validateNcmInput(ncm: string): string | null {
  const digits = ncm.replace(/\D/g, '')

  if (!digits) return 'Informe o NCM.'
  if (digits.length !== 8) return 'O NCM deve ter 8 dígitos.'
  if (digits === '00000000') return 'NCM genérico não é aceito pela SEFAZ.'

  const capitulo = Number(digits.slice(0, 2))
  if (capitulo < 1 || capitulo > 99) {
    return 'NCM inválido: o capítulo deve estar entre 01 e 99.'
  }

  return null
}

export function BulkNcmDialog({
  open,
  onOpenChange,
  productIds,
  onApplied,
}: Props) {
  const queryClient = useQueryClient()
  const [ncm, setNcm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Cada abertura começa limpa: o NCM anterior não deve reaparecer numa
  // seleção diferente e ser aplicado sem querer.
  useEffect(() => {
    if (open) {
      setNcm('')
      setError(null)
    }
  }, [open])

  const total = productIds.length

  async function handleSubmit() {
    const validationError = validateNcmInput(ncm)

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createItemNew({
        route: '/fiscal/product/bulk-ncm',
        data: { productIds, ncm: ncm.replace(/\D/g, '') },
      })

      if (!result.success) {
        toast.error(result.message || 'Erro ao aplicar o NCM.')
        return
      }

      const { updated = 0, created = 0, ignored = 0 } = result.data || {}
      const changed = updated + created

      toast.success(
        `NCM aplicado a ${changed} produto${changed === 1 ? '' : 's'}.` +
          (ignored > 0 ? ` ${ignored} ignorado(s).` : ''),
      )

      await queryClient.invalidateQueries({ queryKey: ['product-list'] })
      await queryClient.invalidateQueries({ queryKey: ['product-fiscal-data'] })

      onApplied?.()
      onOpenChange(false)
    } catch {
      toast.error('Erro ao aplicar o NCM.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconReceiptTax} />
              <span>Alterar NCM em massa</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <p className="text-sm text-gray-600">
            O NCM informado será aplicado a{' '}
            <strong>
              {total} produto{total === 1 ? '' : 's'}
            </strong>{' '}
            selecionado{total === 1 ? '' : 's'}. Os demais dados fiscais de cada
            produto são preservados.
          </p>

          <div className="space-y-2">
            <Label htmlFor="bulk-ncm">NCM</Label>
            <Input
              id="bulk-ncm"
              value={ncm}
              maxLength={8}
              inputMode="numeric"
              placeholder="00000000"
              autoFocus
              onChange={(event) => {
                setNcm(event.target.value.replace(/\D/g, ''))
                setError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSubmit()
                }
              }}
            />
            {error ? (
              <p className="text-sm text-error-600">{error}</p>
            ) : (
              <p className="text-sm text-gray-500">
                8 dígitos, sem pontuação. Ex.: 49111010
              </p>
            )}
          </div>
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
            onClick={handleSubmit}
            RightIcon={IconCircleCheck}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
