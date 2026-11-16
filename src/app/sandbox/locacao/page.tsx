'use client'

// Vitrine da locação (área 14 do openspec, 16/11/2026): as telas plano a
// plano, com dados de exemplo, para conferir o desenho sem depender da API.
// START: produto de locação com valor por período, a locação no orçamento e
// o contrato. LITE: reserva, cobrança mensal e o financeiro por bem. PRO:
// composição com os custos do patrimônio. ELITE: tarefas e comprovação. A
// tela de agenda fica para depois do ELITE.

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heading, Text } from '@/components/ui/typography'

import {
  CONTRACT_MODELS,
  PLANS,
  PLAN_NAME,
  PRODUCTS,
  addDays,
  planHas,
  today,
  type ContractModel,
  type Plan,
  type RentalProduct,
} from './data'
import { PlanLock } from './components/PlanLock'
import { RentalComposition } from './components/RentalComposition'
import { RentalContract } from './components/RentalContract'
import { RentalFinance } from './components/RentalFinance'
import { RentalProduction } from './components/RentalProduction'
import { RentalProductForm } from './components/RentalProductForm'
import {
  RentalQuotationItem,
  type RentalDraft,
} from './components/RentalQuotationItem'

export const dynamic = 'force-dynamic'

const PLAN_SUMMARY: Record<Plan, string> = {
  START:
    'Cadastra o bem com o valor por período, faz a locação no orçamento e imprime o contrato. Sem reserva.',
  LITE: 'Reserva a partir do Aguardando, cobrança mensal, contratos que vencem e resultado de caixa por bem.',
  PRO: 'O produto ganha a composição com os custos do patrimônio: custo por dia, preço sugerido e resultado por bem.',
  ELITE:
    'Instalação, retirada e manutenção viram tarefas, com a foto de comprovação enviada ao cliente.',
}

export default function LocacaoSandbox() {
  const [plan, setPlan] = useState<Plan>('START')
  const [products, setProducts] = useState<RentalProduct[]>(PRODUCTS)
  const [editingId, setEditingId] = useState(PRODUCTS[0].id)
  const [models, setModels] = useState<ContractModel[]>(CONTRACT_MODELS)
  const [modelId, setModelId] = useState(CONTRACT_MODELS[0].id)
  const [draft, setDraft] = useState<RentalDraft>({
    productId: PRODUCTS[0].id,
    start: addDays(today(), 20),
    end: addDays(today(), 33),
    count: 1,
    status: 'DRAFT',
    validUntil: addDays(today(), 7),
    monthly: false,
  })

  const editing = products.find((item) => item.id === editingId) || products[0]
  const drafted =
    products.find((item) => item.id === draft.productId) || products[0]

  return (
    <main className="min-h-screen space-y-6 bg-gray-100 p-6">
      <header className="space-y-1">
        <Heading as="h1">Locação</Heading>
        <Text variant="page-subtitle">
          As telas da locação em cada plano, com dados de exemplo. Troque o
          plano para ver o que aparece e o que fica travado.
        </Text>
      </header>

      <section className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            Ver como o plano
          </span>
          {PLANS.map((item) => (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={item === plan ? 'default' : 'neutralOutline'}
              onClick={() => setPlan(item)}
            >
              {PLAN_NAME[item]}
            </Button>
          ))}
        </div>
        <p className="text-sm text-gray">{PLAN_SUMMARY[plan]}</p>
      </section>

      <Tabs defaultValue="cadastro" variant="underline" intent="brand">
        <TabsList>
          <TabsTrigger value="cadastro">Cadastro do produto</TabsTrigger>
          <TabsTrigger value="orcamento">Locação no orçamento</TabsTrigger>
          <TabsTrigger value="contrato">Contrato</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="composicao">Composição</TabsTrigger>
          <TabsTrigger value="producao">Produção</TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro" className="space-y-4 pt-4">
          <div className="max-w-md space-y-1.5">
            <Label>Produto de exemplo</Label>
            <Select value={editing.id} onValueChange={setEditingId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {products.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <RentalProductForm
            plan={plan}
            product={editing}
            onChange={(next) =>
              setProducts((current) =>
                current.map((item) => (item.id === next.id ? next : item)),
              )
            }
          />
        </TabsContent>

        <TabsContent value="orcamento" className="pt-4">
          <RentalQuotationItem
            plan={plan}
            products={products}
            draft={draft}
            onChange={setDraft}
          />
        </TabsContent>

        <TabsContent value="contrato" className="pt-4">
          <RentalContract
            plan={plan}
            product={drafted}
            draft={draft}
            models={models}
            modelId={modelId}
            onModelId={setModelId}
            onModels={setModels}
          />
        </TabsContent>

        <TabsContent value="financeiro" className="pt-4">
          <PlanLock
            plan={plan}
            from="LITE"
            title="Financeiro da locação"
            locked="No Start a receita da locação aparece por produto, nos relatórios de venda. No Lite entram os contratos com a cobrança mensal, o aviso dos que estão para vencer e o resultado de caixa de cada bem."
          >
            <RentalFinance />
          </PlanLock>
        </TabsContent>

        <TabsContent value="composicao" className="pt-4">
          <PlanLock
            plan={plan}
            from="PRO"
            title="Composição do produto de locação"
            locked={
              planHas(plan, 'LITE')
                ? 'No Lite você vê o caixa de cada bem. No Pro o produto ganha a composição com os custos do patrimônio: quanto custa cada dia do bem, o preço sugerido de cada período e o resultado completo por bem.'
                : 'No Pro o produto ganha a composição com os custos do patrimônio: quanto custa cada dia do bem, o preço sugerido de cada período e o resultado completo por bem.'
            }
          >
            <RentalComposition
              products={products}
              productId={editingId}
              onProductId={setEditingId}
            />
          </PlanLock>
        </TabsContent>

        <TabsContent value="producao" className="pt-4">
          <PlanLock
            plan={plan}
            from="ELITE"
            title="A locação no gerenciador de produção"
            locked="No Elite a instalação, a retirada e a manutenção viram tarefas com equipe e data, e a foto de comprovação vai para o cliente."
          >
            <RentalProduction product={drafted} draft={draft} />
          </PlanLock>
        </TabsContent>
      </Tabs>
    </main>
  )
}
