'use client'

/**
 * BulkNcmDialog
 *
 * Aplica um mesmo NCM a vários produtos: aos selecionados na listagem ou a
 * todos os que atendem ao filtro atual.
 *
 * Corrigir NCM produto a produto não escala numa base recém-migrada, onde
 * dezenas de produtos ficam com o NCM padrão herdado. O backend
 * (POST /fiscal/product/bulk-ncm) altera SOMENTE o ncm de quem já tem cadastro
 * fiscal e cria o cadastro com os defaults da empresa para quem não tem.
 */

// React
import { useEffect, useRef, useState } from 'react'

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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Icons
import { IconCircleCheck } from '@tabler/icons-react'

// Actions
import { createItemNew, getItem } from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

/** Filtros da listagem repetidos no corpo; mesmos nomes do backend. */
export interface BulkNcmFilters {
  search?: string
  categoryId?: string
  sectorId?: string
  unitKind?: string
  categoryKind?: string
  status?: string
  isService?: boolean
}

/**
 * Alvo da alteração: os produtos marcados, ou todos os que correspondem ao
 * filtro da listagem — inclusive os de outras páginas.
 */
export type BulkNcmScope =
  | { kind: 'selected'; productIds: string[] }
  | { kind: 'all'; filters: BulkNcmFilters; total: number }

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  scope: BulkNcmScope
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

export function BulkNcmDialog({ open, onOpenChange, scope, onApplied }: Props) {
  const queryClient = useQueryClient()
  const [ncm, setNcm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [somenteHerdados, setSomenteHerdados] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const campoTocado = useRef(false)

  // NCM padrão do emissor, para o campo já abrir preenchido em vez de exigir
  // que o usuário vá procurá-lo nas configurações.
  const { data: emissor } = useQuery({
    queryKey: ['emissor-default'],
    queryFn: () => getItem({ route: '/fiscal/emissores/default' }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })
  const ncmPadrao = String(emissor?.data?.defaultNcm ?? '').replace(/\D/g, '')
  const nomeEmissor = emissor?.data?.name as string | undefined
  const padraoValido = ncmPadrao && !validateNcmInput(ncmPadrao)

  // Cada abertura recomeça limpa: o NCM digitado antes não deve reaparecer
  // numa seleção diferente e ser aplicado sem querer.
  useEffect(() => {
    if (!open) return
    campoTocado.current = false
    setError(null)
    setSomenteHerdados(true)
  }, [open])

  // Preenche com o padrão do emissor quando a consulta responde, inclusive se
  // ela terminar depois da abertura — mas nunca por cima do que o usuário já
  // digitou nesse meio-tempo.
  useEffect(() => {
    if (open && !campoTocado.current) setNcm(padraoValido ? ncmPadrao : '')
  }, [open, ncmPadrao, padraoValido])

  const total =
    scope.kind === 'selected' ? scope.productIds.length : scope.total
  const escopoTodos = scope.kind === 'all'

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
        data: {
          ncm: ncm.replace(/\D/g, ''),
          // No escopo por seleção o corpo é o de sempre: assim o front
          // funciona mesmo contra um backend que ainda não conhece `scope`.
          ...(escopoTodos
            ? {
                scope: 'ALL',
                filters: scope.filters,
                onlyInheritedNcm: somenteHerdados,
              }
            : { productIds: scope.productIds }),
        },
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
            {escopoTodos
              ? 'da lista atual, incluindo as outras páginas'
              : `selecionado${total === 1 ? '' : 's'}`}
            . Os demais dados fiscais de cada produto são preservados.
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
                campoTocado.current = true
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
            ) : padraoValido ? (
              <p className="text-sm text-gray-500">
                NCM padrão do emissor{nomeEmissor ? ` ${nomeEmissor}` : ''}:{' '}
                <strong>{ncmPadrao}</strong>
                {ncm !== ncmPadrao && (
                  <button
                    type="button"
                    className="ml-2 text-brand-600 underline"
                    onClick={() => {
                      campoTocado.current = true
                      setNcm(ncmPadrao)
                      setError(null)
                    }}
                  >
                    Usar padrão
                  </button>
                )}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                8 dígitos, sem pontuação. Ex.: 49111010
              </p>
            )}
          </div>

          {escopoTodos && (
            <label className="flex items-start gap-2 rounded-md border border-gray-200 p-3 cursor-pointer">
              <Checkbox
                checked={somenteHerdados}
                onCheckedChange={(checked) =>
                  setSomenteHerdados(checked === true)
                }
              />
              <span className="text-sm text-gray-700">
                Aplicar somente a produtos sem NCM próprio
                <span className="block text-xs text-gray-500">
                  Preserva o NCM de quem já foi ajustado à mão; atinge quem está
                  sem NCM ou ainda com o padrão herdado do emissor.
                </span>
              </span>
            </label>
          )}
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
