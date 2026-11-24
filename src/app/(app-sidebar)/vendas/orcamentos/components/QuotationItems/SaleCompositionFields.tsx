'use client'

// Os campos que o vendedor preenche num produto com composição (IP-36):
// tempo, campos extras, escolhas, opcionais e listas. O resto da composição
// fica por dentro, e abre como relatório de consulta. Serve ao formulário da
// tela de itens e ao modal do produto no orçamento — é o mesmo formulário
// para criar e editar (ORC-4). Desde 05/10/2026: o campo inteiro recusa
// decimal (IP-19) e as instruções ao vendedor dos processos aparecem como
// texto de apoio, só leitura (CP-13).

// React
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { ItemComposition } from '../../[quotationId]/composicao/types'
import type { SaleSheetUsage } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Actions
// A composição do produto vem da API (contrato, módulo 1, parte A)
import { getSaleForm, getSaleSheetUsage } from '@/actions/assembly'
import {
  DurationInput,
  formatDuration,
} from '@/components/common/DurationInput'

// Third-party
import { useQuery } from '@tanstack/react-query'

interface Props {
  productId?: string
  // A variação com composição própria troca as escolhas (PV-6)
  variationId?: string | null
  initial?: ItemComposition
  // Quantidade e medida do item na venda (em metros): é o que o aproveitamento
  // de folha lê para dizer quantas folhas a venda usa (AP-5)
  measure?: { quantity: number; width: number; height: number }
  // Sem composição no produto, devolve undefined: o formulário segue igual
  onChange: (composition: ItemComposition | undefined) => void
}

// "24 por folha · 42 folhas · sobram 8": o texto do aproveitamento, igual na
// tela e no resumo da linha do item
export const sheetUsageText = (usage: SaleSheetUsage) => {
  const y = usage.sheetYield
  const word = usage.unit === 'chapa' ? 'chapa' : 'folha'
  const plural = usage.unit === 'chapa' ? 'chapas' : 'folhas'
  const charged =
    y.charged !== y.sheets
      ? ` · cobra ${num(y.charged)} ${y.charged > 1 ? plural : word}`
      : ''

  return `${y.perSheet} por ${word} · ${y.sheets} ${y.sheets === 1 ? word : plural}${y.leftover ? ` · sobram ${y.leftover}` : ''}${charged}`
}

const NO_USAGE: SaleSheetUsage[] = []

// O campo que nenhuma etapa usa vai à tela desabilitado e fora das escolhas
// (20/11/2026); a API antiga não manda `used`, e aí vale como usado
const isUsed = (extra: { used?: boolean }) => extra.used !== false

const num = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

