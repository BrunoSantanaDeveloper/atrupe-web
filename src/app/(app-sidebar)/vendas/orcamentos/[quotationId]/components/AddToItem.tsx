'use client'

// Acrescentar DENTRO de um item já lançado (ORC-5, 05/10/2026). No legado o
// item é um recipiente aberto: depois de lançado, recebe processos,
// acabamentos, terceirizados e o que mais precisar. Aqui o contexto fica
// escrito no topo ("Acrescentando a: …"), para não confundir com o
// "Adicionar item" do orçamento. O processo nasce com a medida do item (acompanha a
// base) e o preço sai do cálculo do processo; o terceirizado avulso tem
// preço digitado (T-4).

import { useMemo, useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Actions
import { getProcessList, getProcessDetail } from '@/actions/product-assembly'
import { addItemLine } from '@/actions/quotation-composition'

// Libs
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import { IconX, IconSearch, IconArrowLeft } from '@tabler/icons-react'
import { Icon } from '@/components/ui/icon'

interface Props {
  quotationId: string
  itemId: string
  itemName: string
  // A medida do item, em metros, para o processo nascer acompanhando a base
  measure: { quantity: number; width: number; height: number }
  onClose: () => void
}

const num = (value: number) => String(value).replace('.', ',')
const toNumber = (value: string) => Number(value.replace(',', '.')) || 0

export function AddToItem({
  quotationId,
  itemId,
  itemName,
  measure,
  onClose,
}: Props) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('todos')
  const [picked, setPicked] = useState<{ id: string; name: string } | null>(
    null,
  )
  const [loose, setLoose] = useState(false)
  const [width, setWidth] = useState(num(measure.width))
  const [height, setHeight] = useState(num(measure.height))
  const [quantity, setQuantity] = useState(num(measure.quantity))
  const [supplier, setSupplier] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const { data: listRes } = useQuery({
    queryKey: ['process-list'],
    queryFn: () => getProcessList(),
  })
  const processes = useMemo(
    () =>
      (listRes?.data || []).filter(
        (process) => process.active && !process.incomplete,
      ),
    [listRes],
  )
  const sectors = Array.from(new Set(processes.map((item) => item.sector)))
  const visible = processes.filter(
    (process) =>
      (sector === 'todos' || process.sector === sector) &&
      (!search || process.name.toLowerCase().includes(search.toLowerCase())),
  )

  const chosenMeasure = {
    quantity: toNumber(quantity) || 1,
    width: toNumber(width) || 1,
    height: toNumber(height) || 1,
  }
  // O preço do processo com a medida informada, recalculado a cada mudança
  const { data: detailRes, isFetching } = useQuery({
    queryKey: ['add-to-item-price', picked?.id, chosenMeasure],
    queryFn: () =>
      getProcessDetail({
        processId: picked?.id as string,
        measure: chosenMeasure,
      }),
    enabled: !!picked,
  })
  const detail = detailRes?.success ? detailRes.data : null

  const done = (message: string) => {
    toast.success(message)
    queryClient.invalidateQueries({ queryKey: ['quotation-item-lines'] })
    onClose()
  }

  const addProcess = async () => {
    if (!picked || !detail) return
    setSaving(true)
    const res = await addItemLine({
      quotationId,
      itemId,
      line: {
        kind: 'PROCESS',
        name: picked.name,
        sector: detail.block?.sector || '',
        tags: [
          `${num(chosenMeasure.quantity)} un`,
          `${num(chosenMeasure.width)} × ${num(chosenMeasure.height)} m`,
        ],
        cost: detail.cost ?? 0,
        price: detail.sale ?? 0,
        resolvedAt: new Date().toISOString(),
        resolved: [],
      },
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    done(`${picked.name} acrescentado a ${itemName}`)
  }

  const addLoose = async () => {
    setSaving(true)
    const cents = Math.round(toNumber(price) * 100)
    const res = await addItemLine({
      quotationId,
      itemId,
      line: {
        kind: 'LOOSE',
        name: description,
        sector: supplier ? `Terceirizado · ${supplier}` : 'Terceirizado',
        tags: ['terceirizado'],
        cost: 0,
        price: cents,
        resolvedAt: new Date().toISOString(),
        resolved: [],
      },
    })
    setSaving(false)
    if (!res.success) return toast.error(res.message)
    done(`Terceirizado acrescentado a ${itemName}`)
  }

  return (
    <div className="space-y-4 rounded-lg border border-brand-200 bg-brand-25 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray">Acrescentando a</p>
          <p className="font-medium text-gray-900">{itemName}</p>
        </div>
        <Button
          size="sm"
          type="button"
          variant="neutralOutline"
          LeftIcon={IconX}
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>

      {picked ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              type="button"
              variant="neutralGhost"
              LeftIcon={IconArrowLeft}
              onClick={() => setPicked(null)}
            >
              Voltar
            </Button>
            <p className="font-medium text-gray-900">{picked.name}</p>
          </div>
          <p className="text-sm text-gray">
            Nasce com a medida do item. Mude se este processo usa outra medida,
            como a instalação de uma parte só.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="add-qty" className="text-sm font-medium">
                Quantidade
              </label>
              <Input
                id="add-qty"
                inputMode="decimal"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="add-width" className="text-sm font-medium">
                Largura (m)
              </label>
              <Input
                id="add-width"
                inputMode="decimal"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="add-height" className="text-sm font-medium">
                Altura (m)
              </label>
              <Input
                id="add-height"
                inputMode="decimal"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-700">
              Preço de venda:{' '}
              <span className="font-semibold text-gray-900">
                {isFetching || !detail
                  ? 'calculando…'
                  : formatCurrencyToBrl(detail.sale ?? 0)}
              </span>
            </p>
            <Button
              size="sm"
              type="button"
              isLoading={saving}
              disabled={!detail || isFetching}
              onClick={addProcess}
            >
              Acrescentar ao item
            </Button>
          </div>
        </div>
      ) : loose ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="loose-supplier" className="text-sm font-medium">
                Fornecedor
              </label>
              <Input
                id="loose-supplier"
                value={supplier}
                onChange={(event) => setSupplier(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="loose-what" className="text-sm font-medium">
                O que está sendo terceirizado
              </label>
              <Input
                id="loose-what"
                value={description}
                placeholder="Ex.: letra caixa, pintura eletrostática"
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="loose-price" className="text-sm font-medium">
                Preço de venda
              </label>
              <Input
                id="loose-price"
                inputMode="decimal"
                value={price}
                startAdornment={<span className="text-sm">R$</span>}
                onChange={(event) => setPrice(event.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              type="button"
              isLoading={saving}
              disabled={!description.trim() || !toNumber(price)}
              onClick={addLoose}
            >
              Acrescentar ao item
            </Button>
            <Button
              size="sm"
              type="button"
              variant="neutralOutline"
              onClick={() => setLoose(false)}
            >
              Voltar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={search}
              className="w-full sm:w-[280px]"
              placeholder="Buscar processo pelo nome"
              startAdornment={<Icon icon={IconSearch} size="sm" />}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Tabs value={sector} variant="pill" className="overflow-x-auto">
              <TabsList>
                <TabsTrigger value="todos" onClick={() => setSector('todos')}>
                  Todos
                </TabsTrigger>
                {sectors.map((item) => (
                  <TabsTrigger
                    key={item}
                    value={item}
                    onClick={() => setSector(item)}
                  >
                    {item}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((process) => (
              <button
                key={process.id}
                type="button"
                onClick={() =>
                  setPicked({ id: process.id, name: process.name })
                }
                className={cn(
                  'rounded-lg border border-gray-200 bg-white p-3 text-left',
                  'hover:border-brand-300 hover:shadow-sm',
                )}
              >
                <p className="font-medium text-gray-900">{process.name}</p>
                <p className="text-sm text-gray">{process.sector}</p>
              </button>
            ))}
            {!visible.length && (
              <p className="text-sm text-gray">
                Nenhum processo com esse nome.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              type="button"
              variant="neutralOutline"
              onClick={() => setLoose(true)}
            >
              Terceirizado avulso
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
