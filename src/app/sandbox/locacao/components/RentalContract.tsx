'use client'

// Contrato de locação para imprimir e assinar (LC-15, 16/11/2026). Sai do
// orçamento, como a impressão da proposta: as partes, o bem, o período e os
// valores vêm sozinhos; as cláusulas são o modelo que a empresa edita em
// Configurações. O contrato descreve a negociação inteira: todos os itens,
// os prazos, os valores e a forma de pagamento. START: um modelo. LITE:
// mais de um modelo e as parcelas mensais da cobrança recorrente.

import { IconPlus, IconPrinter, IconTrash } from '@tabler/icons-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ActionButton } from '@/components/common/ActionButton'

import {
  addDays,
  formatBrl,
  formatDate,
  planHas,
  today,
  unitOf,
  type ContractModel,
  type Plan,
  type RentalProduct,
} from '../data'
import { PlanLock } from './PlanLock'
import { installmentsOf, lineOf, type RentalDraft } from './RentalQuotationItem'

const COMPANY = {
  name: 'Atrupe Comunicação Visual Ltda.',
  document: '12.345.678/0001-90',
  address: 'Rua das Palmeiras, 450 - Centro, Balneário Camboriú/SC',
}

const CLIENT = {
  name: 'Loja Mundo Kids Ltda.',
  document: '98.765.432/0001-10',
  address: 'Av. Atlântica, 2000 - Centro, Balneário Camboriú/SC',
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-2 border-b border-gray-200 py-1.5 last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{children}</span>
    </div>
  )
}