export function SaleCompositionFields({
  productId,
  variationId = null,
  initial,
  measure,
  onChange,
}: Props) {
  const { data: saleFormRes } = useQuery({
    enabled: !!productId,
    staleTime: 60_000,
    queryKey: ['sale-form', productId, variationId],
    queryFn: () => getSaleForm({ productId: productId!, variationId }),
  })
  const saleForm = saleFormRes?.data || null

  const [extras, setExtras] = useState(initial?.extras || [])
  const [times, setTimes] = useState(initial?.times || [])
  const [choices, setChoices] = useState(initial?.choices || [])
  const [lists, setLists] = useState(initial?.lists || [])
  const [optionals, setOptionals] = useState(initial?.optionals || [])
  const [notes, setNotes] = useState(initial?.notes || [])
  const [showNotes, setShowNotes] = useState(!!initial?.notes?.length)
  // O campo inteiro que recebeu decimal (IP-19): o aviso fica no campo
  const [fieldErrors, setFieldErrors] = useState<{ [fieldId: string]: string }>(
    {},
  )

  useEffect(() => {
    if (!saleForm || initial) return
    setTimes(
      saleForm.times.map((time) => ({
        blockId: time.blockId,
        minutes: time.defaultMinutes,
      })),
    )
    setExtras(
      saleForm.extras.filter(isUsed).map((extra) => ({
        fieldId: extra.fieldId,
        value: extra.defaultValue,
      })),
    )
    setChoices(
      saleForm.choices.map((choice) => ({
        blockId: choice.blockId,
        lineId: choice.lineId,
        optionId: choice.defaultId,
      })),
    )
    setOptionals(
      saleForm.optionals.map((optional) => ({
        blockId: optional.blockId,
        lineId: optional.lineId,
        included: optional.defaultIncluded,
      })),
    )
  }, [saleForm, initial])

  // O aproveitamento de folha desta venda (AP-5): muda com a quantidade, a
  // medida e a folha escolhida
  const { data: usageRes } = useQuery({
    enabled: !!productId && !!saleForm,
    queryKey: [
      'sale-sheet-usage',
      productId,
      variationId,
      measure?.quantity ?? 0,
      measure?.width ?? 0,
      measure?.height ?? 0,
      choices.map((choice) => choice.optionId).join(','),
    ],
    queryFn: () =>
      getSaleSheetUsage({
        productId: productId!,
        variationId,
        measure: measure || { quantity: 1, width: 0, height: 0 },
        choices,
      }),
  })
  // Referência estável: uma lista nova a cada render dispararia o onChange
  // em loop
  const usage = usageRes?.data ?? NO_USAGE

  const included = (lineId: string) =>
    !!optionals.find((optional) => optional.lineId === lineId)?.included

  const extraValue = (fieldId: string) =>
    extras.find((extra) => extra.fieldId === fieldId)?.value ?? 0
  const choiceValue = (lineId: string) =>
    choices.find((choice) => choice.lineId === lineId)?.optionId || ''
  const listValue = (lineId: string, optionId: string) =>
    lists.find(
      (entry) => entry.lineId === lineId && entry.optionId === optionId,
    )?.quantity || 0

  const setListValue = (
    blockId: string,
    lineId: string,
    optionId: string,
    quantity: number,
  ) =>
    setLists((current) => [
      ...current.filter(
        (entry) => !(entry.lineId === lineId && entry.optionId === optionId),
      ),
      ...(quantity > 0 ? [{ blockId, lineId, optionId, quantity }] : []),
    ])

  // O resumo que aparece na linha do item
  const summary = () =>
    saleForm
      ? [
          ...saleForm.times.map(
            (time) =>
              `${time.name}: ${formatDuration(
                times.find((item) => item.blockId === time.blockId)?.minutes ??
                  time.defaultMinutes,
              )}`,
          ),
          ...saleForm.extras
            .filter(isUsed)
            .map((extra) => `${extra.name}: ${extraValue(extra.fieldId)}`),
          ...saleForm.choices.map(
            (choice) =>
              `${choice.name}: ${
                choice.options.find(
                  (item) => item.id === choiceValue(choice.lineId),
                )?.name || '-'
              }`,
          ),
          ...saleForm.optionals.map(
            (optional) =>
              `${included(optional.lineId) ? 'Com' : 'Sem'} ${optional.name.toLowerCase()}`,
          ),
          ...saleForm.lists.flatMap((list) =>
            list.options
              .filter((item) => listValue(list.lineId, item.id) > 0)
              .map(
                (item) =>
                  `${item.name}: ${listValue(list.lineId, item.id)} ${item.unit}`,
              ),
          ),
          // As folhas que a venda usa ficam na linha do item (AP-5)
          ...usage.map((item) => `${item.resource}: ${sheetUsageText(item)}`),
        ]
      : []

  // Avisa o formulário a cada mudança, já com o resumo da linha
  useEffect(() => {
    onChange(
      saleForm
        ? {
            extras,
            times,
            choices,
            optionals,
            lists,
            notes: notes.filter((item) => item.text.trim()),
            summary: summary(),
          }
        : undefined,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleForm, extras, times, choices, optionals, lists, notes, usage])

  if (!saleForm) return null

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-700">Escolhas do produto</p>
      {saleForm &&
        saleForm.extras.length +
          saleForm.choices.length +
          saleForm.times.length >
          0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {saleForm.times.map((time) => (
              <div key={time.blockId} className="space-y-1.5">
                <label
                  htmlFor={`time-${time.blockId}`}
                  className="text-sm font-medium"
                >
                  {time.name} (hh:mm)
                </label>
                <DurationInput
                  id={`time-${time.blockId}`}
                  value={
                    times.find((item) => item.blockId === time.blockId)
                      ?.minutes ?? time.defaultMinutes
                  }
                  onChange={(minutes) =>
                    setTimes((current) => [
                      ...current.filter(
                        (item) => item.blockId !== time.blockId,
                      ),
                      { blockId: time.blockId, minutes: minutes ?? 0 },
                    ])
                  }
                />
              </div>
            ))}
            {saleForm.extras.map((extra) => (
              <div
                key={extra.fieldId}
                className="space-y-1.5"
                title={
                  isUsed(extra) ? undefined : 'Nenhuma etapa usa este campo'
                }
              >
                <label
                  htmlFor={`extra-${extra.fieldId}`}
                  className={
                    isUsed(extra)
                      ? 'text-sm font-medium'
                      : 'text-sm font-medium text-gray-400'
                  }
                >
                  {extra.name}
                </label>
                <Input
                  id={`extra-${extra.fieldId}`}
                  disabled={!isUsed(extra)}
                  type="number"
                  min={0}
                  step={extra.kind === 'INTEGER' ? '1' : '0.01'}
                  inputMode={extra.kind === 'INTEGER' ? 'numeric' : 'decimal'}
                  value={String(
                    isUsed(extra)
                      ? extraValue(extra.fieldId)
                      : extra.defaultValue,
                  )}
                  onChange={(event) => {
                    const value = Number(event.target.value || 0)
                    // Campo inteiro recusa decimal (IP-19): o valor não entra
                    if (extra.kind === 'INTEGER' && !Number.isInteger(value)) {
                      setFieldErrors((current) => ({
                        ...current,
                        [extra.fieldId]: 'Só número inteiro',
                      }))
                      return
                    }
                    setFieldErrors((current) => {
                      const next = { ...current }
                      delete next[extra.fieldId]
                      return next
                    })
                    setExtras((current) => [
                      ...current.filter(
                        (item) => item.fieldId !== extra.fieldId,
                      ),
                      { fieldId: extra.fieldId, value },
                    ])
                  }}
                />
                {fieldErrors[extra.fieldId] && (
                  <p className="text-xs text-error-700">
                    {fieldErrors[extra.fieldId]}
                  </p>
                )}
              </div>
            ))}
            {saleForm.choices.map((choice) => (
              <SelectBasic
                key={choice.lineId}
                name={`choice-${choice.lineId}`}
                label={choice.name}
                options={choice.options.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                value={choiceValue(choice.lineId)}
                onChange={(value) =>
                  // Dentro de um <form>, o select recebe vazio quando o
                  // formulário é reiniciado; a escolha sempre tem uma opção
                  value &&
                  setChoices((current) => [
                    ...current.filter((item) => item.lineId !== choice.lineId),
                    {
                      blockId: choice.blockId,
                      lineId: choice.lineId,
                      optionId: String(value),
                    },
                  ])
                }
              />
            ))}
          </div>
        )}

      {!!saleForm?.optionals.length && (
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {saleForm.optionals.map((optional) => (
            <label
              key={optional.lineId}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                className="size-4 accent-brand-600"
                checked={included(optional.lineId)}
                onChange={(event) =>
                  setOptionals((current) => [
                    ...current.filter(
                      (item) => item.lineId !== optional.lineId,
                    ),
                    {
                      blockId: optional.blockId,
                      lineId: optional.lineId,
                      included: event.target.checked,
                    },
                  ])
                }
              />
              <span className="font-medium text-gray-800">{optional.name}</span>
              <span className="text-gray">· {optional.stage}</span>
            </label>
          ))}
        </div>
      )}

      {/* Instruções ao vendedor dos processos deste produto (CP-13): o que
          perguntar ao cliente e o que conferir antes de fechar. Só leitura */}
      {!!saleForm.instructions?.length && (
        <div className="space-y-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="type-eyebrow">Instruções para o vendedor</p>
          {saleForm.instructions.map((instruction) => (
            <p key={instruction.blockId} className="text-sm text-gray-700">
              <span className="font-medium">{instruction.stage}:</span>{' '}
              {instruction.text}
            </p>
          ))}
        </div>
      )}

      {saleForm?.lists.map((list) => (
        <div key={list.lineId} className="space-y-2">
          <p className="text-sm font-medium">
            {list.name}
            <span className="font-normal text-gray">
              {' '}
              · {list.stage} · informe o que este trabalho usa
            </span>
          </p>
          {/* Um material abaixo do outro, como uma lista (24/11/2026): o
              nome à esquerda e a quantidade com a unidade à direita */}
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {list.options.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 px-3 py-1.5"
              >
                <label
                  htmlFor={`list-${list.lineId}-${item.id}`}
                  className="min-w-0 flex-1 truncate text-sm text-gray-700"
                >
                  {item.name}
                </label>
                <Input
                  className="w-[160px] shrink-0"
                  id={`list-${list.lineId}-${item.id}`}
                  type="number"
                  min={0}
                  step="0.01"
                  value={String(listValue(list.lineId, item.id))}
                  endAdornment={<span className="text-sm">{item.unit}</span>}
                  onChange={(event) =>
                    setListValue(
                      list.blockId,
                      list.lineId,
                      item.id,
                      Number(event.target.value || 0),
                    )
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      {/* Aproveitamento de folha (AP-5): quantas peças cabem na folha ou na
          chapa e quantas a venda usa, pela quantidade e medida informadas */}
      {usage.length ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <p className="font-medium text-gray-700">Aproveitamento</p>
          {usage.map((item) => (
            <p key={`${item.blockId}-${item.lineName}`} className="text-gray">
              <span className="text-gray-800">{item.resource}</span>:{' '}
              {sheetUsageText(item)}
              <span
                className="text-gray-400"
                title="Peças por folha em cada posição"
              >
                {' '}
                ({item.sheetYield.firstFit} × {item.sheetYield.secondFit})
              </span>
            </p>
          ))}
        </div>
      ) : null}

      {/* Observação de produção por etapa (MS-13): vai para quem produz,
          não para o cliente */}
      <div className="space-y-2">
        <button
          type="button"
          className="text-sm font-medium text-brand-700 hover:underline"
          onClick={() => setShowNotes((current) => !current)}
        >
          {showNotes
            ? 'Ocultar observações para a produção'
            : 'Observações para a produção'}
        </button>
        {showNotes && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {saleForm.stages.map((stage) => (
              <div key={stage.blockId} className="space-y-1.5">
                <label
                  htmlFor={`note-${stage.blockId}`}
                  className="text-sm text-gray-700"
                >
                  {stage.name}
                  <span className="text-gray"> · {stage.sector}</span>
                </label>
                <Input
                  id={`note-${stage.blockId}`}
                  placeholder="Ex.: cliente leva a arte em PDF"
                  value={
                    notes.find((item) => item.blockId === stage.blockId)
                      ?.text || ''
                  }
                  onChange={(event) =>
                    setNotes((current) => [
                      ...current.filter(
                        (item) => item.blockId !== stage.blockId,
                      ),
                      { blockId: stage.blockId, text: event.target.value },
                    ])
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
