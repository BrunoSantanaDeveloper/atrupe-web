'use client'

// Vitrine da lista de itens do orçamento (05/10/2026): o bloco Itens com um
// orçamento de mentira, para conferir o desenho sem depender da API. As ações
// que gravam (editar, valores, duplicar) chamam a API e falham aqui.
//
// 06/10/2026: a Fachada nasce com três linhas acrescentadas (processo que
// acompanha a base, item pronto com medida própria e terceirizado avulso),
// a Placa tem valor agregado, e há um item de material de venda direta. O
// painel "Acrescentar a este item" funciona inteiro com o mock (processos e
// produtos de exemplo); o modal "Adicionar item" abre, mas a lista de
// produtos vem da API.

import { QuotationItems } from '@/app/(app-sidebar)/vendas/orcamentos/[quotationId]/components/QuotationItems'
import { QuotationProvider } from '@/contexts/quotationContext'
import type { QuotationType } from '@/types/sales/quotation'

export const dynamic = 'force-dynamic'

const part = (
  id: string,
  name: string,
  unitKind: string,
  extra: Record<string, number>,
  totalValue: number,
) => ({
  id,
  originalCompositionId: id,
  name,
  unitKind,
  unitOfMeasure: {
    id: unitKind,
    name: unitKind,
    code: unitKind,
    description: '',
    isActive: true,
    companyId: '',
  },
  quantity: 1,
  unitValue: totalValue,
  totalValue,
  width: 0,
  height: 0,
  length: 0,
  weight: 0,
  volume: 0,
  distance: 0,
  duration: 0,
  ...extra,
})

const quotation = {
  id: 'vitrine-orcamento',
  status: 'OPEN',
  quotationItems: [
    {
      id: 'item-banner',
      description: 'Banner lona 440 com bastão',
      notes: 'Cliente pediu bastão de madeira pintado de preto.',
      discountType: 'VALUE',
      discount: 0,
      unitValue: 12000,
      totalValue: 12000,
      originalValue: 12000,
      finalValue: 12000,
      allowEditDescription: true,
      allowEditValues: true,
      image: { url: '', original: true },
      technicalDescription: '',
      product: {
        originalProductId: 'produto-banner',
        name: 'Banner',
        quantity: 1,
        unitValue: 12000,
        finalValue: 12000,
        compositions: [
          part('c1', 'Banner', 'AREA', { width: 2000, height: 1000 }, 12000),
        ],
      },
    },
    {
      id: 'item-placa',
      description: 'Placa em PVC 3 mm',
      notes: '',
      discountType: 'VALUE',
      discount: -1000,
      unitValue: 3900,
      totalValue: 3900,
      originalValue: 3900,
      // Valor agregado (ALT-25): o vendedor subiu o valor para arredondar
      finalValue: 5000,
      allowEditDescription: true,
      allowEditValues: true,
      image: { url: '', original: true },
      technicalDescription: '',
      product: {
        originalProductId: 'placa-pvc',
        name: 'Placa PVC 3 mm',
        quantity: 1,
        unitValue: 3900,
        finalValue: 5000,
        compositions: [part('c6', 'Placa PVC 3 mm', 'UNITY', {}, 3900)],
      },
    },
    {
      id: 'item-fachada',
      description: 'Fachada em ACM com letra caixa',
      notes: '',
      discountType: 'VALUE',
      discount: 5000,
      unitValue: 67884,
      totalValue: 67884,
      originalValue: 67884,
      finalValue: 62884,
      allowEditDescription: true,
      allowEditValues: true,
      image: { url: '', original: true },
      technicalDescription: '',
      product: {
        originalProductId: 'produto-fachada',
        name: 'Fachada',
        quantity: 1,
        unitValue: 67884,
        finalValue: 62884,
        compositions: [
          part('c2', 'Instalação', 'DURATION', { duration: 7200 }, 9000),
          part(
            'c3',
            'Impressão solvente',
            'AREA',
            { width: 2000, height: 1000 },
            12000,
          ),
          part('c4', 'Ilhós', 'UNITY', {}, 2440),
          part('c5', 'Letra caixa (terceirizada)', 'UNITY', {}, 44444),
        ],
      },
    },
  ],
} as unknown as QuotationType

export default function OrcamentoVitrine() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-8">
      <h1 className="text-lg font-semibold text-gray-900">
        Vitrine · itens do orçamento
      </h1>
      <QuotationProvider>
        <QuotationItems data={quotation} />
      </QuotationProvider>
    </div>
  )
}
