'use client'

// O cartão da proposta do assistente (seção 9 do documento de 28/10/2026):
// a IA propõe, a pessoa confere, ajusta o que falta (cliente, produto,
// variação, medida) e confirma em "Aplicar", ou descarta. O servidor aplica
// pelos serviços das telas; a proposta vale por 24 horas.

// React
import { useEffect, useState } from 'react'
import { useRouter } from '@/hooks/useRouter'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Icon } from '@/components/ui/icon'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type {
  AiAction,
  AiActionStatus,
  NextContactPayload,
  QuotationDraftEdits,
  QuotationDraftPayload,
  ItemDescriptionPayload,
  FinancialCategoryPayload,
} from '@/types/ai-chat'

// Actions
import { getAiAction, applyAiAction, discardAiAction } from '@/actions/ai-chat'

// Hooks
import { useMoney } from '@/hooks/useMoney'

// Third-party
import { toast } from 'sonner'

// Icons
import {
  IconCheck,
  IconSparkles,
  IconExternalLink,
  IconAlertTriangle,
} from '@tabler/icons-react'

const statusObj: {
  [key in AiActionStatus]: {
    text: string
    variant: 'neutralLight' | 'successLight' | 'warningLight' | 'errorLight'
  }
} = {
  PROPOSED: { text: 'Proposta', variant: 'warningLight' },
  APPLYING: { text: 'Aplicando', variant: 'warningLight' },
  APPLIED: { text: 'Aplicada', variant: 'successLight' },
  DISCARDED: { text: 'Descartada', variant: 'neutralLight' },
  EXPIRED: { text: 'Vencida', variant: 'neutralLight' },
  FAILED: { text: 'Falhou', variant: 'errorLight' },
}

const typeTitle = {
  QUOTATION_DRAFT: 'Rascunho de orçamento',
  QUICK_SALE_DRAFT: 'Rascunho de venda rápida',
  ITEM_DESCRIPTION: 'Descritivo técnico',
  FINANCIAL_CATEGORY: 'Categoria do lançamento',
  NEXT_CONTACT: 'Próximo contato',
}

const number = (value: string) => {
  const parsed = Number(value.replace(',', '.'))
  return value.trim() !== '' && Number.isFinite(parsed) ? parsed : undefined
}

type ItemEdit = {
  removed?: boolean
  productId?: string
  variationId?: string
  quantity?: string
  width?: string
  height?: string
  measure?: string
}

interface Props {
  actionId: string
  // A linha da resposta do chat, enquanto a proposta carrega
  summary?: string
  // A proposta já carregada (o "Montar com IA" recebe inteira)
  initial?: AiAction
  onApplied?: (action: AiAction, result: Record<string, unknown>) => void
  onDiscarded?: (action: AiAction) => void
}

