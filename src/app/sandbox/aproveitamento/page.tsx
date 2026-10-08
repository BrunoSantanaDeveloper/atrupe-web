'use client'

// Vitrine do aproveitamento de folha na venda (AP-5, 08/10/2026): o mesmo
// bloco "Escolhas do produto" do modal de adicionar item, com a quantidade e
// a medida do item ao lado, para conferir quantas folhas (ou chapas) a venda
// usa sem depender da API. O cartão usa folha A3 inteira; o painel de ACM
// usa chapa de 1,22 × 5 m cobrando só a fração.

import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { SaleCompositionFields } from '@/app/(app-sidebar)/vendas/orcamentos/components/QuotationItems/SaleCompositionFields'
import type { ItemComposition } from '@/app/(app-sidebar)/vendas/orcamentos/[quotationId]/composicao/types'

export const dynamic = 'force-dynamic'

const products = [
  {
    id: 'cartao',
    name: 'Cartão de visita',
    quantity: 1000,
    width: 0,
    height: 0,
  },
  {
    id: 'painel-acm',
    name: 'Painel de ACM',
    quantity: 1,
    width: 2000,
    height: 1000,
  },
]

export default function AproveitamentoVitrine() {
  const [productId, setProductId] = useState(products[0].id)
  const [quantity, setQuantity] = useState(products[0].quantity)
  const [width, setWidth] = useState(products[0].width)
  const [height, setHeight] = useState(products[0].height)
  const [composition, setComposition] = useState<ItemComposition>()

  const pick = (id: string) => {
    const product = products.find((item) => item.id === id)!
    setProductId(id)
    setQuantity(product.quantity)
    setWidth(product.width)
    setHeight(product.height)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-8">
      <h1 className="text-lg font-semibold text-gray-900">
        Vitrine · aproveitamento de folha na venda
      </h1>
      <div className="flex flex-wrap gap-3">
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            className={`rounded-md border px-3 py-1.5 text-sm ${productId === product.id ? 'border-gray-900 font-medium' : 'border-gray-300'}`}
            onClick={() => pick(product.id)}
          >
            {product.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <label className="space-y-1.5 text-sm font-medium">
          Quantidade
          <Input
            type="number"
            aria-label="Quantidade"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Largura (mm)
          <Input
            type="number"
            aria-label="Largura"
            value={width}
            onChange={(event) => setWidth(Number(event.target.value))}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Altura (mm)
          <Input
            type="number"
            aria-label="Altura"
            value={height}
            onChange={(event) => setHeight(Number(event.target.value))}
          />
        </label>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <SaleCompositionFields
          key={productId}
          productId={productId}
          measure={{ quantity, width: width / 1000, height: height / 1000 }}
          onChange={setComposition}
        />
      </div>
      {composition?.summary.length ? (
        <div className="flex flex-wrap gap-2" data-testid="resumo">
          {composition.summary.map((entry) => (
            <Badge key={entry} variant="neutralLight">
              {entry}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}