export function RentalContract({
  plan,
  product,
  draft,
  models,
  modelId,
  onModelId,
  onModels,
}: {
  plan: Plan
  product: RentalProduct
  draft: RentalDraft
  models: ContractModel[]
  modelId: string
  onModelId: (id: string) => void
  onModels: (models: ContractModel[]) => void
}) {
  const manyModels = planHas(plan, 'LITE')
  // No START existe um modelo só: o primeiro
  const model =
    (manyModels && models.find((item) => item.id === modelId)) || models[0]

  const line = lineOf(product, draft, plan)
  const days = draft.start ? line.period.days : 0
  const installments =
    manyModels && draft.monthly ? installmentsOf(draft, line) : []

  // O contrato descreve a negociação inteira (Maicol, 16/11/2026): todos os
  // itens do orçamento, os prazos, os valores e a forma de pagamento
  const start = draft.start
  const extras: { name: string; term: string; cents: number }[] = !start
    ? []
    : product.event
      ? [
          {
            name: 'Entrega, montagem e desmontagem',
            term: `${formatDate(start)} e ${formatDate(line.end)}`,
            cents: 35000,
          },
        ]
      : product.capacity === 1
        ? [
            {
              name: `Impressão da lona ${product.spot?.artSize || ''}`.trim(),
              term: `Pronta até ${formatDate(addDays(start, -2))}`,
              cents: 32000,
            },
            {
              name: 'Instalação e retirada',
              term: `${formatDate(start)} e ${formatDate(line.end)}`,
              cents: 18000,
            },
          ]
        : []
  const extrasCents = extras.reduce((sum, item) => sum + item.cents, 0)
  const totalCents = line.totalCents + extrasCents

  // Forma de pagamento: a condição do orçamento. Com a cobrança mensal
  // (LITE), a locação vai nas parcelas mensais e o resto na entrada
  const payments: {
    label: string
    method: string
    due?: Date
    cents: number
  }[] = !start
    ? []
    : installments.length
      ? [
          ...(extrasCents
            ? [
                {
                  label: 'Entrada (serviços)',
                  method: 'PIX',
                  due: today(),
                  cents: extrasCents,
                },
              ]
            : []),
          ...installments.map((installment, index) => ({
            label: `Locação ${index + 1}/${installments.length}`,
            method: 'Boleto',
            due: installment.due,
            cents: installment.cents,
          })),
        ]
      : [
          {
            label: 'Parcela 1/2',
            method: 'Boleto',
            due: today(),
            cents: Math.ceil(totalCents / 2),
          },
          {
            label: 'Parcela 2/2',
            method: 'Boleto',
            due: addDays(today(), 30),
            cents: Math.floor(totalCents / 2),
          },
        ]

  const patchClause = (
    index: number,
    changes: Partial<ContractModel['clauses'][number]>,
  ) =>
    onModels(
      models.map((item) =>
        item.id === model.id
          ? {
              ...item,
              clauses: item.clauses.map((clause, i) =>
                i === index ? { ...clause, ...changes } : clause,
              ),
            }
          : item,
      ),
    )

  const setClauses = (clauses: ContractModel['clauses']) =>
    onModels(
      models.map((item) =>
        item.id === model.id ? { ...item, clauses } : item,
      ),
    )

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1.5">
                <CardTitle>Contrato de locação</CardTitle>
                <CardDescription>
                  No orçamento, ao lado de &quot;Imprimir proposta&quot;. Sai em
                  PDF, com o cabeçalho da empresa.
                </CardDescription>
              </div>
              <Button
                type="button"
                LeftIcon={IconPrinter}
                disabled={!days}
                onClick={() =>
                  toast.success('Na tela real, o contrato abre em PDF.')
                }
              >
                Imprimir contrato
              </Button>
            </div>
          </CardHeader>
          <CardContent className="bg-gray-100 px-6 py-6">
            <div className="mx-auto max-w-[760px] space-y-5 bg-white p-10 text-sm leading-relaxed text-gray-800 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-300 pb-4">
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {COMPANY.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    CNPJ {COMPANY.document} · {COMPANY.address}
                  </p>
                </div>
                <p className="text-xs text-gray-500">Orçamento 41-T1</p>
              </div>

              <h2 className="text-center text-base font-semibold uppercase tracking-wide text-gray-900">
                Contrato de locação nº 41-T1
              </h2>

              <p>
                <span className="font-semibold">LOCADORA:</span> {COMPANY.name},
                CNPJ {COMPANY.document}, com sede em {COMPANY.address}.
              </p>
              <p>
                <span className="font-semibold">LOCATÁRIA:</span> {CLIENT.name},
                CNPJ {CLIENT.document}, com sede em {CLIENT.address}.
              </p>

              <div className="rounded border border-gray-300 px-4 py-2">
                <Row label="Bem locado">
                  {product.capacity > 1
                    ? `${draft.quantity} ${unitOf(product, draft.quantity)} · `
                    : ''}
                  {product.name}
                </Row>
                {product.spot && (
                  <>
                    <Row label="Endereço do ponto">{product.spot.address}</Row>
                    <Row label="Face">
                      {product.spot.face} ·{' '}
                      {product.spot.lit ? 'iluminado' : 'sem iluminação'}
                    </Row>
                    <Row label="Medida da arte">{product.spot.artSize}</Row>
                  </>
                )}
                <Row label="Período">
                  {days
                    ? `${line.period.name}: ${formatDate(draft.start)} a ${formatDate(line.end)} (${days} ${days === 1 ? 'dia' : 'dias'})`
                    : 'Sem datas no orçamento'}
                </Row>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-gray-900">
                  Itens da negociação
                </p>
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-300 text-gray-500">
                      <th className="py-1 font-medium">Item</th>
                      <th className="py-1 font-medium">Prazo</th>
                      <th className="py-1 text-right font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-1">
                        Locação: {draft.quantity}
                        {product.unit
                          ? ` ${unitOf(product, draft.quantity)}`
                          : ''}{' '}
                        × {line.period.name}
                      </td>
                      <td className="py-1">
                        {days
                          ? `${formatDate(draft.start)} a ${formatDate(line.end)}`
                          : '-'}
                      </td>
                      <td className="py-1 text-right">
                        {formatBrl(line.totalCents)}
                      </td>
                    </tr>
                    {extras.map((item) => (
                      <tr key={item.name} className="border-b border-gray-200">
                        <td className="py-1">{item.name}</td>
                        <td className="py-1">{item.term}</td>
                        <td className="py-1 text-right">
                          {formatBrl(item.cents)}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-semibold text-gray-900">
                      <td className="py-1" colSpan={2}>
                        Total
                      </td>
                      <td className="py-1 text-right">
                        {formatBrl(totalCents)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-gray-900">
                  Forma de pagamento
                </p>
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-300 text-gray-500">
                      <th className="py-1 font-medium">Parcela</th>
                      <th className="py-1 font-medium">Forma</th>
                      <th className="py-1 font-medium">Vencimento</th>
                      <th className="py-1 text-right font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.label}
                        className="border-b border-gray-200"
                      >
                        <td className="py-1">{payment.label}</td>
                        <td className="py-1">{payment.method}</td>
                        <td className="py-1">{formatDate(payment.due)}</td>
                        <td className="py-1 text-right">
                          {formatBrl(payment.cents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3">
                {model.clauses.map((clause, index) => (
                  <p key={index}>
                    <span className="font-semibold">
                      Cláusula {index + 1}ª - {clause.title}.
                    </span>{' '}
                    {clause.text}
                  </p>
                ))}
              </div>

              <p>Balneário Camboriú/SC, {formatDate(today())}.</p>

              <div className="grid grid-cols-2 gap-10 pt-10 text-center text-xs">
                <div className="border-t border-gray-400 pt-2">
                  <p className="font-semibold">{COMPANY.name}</p>
                  <p className="text-gray-500">LOCADORA</p>
                </div>
                <div className="border-t border-gray-400 pt-2">
                  <p className="font-semibold">{CLIENT.name}</p>
                  <p className="text-gray-500">LOCATÁRIA</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Modelo do contrato</CardTitle>
            <CardDescription>
              Configurações › Vendas › Contrato de locação. As cláusulas valem
              para todos os contratos deste modelo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6">
            <PlanLock
              plan={plan}
              from="LITE"
              title="Mais de um modelo"
              locked="No Start a empresa tem um modelo de contrato. No Lite pode ter um para outdoor e painéis e outro para eventos, e escolher no orçamento."
            >
              <div className="space-y-1.5">
                <Label>Modelo deste orçamento</Label>
                <Select value={model.id} onValueChange={onModelId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PlanLock>

            {model.clauses.map((clause, index) => (
              <div
                key={index}
                className="space-y-2 rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    {index + 1}ª
                  </span>
                  <Input
                    aria-label={`Título da cláusula ${index + 1}`}
                    value={clause.title}
                    onChange={(event) =>
                      patchClause(index, { title: event.target.value })
                    }
                  />
                  <ActionButton
                    Icon={IconTrash}
                    variant="errorGhost"
                    tooltip="Remover cláusula"
                    onClick={() =>
                      setClauses(model.clauses.filter((_, i) => i !== index))
                    }
                  />
                </div>
                <Textarea
                  aria-label={`Texto da cláusula ${index + 1}`}
                  rows={4}
                  value={clause.text}
                  onChange={(event) =>
                    patchClause(index, { text: event.target.value })
                  }
                />
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="neutralOutline"
              LeftIcon={IconPlus}
              onClick={() =>
                setClauses([...model.clauses, { title: '', text: '' }])
              }
            >
              Nova cláusula
            </Button>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