export function AiProposalCard({
  actionId,
  summary,
  initial,
  onApplied,
  onDiscarded,
}: Props) {
  const router = useRouter()
  const money = useMoney()
  const [action, setAction] = useState<AiAction | null>(initial || null)
  const [loading, setLoading] = useState(!initial)
  const [pending, setPending] = useState<'apply' | 'discard' | null>(null)
  // O que a pessoa mudou antes de aplicar
  const [clientId, setClientId] = useState<string>('')
  const [items, setItems] = useState<{ [index: number]: ItemEdit }>({})
  const [text, setText] = useState('')
  const [nextContactAt, setNextContactAt] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (initial) return
    let alive = true
    setLoading(true)
    getAiAction(actionId).then((res) => {
      if (!alive) return
      if (res.success && res.data) setAction(res.data)
      else toast.error(res.message)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [actionId, initial])

  useEffect(() => {
    if (!action) return
    if (
      action.type === 'QUOTATION_DRAFT' ||
      action.type === 'QUICK_SALE_DRAFT'
    ) {
      const payload = action.payload as QuotationDraftPayload
      setClientId(payload.client.id || '')
    } else if (action.type === 'ITEM_DESCRIPTION') {
      setText((action.payload as ItemDescriptionPayload).proposed)
    } else if (action.type === 'NEXT_CONTACT') {
      const payload = action.payload as NextContactPayload
      setNextContactAt(payload.nextContactAt.slice(0, 16))
      setNote(payload.note || '')
    }
  }, [action])

  if (loading || !action)
    return (
      <div className="space-y-2 rounded-lg border border-brand-200 bg-brand-25 p-3">
        <p className="flex items-center gap-2 text-sm font-medium text-brand-700">
          <Icon icon={IconSparkles} size="sm" />
          {summary || 'Proposta do assistente'}
        </p>
        <Skeleton className="h-10 w-full" />
      </div>
    )

  const open = action.status === 'PROPOSED'
  const status = statusObj[action.status]

  const editsOf = ():
    | QuotationDraftEdits
    | Record<string, unknown>
    | undefined => {
    switch (action.type) {
      case 'QUOTATION_DRAFT':
      case 'QUICK_SALE_DRAFT': {
        const payload = action.payload as QuotationDraftPayload
        const edits: QuotationDraftEdits = {}
        if (clientId && clientId !== payload.client.id)
          edits.clientId = clientId
        const changed = Object.entries(items).map(([index, edit]) => ({
          index: Number(index),
          ...(edit.removed ? { removed: true } : {}),
          ...(edit.productId ? { productId: edit.productId } : {}),
          ...(edit.variationId ? { variationId: edit.variationId } : {}),
          ...(edit.quantity !== undefined && number(edit.quantity) !== undefined
            ? { quantity: number(edit.quantity) }
            : {}),
          ...(edit.width !== undefined && number(edit.width) !== undefined
            ? { width: number(edit.width) }
            : {}),
          ...(edit.height !== undefined && number(edit.height) !== undefined
            ? { height: number(edit.height) }
            : {}),
          ...(edit.measure !== undefined && number(edit.measure) !== undefined
            ? { measure: number(edit.measure) }
            : {}),
        }))
        if (changed.length) edits.items = changed
        return Object.keys(edits).length ? edits : undefined
      }
      case 'ITEM_DESCRIPTION':
        return text !== (action.payload as ItemDescriptionPayload).proposed
          ? { text }
          : undefined
      case 'NEXT_CONTACT': {
        const payload = action.payload as NextContactPayload
        return {
          ...(nextContactAt &&
          nextContactAt !== payload.nextContactAt.slice(0, 16)
            ? { nextContactAt: new Date(nextContactAt).toISOString() }
            : {}),
          ...(note !== (payload.note || '') ? { note } : {}),
        }
      }
      default:
        return undefined
    }
  }

  const apply = async () => {
    setPending('apply')
    const res = await applyAiAction({ id: action.id, edited: editsOf() })
    const result = res.data || {}
    setPending(null)
    if (!res.success) {
      toast.error(res.message)
      // A recusa da regra devolve a proposta para corrigir
      const fresh = await getAiAction(action.id)
      if (fresh.success && fresh.data) setAction(fresh.data)
      return
    }
    const applied: AiAction = {
      ...action,
      status: 'APPLIED',
      result,
      appliedAt: new Date().toISOString(),
    }
    setAction(applied)
    toast.success('Proposta aplicada')
    onApplied?.(applied, result)
  }

  const discard = async () => {
    setPending('discard')
    const res = await discardAiAction(action.id)
    setPending(null)
    if (!res.success) return toast.error(res.message)
    const discarded: AiAction = { ...action, status: 'DISCARDED' }
    setAction(discarded)
    onDiscarded?.(discarded)
  }

  const setItem = (index: number, edit: ItemEdit) =>
    setItems((current) => ({
      ...current,
      [index]: { ...current[index], ...edit },
    }))

  const resultQuotationId =
    action.status === 'APPLIED' &&
    typeof action.result?.quotationId === 'string'
      ? (action.result.quotationId as string)
      : null

  const draft = (payload: QuotationDraftPayload) => (
    <div className="space-y-3">
      {/* O cliente: achado, a escolher entre parecidos, ou não achado */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {payload.client.match === 'NEEDS_CHOICE' && open ? (
          <SelectBasic
            name={`ai-client-${action.id}`}
            label="Cliente (escolha entre os parecidos)"
            options={(payload.client.candidates || []).map((item) => ({
              value: item.id,
              label: item.name,
            }))}
            value={clientId}
            onChange={(value) => value && setClientId(String(value))}
          />
        ) : (
          <div>
            <p className="text-xs text-gray">Cliente</p>
            <p className="text-sm font-medium text-gray-800">
              {payload.client.name || 'Não identificado no pedido'}
              {payload.client.match === 'NONE' && (
                <span className="font-normal text-gray">
                  {' '}
                  · o orçamento abre sem cliente
                </span>
              )}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray">Destino</p>
          <p className="text-sm font-medium text-gray-800">
            {payload.target === 'CURRENT'
              ? 'Os itens entram no orçamento aberto'
              : payload.quickSale
                ? 'Nova venda rápida'
                : 'Novo orçamento'}
            {payload.deliveryDate &&
              ` · entrega ${payload.deliveryDate.split('-').reverse().join('/')}`}
          </p>
        </div>
      </div>

      {/* Os itens: o que a IA entendeu e o que falta */}
      <div className="space-y-2">
        {payload.items.map((item, index) => {
          const edit = items[index] || {}
          const removed = !!edit.removed
          const productId = edit.productId || item.productId
          const variationId = edit.variationId || item.variationId
          const unit = (item.unit || '').toLowerCase()
          const area = unit === 'm2' || item.width !== undefined
          const linear = !area && unit !== 'un' && unit !== ''
          return (
            <div
              key={index}
              className={`space-y-2 rounded-lg border bg-white p-3 ${
                removed ? 'border-gray-200 opacity-60' : 'border-gray-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {item.productName || item.description || item.text}
                  </p>
                  <p className="text-xs text-gray">“{item.text}”</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'NEEDS_CHOICE' && (
                    <Badge variant="warningLight" size="sm">
                      Escolher produto
                    </Badge>
                  )}
                  {item.status === 'NEEDS_MEASURE' && (
                    <Badge variant="warningLight" size="sm">
                      Falta a medida
                    </Badge>
                  )}
                  {item.status === 'BASE_PRODUCT' && (
                    <Badge variant="neutralLight" size="sm">
                      Produto base
                    </Badge>
                  )}
                  {open && (
                    <Button
                      type="button"
                      size="sm"
                      variant="neutralGhost"
                      onClick={() => setItem(index, { removed: !removed })}
                    >
                      {removed ? 'Manter' : 'Remover'}
                    </Button>
                  )}
                </div>
              </div>
              {open && !removed && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {item.candidates && item.candidates.length > 0 && (
                    <div className="col-span-2">
                      <SelectBasic
                        name={`ai-product-${action.id}-${index}`}
                        label="Produto"
                        options={item.candidates.map((candidate) => ({
                          value: candidate.id,
                          label: candidate.code
                            ? `${candidate.name} (${candidate.code})`
                            : candidate.name,
                        }))}
                        value={productId || ''}
                        onChange={(value) =>
                          value && setItem(index, { productId: String(value) })
                        }
                      />
                    </div>
                  )}
                  {item.variations && item.variations.length > 0 && (
                    <div className="col-span-2">
                      <SelectBasic
                        name={`ai-variation-${action.id}-${index}`}
                        label="Variação"
                        options={item.variations.map((variation) => ({
                          value: variation.id,
                          label: variation.name,
                        }))}
                        value={variationId || ''}
                        onChange={(value) =>
                          value &&
                          setItem(index, { variationId: String(value) })
                        }
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <Label htmlFor={`ai-qty-${action.id}-${index}`}>
                      Quantidade
                    </Label>
                    <Input
                      id={`ai-qty-${action.id}-${index}`}
                      type="number"
                      min={0}
                      value={edit.quantity ?? String(item.quantity)}
                      onChange={(event) =>
                        setItem(index, { quantity: event.target.value })
                      }
                    />
                  </div>
                  {area && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor={`ai-w-${action.id}-${index}`}>
                          Largura (m)
                        </Label>
                        <Input
                          id={`ai-w-${action.id}-${index}`}
                          type="number"
                          min={0}
                          step="0.01"
                          value={edit.width ?? item.width ?? ''}
                          onChange={(event) =>
                            setItem(index, { width: event.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`ai-h-${action.id}-${index}`}>
                          Altura (m)
                        </Label>
                        <Input
                          id={`ai-h-${action.id}-${index}`}
                          type="number"
                          min={0}
                          step="0.01"
                          value={edit.height ?? item.height ?? ''}
                          onChange={(event) =>
                            setItem(index, { height: event.target.value })
                          }
                        />
                      </div>
                    </>
                  )}
                  {linear && (
                    <div className="space-y-1">
                      <Label htmlFor={`ai-m-${action.id}-${index}`}>
                        Medida ({item.unit})
                      </Label>
                      <Input
                        id={`ai-m-${action.id}-${index}`}
                        type="number"
                        min={0}
                        step="0.01"
                        value={edit.measure ?? item.measure ?? ''}
                        onChange={(event) =>
                          setItem(index, { measure: event.target.value })
                        }
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray">
                {!open && (
                  <span>
                    {item.quantity} {item.unit || 'un'}
                    {item.width && item.height
                      ? ` · ${item.width} × ${item.height} m`
                      : ''}
                  </span>
                )}
                {item.variationName && <span>{item.variationName}</span>}
                {item.unitPrice !== undefined && (
                  <span>
                    {money(item.unitPrice)} a unidade
                    {item.total !== undefined && ` · ${money(item.total)}`}
                  </span>
                )}
                {item.missing && (
                  <span className="text-warning-700">{item.missing}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {payload.total !== undefined && (
        <p className="text-right text-sm font-medium text-gray-800">
          Total previsto: {money(payload.total)}
        </p>
      )}
      {payload.notes && (
        <p className="text-sm text-gray-700">Observação: {payload.notes}</p>
      )}
    </div>
  )

  const description = (payload: ItemDescriptionPayload) => (
    <div className="space-y-2">
      <p className="text-sm text-gray-800">
        {payload.target === 'PRODUCT' ? 'Produto' : 'Item do orçamento'}:{' '}
        <span className="font-medium">{payload.name}</span>
      </p>
      {payload.current && (
        <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
          Hoje: {payload.current}
        </p>
      )}
      {open ? (
        <Textarea
          value={text}
          rows={4}
          onChange={(event) => setText(event.target.value)}
        />
      ) : (
        <p className="whitespace-pre-wrap text-sm text-gray-800">
          {payload.proposed}
        </p>
      )}
    </div>
  )

  const category = (payload: FinancialCategoryPayload) => (
    <div className="space-y-2 text-sm">
      <p className="text-gray-800">
        Lançamento: <span className="font-medium">{payload.description}</span>
      </p>
      {payload.suggestion ? (
        <p className="text-gray-800">
          {payload.suggestion.natureName}
          {payload.suggestion.subCategoryName &&
            ` › ${payload.suggestion.subCategoryName}`}
          {payload.suggestion.supplierName &&
            ` · fornecedor ${payload.suggestion.supplierName}`}
          <Badge
            variant={
              payload.confidence === 'HIGH' ? 'successLight' : 'warningLight'
            }
            size="sm"
            className="ml-2"
          >
            {payload.confidence === 'HIGH'
              ? 'Confiança alta'
              : 'Confiança baixa'}
          </Badge>
        </p>
      ) : (
        <p className="text-gray">Sem sugestão para este lançamento.</p>
      )}
      {payload.basis.similar > 0 && (
        <p className="text-xs text-gray">
          Com base em {payload.basis.similar} lançamento(s) parecido(s)
          {payload.basis.examples.length
            ? `: ${payload.basis.examples.slice(0, 3).join('; ')}`
            : ''}
        </p>
      )}
    </div>
  )

  const contact = (payload: NextContactPayload) => (
    <div className="space-y-2">
      <p className="text-sm text-gray-800">
        {payload.clientName || 'Cliente'}
        {payload.quotationNumber && ` · orçamento ${payload.quotationNumber}`}
        {payload.current.nextContactAt &&
          ` · hoje marcado para ${new Date(payload.current.nextContactAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`}
      </p>
      {open ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor={`ai-next-${action.id}`}>Próximo contato</Label>
            <Input
              id={`ai-next-${action.id}`}
              type="datetime-local"
              value={nextContactAt}
              onChange={(event) => setNextContactAt(event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`ai-note-${action.id}`}>Anotação</Label>
            <Input
              id={`ai-note-${action.id}`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-800">
          {new Date(payload.nextContactAt).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {payload.note && ` · ${payload.note}`}
        </p>
      )}
    </div>
  )

  const warnings =
    (action.payload as QuotationDraftPayload | FinancialCategoryPayload)
      .warnings || []

  return (
    <div className="space-y-3 rounded-lg border border-brand-200 bg-brand-25 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-brand-700">
          <Icon icon={IconSparkles} size="sm" />
          {typeTitle[action.type]}
        </p>
        <Badge variant={status.variant} size="sm">
          {status.text}
        </Badge>
      </div>

      {action.type === 'QUOTATION_DRAFT' || action.type === 'QUICK_SALE_DRAFT'
        ? draft(action.payload as QuotationDraftPayload)
        : action.type === 'ITEM_DESCRIPTION'
          ? description(action.payload as ItemDescriptionPayload)
          : action.type === 'FINANCIAL_CATEGORY'
            ? category(action.payload as FinancialCategoryPayload)
            : contact(action.payload as NextContactPayload)}

      {warnings.length > 0 && (
        <ul className="space-y-0.5">
          {warnings.map((warning) => (
            <li
              key={warning}
              className="flex items-start gap-1.5 text-xs text-warning-700"
            >
              <Icon
                icon={IconAlertTriangle}
                size="sm"
                className="mt-0.5 shrink-0"
              />
              {warning}
            </li>
          ))}
        </ul>
      )}
      {action.status === 'FAILED' &&
        typeof action.result?.error === 'string' && (
          <p className="text-xs text-error-700">
            {action.result.error as string}
          </p>
        )}

      {open ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            LeftIcon={IconCheck}
            isLoading={pending === 'apply'}
            disabled={pending === 'discard'}
            onClick={apply}
          >
            Aplicar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="neutralOutline"
            isLoading={pending === 'discard'}
            disabled={pending === 'apply'}
            onClick={discard}
          >
            Descartar
          </Button>
          <span className="text-xs text-gray">
            Nada é gravado até você aplicar. Vale por 24 horas.
          </span>
        </div>
      ) : (
        resultQuotationId && (
          <Button
            type="button"
            size="sm"
            variant="neutralOutline"
            LeftIcon={IconExternalLink}
            onClick={() =>
              router.push(`/vendas/orcamentos/${resultQuotationId}`)
            }
          >
            Abrir o orçamento
          </Button>
        )
      )}
    </div>
  )
}
