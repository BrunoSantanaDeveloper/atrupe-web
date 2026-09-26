'use client'

// Os campos que o vendedor preenche num produto com composição (IP-36):
// tempo, campos extras, escolhas, opcionais e listas. O resto da composição
// fica por dentro, e abre como relatório de consulta. Serve ao formulário da
// tela de itens e ao modal do produto no orçamento — é o mesmo formulário
// para criar e editar (ORC-4).

// React
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { ItemComposition } from '../../[quotationId]/composicao/types'

// Actions
import { getSaleForm } from '@/actions/product-assembly'
import {
  hhmmToMinutes,
  minutesToHhmm,
} from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Third-party
import { useQuery } from '@tanstack/react-query'

interface Props {
  productId?: string
  initial?: ItemComposition
  // Sem composição no produto, devolve undefined: o formulário segue igual
  onChange: (composition: ItemComposition | undefined) => void
}

export function SaleCompositionFields({ productId, initial, onChange }: Props) {
  const { data: saleFormRes } = useQuery({
    enabled: !!productId,
    staleTime: Infinity,
    queryKey: ['sale-form', productId],
    queryFn: () => getSaleForm({ productId: productId! }),
  })
  const saleForm = saleFormRes?.data || null

  const [extras, setExtras] = useState(initial?.extras || [])
  const [times, setTimes] = useState(initial?.times || [])
  const [choices, setChoices] = useState(initial?.choices || [])
  const [lists, setLists] = useState(initial?.lists || [])
  const [optionals, setOptionals] = useState(initial?.optionals || [])
  const [notes, setNotes] = useState(initial?.notes || [])
  const [showNotes, setShowNotes] = useState(!!initial?.notes?.length)

  useEffect(() => {
    if (!saleForm || initial) return
    setTimes(
      saleForm.times.map((time) => ({
        blockId: time.blockId,
        minutes: time.defaultMinutes,
      })),
    )
    setExtras(
      saleForm.extras.map((extra) => ({
        blockId: extra.blockId,
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

  const included = (lineId: string) =>
    !!optionals.find((optional) => optional.lineId === lineId)?.included

  const extraValue = (blockId: string) =>
    extras.find((extra) => extra.blockId === blockId)?.value ?? 0
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
              `${time.name}: ${minutesToHhmm(
                times.find((item) => item.blockId === time.blockId)?.minutes ??
                  time.defaultMinutes,
              )}`,
          ),
          ...saleForm.extras.map(
            (extra) => `${extra.name}: ${extraValue(extra.blockId)}`,
          ),
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
  }, [saleForm, extras, times, choices, optionals, lists, notes])

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
                  {time.name} (h:mm)
                </label>
                <Input
                  id={`time-${time.blockId}`}
                  placeholder="1:00"
                  defaultValue={minutesToHhmm(
                    times.find((item) => item.blockId === time.blockId)
                      ?.minutes ?? time.defaultMinutes,
                  )}
                  onBlur={(event) =>
                    setTimes((current) => [
                      ...current.filter(
                        (item) => item.blockId !== time.blockId,
                      ),
                      {
                        blockId: time.blockId,
                        minutes: hhmmToMinutes(event.target.value),
                      },
                    ])
                  }
                />
              </div>
            ))}
            {saleForm.extras.map((extra) => (
              <div key={extra.blockId} className="space-y-1.5">
                <label
                  htmlFor={`extra-${extra.blockId}`}
                  className="text-sm font-medium"
                >
                  {extra.name}
                </label>
                <Input
                  id={`extra-${extra.blockId}`}
                  type="number"
                  min={0}
                  step={extra.kind === 'INTEGER' ? '1' : '0.01'}
                  value={String(extraValue(extra.blockId))}
                  onChange={(event) =>
                    setExtras((current) => [
                      ...current.filter(
                        (item) => item.blockId !== extra.blockId,
                      ),
                      {
                        blockId: extra.blockId,
                        value: Number(event.target.value || 0),
                      },
                    ])
                  }
                />
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

      {saleForm?.lists.map((list) => (
        <div key={list.lineId} className="space-y-2">
          <p className="text-sm font-medium">
            {list.name}
            <span className="font-normal text-gray">
              {' '}
              · {list.stage} · informe o que este trabalho usa
            </span>
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {list.options.map((item) => (
              <div key={item.id} className="space-y-1.5">
                <label
                  htmlFor={`list-${list.lineId}-${item.id}`}
                  className="text-sm text-gray-700"
                >
                  {item.name}
                </label>
                <Input
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
