'use client'

// React
import { useEffect, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { AddOption, ItemComposition, QuotationItem } from '../types'

// Actions
import { getSaleForm } from '@/actions/product-assembly'

// Hooks / Store / Consts
import { cn } from '@/lib/utils'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconX } from '@tabler/icons-react'

export type ItemFormValues = {
  quantity: number
  width: number
  height: number
  discount: number
  fields: { name: string; value: number }[]
  variation: string | null
  // Produto com composição: só o que o vendedor pode mudar (IP-36)
  composition?: ItemComposition
}

interface Props {
  // Acrescentando: vem o produto escolhido. Editando: vem o item da lista.
  // É o mesmo formulário nos dois casos (ORC-4), porque editar tem que ser
  // igual a criar
  option?: AddOption
  item?: QuotationItem
  // Ao editar não existe `option`, então as variações do produto vêm à parte
  variations?: { id: string; name: string; price: number | null }[]
  onCancel: () => void
  onConfirm: (values: ItemFormValues) => void
}

export function ItemForm({
  option,
  item,
  variations: variationsProp,
  onCancel,
  onConfirm,
}: Props) {
  const isEdit = Boolean(item)
  const name = item?.name || option?.name || ''
  const measured = item ? Boolean(item.width || item.height) : option?.measured

  const variations = option?.variations || variationsProp || []
  const [variation, setVariation] = useState(
    item?.variation || variations[0]?.name || '',
  )
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1))
  const [width, setWidth] = useState(String(item?.width ?? 1))
  const [height, setHeight] = useState(String(item?.height ?? 1))
  const [discount, setDiscount] = useState(
    item?.discount ? String(item.discount / 100) : '',
  )
  const [fields, setFields] = useState<{ name: string; value: number }[]>(
    item?.fields ||
      (option?.fields || []).map((field) => ({
        name: field.name,
        value: field.defaultValue,
      })),
  )

  // Produto com composição: o formulário mostra só o que é editável nela —
  // campos extras, escolhas e listas. O resto fica por dentro (IP-36)
  const productId = option?.hasComposition ? option.id : item?.productId
  const { data: saleFormRes } = useQuery({
    enabled: !!productId,
    staleTime: Infinity,
    queryKey: ['sale-form', productId],
    queryFn: () => getSaleForm({ productId: productId! }),
  })
  const saleForm = saleFormRes?.data || null

  const [extras, setExtras] = useState(item?.composition?.extras || [])
  const [choices, setChoices] = useState(item?.composition?.choices || [])
  const [lists, setLists] = useState(item?.composition?.lists || [])

  useEffect(() => {
    if (!saleForm || item?.composition) return
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
  }, [saleForm, item?.composition])

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

  const setField = (fieldName: string, value: number) =>
    setFields((current) =>
      current.map((field) =>
        field.name === fieldName ? { ...field, value } : field,
      ),
    )

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-25 p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray">
            {isEdit ? 'Editando o item' : 'Dados do item'}
          </p>
          <p className="font-medium">{name}</p>
        </div>
        <Button
          size="sm"
          type="button"
          variant="outline"
          LeftIcon={IconX}
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>

      {variations.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Tamanho</p>
          <div className="flex flex-wrap gap-2">
            {variations.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setVariation(option.name)}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm',
                  variation === option.name
                    ? 'border-brand-500 bg-white font-medium text-brand-700'
                    : 'border-gray-200 bg-white text-gray-600',
                )}
              >
                {option.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray">
            O tamanho muda a composição e pode ter preço próprio.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="item-quantity" className="text-sm font-medium">
            Quantidade
          </label>
          <Input
            id="item-quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </div>

        {measured && (
          <>
            <div className="space-y-1.5">
              <label htmlFor="item-width" className="text-sm font-medium">
                Largura (m)
              </label>
              <Input
                id="item-width"
                type="number"
                min={0}
                step="0.01"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="item-height" className="text-sm font-medium">
                Altura (m)
              </label>
              <Input
                id="item-height"
                type="number"
                min={0}
                step="0.01"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label htmlFor="item-discount" className="text-sm font-medium">
            Desconto
          </label>
          <Input
            id="item-discount"
            type="number"
            min={0}
            step="0.01"
            value={discount}
            startAdornment={<span className="text-sm">R$</span>}
            onChange={(event) => setDiscount(event.target.value)}
          />
        </div>
      </div>

      {!saleForm && fields.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {fields.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label
                htmlFor={`field-${field.name}`}
                className="text-sm font-medium"
              >
                {field.name}
              </label>
              <Input
                id={`field-${field.name}`}
                type="number"
                min={0}
                step="0.01"
                value={String(field.value)}
                onChange={(event) =>
                  setField(field.name, Number(event.target.value || 0))
                }
              />
            </div>
          ))}
        </div>
      )}

      {saleForm && saleForm.extras.length + saleForm.choices.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
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
                    ...current.filter((item) => item.blockId !== extra.blockId),
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

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={() =>
            onConfirm({
              quantity: Number(quantity) || 1,
              width: measured ? Number(width) || 0 : 0,
              height: measured ? Number(height) || 0 : 0,
              discount: Math.round(Number(discount || 0) * 100),
              fields,
              variation: variation || null,
              composition: saleForm
                ? { extras, choices, lists, summary: summary() }
                : undefined,
            })
          }
        >
          {isEdit ? 'Salvar alterações' : 'Acrescentar ao orçamento'}
        </Button>
        <p className="text-sm text-gray">
          Só estes campos aparecem para quem vende: a composição fica por
          dentro.
        </p>
      </div>
    </div>
  )
}
