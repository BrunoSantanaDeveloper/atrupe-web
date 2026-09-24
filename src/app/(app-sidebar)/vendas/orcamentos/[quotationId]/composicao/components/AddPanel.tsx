'use client'

// React
import { useState } from 'react'

// UI
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Types
import type { AddOption } from '../types'

// Hooks / Store / Consts
import { cn, formatCurrencyToBrl } from '@/lib/utils'

// Icons
import { IconX, IconSearch } from '@tabler/icons-react'

interface Props {
  // Dito em voz alta: o mesmo painel serve aos dois níveis, e o que muda é
  // onde a escolha vai cair (ORC-5)
  context: string
  options: AddOption[]
  // Terceirizado avulso só existe dentro do item (T-4)
  allowLoose?: boolean
  onClose: () => void
  onPick: (option: AddOption) => void
  onLoose?: (values: {
    supplier: string
    description: string
    price: number
  }) => void
}

export function AddPanel({
  context,
  options,
  allowLoose,
  onClose,
  onPick,
  onLoose,
}: Props) {
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('todos')
  const [loose, setLoose] = useState(false)
  const [supplier, setSupplier] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')

  const sectors = Array.from(new Set(options.map((option) => option.sector)))

  const visible = options.filter(
    (option) =>
      (sector === 'todos' || option.sector === sector) &&
      (!search || option.name.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-25 p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray">Acrescentando a</p>
          <p className="font-medium">{context}</p>
        </div>
        <Button
          size="sm"
          type="button"
          variant="outline"
          LeftIcon={IconX}
          onClick={onClose}
        >
          Fechar
        </Button>
      </div>

      {loose ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                placeholder="Ex.: pintura eletrostática"
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="loose-price" className="text-sm font-medium">
                Preço de venda
              </label>
              <Input
                id="loose-price"
                type="number"
                min={0}
                step="0.01"
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
              disabled={!description || !price}
              onClick={() => {
                onLoose?.({
                  supplier,
                  description,
                  price: Math.round(Number(price) * 100),
                })
                setLoose(false)
                setSupplier('')
                setDescription('')
                setPrice('')
              }}
            >
              Acrescentar
            </Button>
            <Button
              size="sm"
              type="button"
              variant="outline"
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
              placeholder="Buscar pelo nome"
              startAdornment={<IconSearch size={16} />}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Tabs value={sector} className="overflow-x-auto">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {visible.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onPick(option)}
                className={cn(
                  'rounded-lg border border-gray-200 bg-white p-3 text-left',
                  'hover:border-brand-300 hover:shadow-sm',
                )}
              >
                <p className="font-medium">{option.name}</p>
                <p className="text-sm text-gray">
                  {option.sector} · {formatCurrencyToBrl(option.price)}/
                  {option.unit}
                </p>
                {option.releasedForSale === false && (
                  <Badge variant="blueLight" className="mt-2">
                    parte
                  </Badge>
                )}
              </button>
            ))}
            {!visible.length && (
              <p className="text-sm text-gray">
                Nada encontrado com esse nome.
              </p>
            )}
          </div>

          {allowLoose && (
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setLoose(true)}
            >
              Terceirizado avulso
            </Button>
          )}
        </>
      )}
    </div>
  )
}
