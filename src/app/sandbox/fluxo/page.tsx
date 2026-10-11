'use client'

// Vitrine do fluxo de etapas (design.md §6.9): o FlowCanvas com a Placa do
// exemplo do time (FL-4) e o modal "Composição" do orçamento (ORC-11) sobre
// um orçamento de mentira, para conferir o desenho sem depender da API.

// React
import { useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'

// Components
import {
  FlowCanvas,
  type FlowNode,
} from '@/components/common/FlowCanvas/FlowCanvas'
import { QuotationComposeModal } from '@/app/(app-sidebar)/vendas/orcamentos/components/QuotationItems/QuotationComposeModal'

// Hooks / Store / Consts
import { QuotationProvider } from '@/contexts/quotationContext'

// Third-party
import { toast } from 'sonner'

export const dynamic = 'force-dynamic'

const placa: FlowNode[] = [
  {
    id: 'arte',
    name: 'Criação da arte',
    sector: 'Criação',
    dependsOn: [],
    subtitle: 'Processo · Criação',
  },
  {
    id: 'lona',
    name: 'Impressão solvente',
    sector: 'Impressão',
    dependsOn: ['arte'],
    subtitle: 'Processo · Impressão',
  },
  {
    id: 'quadro',
    name: 'Quadro de metalon',
    sector: 'Produção',
    dependsOn: [],
    subtitle: 'Parte · 1 etapa',
    part: [
      {
        id: 'solda',
        name: 'Estrutura soldada',
        sector: 'Produção',
        dependsOn: [],
      },
    ],
  },
  {
    id: 'pintura',
    name: 'Pintura da estrutura',
    sector: 'Produção',
    dependsOn: ['quadro'],
  },
  {
    id: 'lateral',
    name: 'Acabamento lateral',
    sector: 'Produção',
    dependsOn: ['pintura'],
    badge: { text: 'Sem recursos', variant: 'warningLight' },
  },
  {
    id: 'instalacao',
    name: 'Instalação',
    sector: 'Instalação',
    dependsOn: ['lona', 'lateral'],
    subtitle: 'Processo · Instalação',
  },
  { id: 'solto', name: 'Caminho solto', sector: 'Serralheria', dependsOn: [] },
]

export default function FlowSandboxPage() {
  const [selected, setSelected] = useState<string | null>('instalacao')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <TooltipProvider>
      <QuotationProvider>
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="mx-auto max-w-[1200px] space-y-8">
            <div>
              <h2 className="text-2xl font-medium text-gray-900">
                Fluxo de etapas (FlowCanvas)
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                A Placa do exemplo do time (FL-4): dois caminhos que se
                encontram na instalação, uma parte que abre e um caminho solto
                com o aviso do FL-12. As caixas são posicionadas pelo sistema.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <FlowCanvas
                nodes={placa}
                selectedId={selected}
                onSelect={setSelected}
                expandedPartId={expanded}
                onTogglePart={(id) =>
                  setExpanded((current) => (current === id ? null : id))
                }
                onAddAfter={(node) =>
                  toast.info(`Etapa depois de ${node.name}`)
                }
                onInsertBetween={(from, to) =>
                  toast.info(`Inserir entre ${from.name} e ${to.name}`)
                }
                onAddPath={() => toast.info('Novo caminho')}
                menu={(node) => [
                  {
                    label: 'Ligar a…',
                    onSelect: () => toast.info(`Ligar ${node.name}`),
                  },
                  {
                    label: 'Remover etapa',
                    destructive: true,
                    separator: true,
                    onSelect: () => toast.info(`Remover ${node.name}`),
                  },
                ]}
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-800">
                Só leitura (relatório, sem permissão de edição)
              </h3>
              <div className="mt-4">
                <FlowCanvas nodes={placa.slice(0, 6)} readOnly />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-base font-semibold text-gray-800">
                Modal &quot;Composição&quot; do orçamento (ORC-11)
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Sobre um orçamento de mentira: o item fica no mock e não chega à
                API.
              </p>
              <Button className="mt-4" onClick={() => setOpen(true)}>
                Abrir composição
              </Button>
              <QuotationComposeModal
                open={open}
                quotationId="sandbox"
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      </QuotationProvider>
    </TooltipProvider>
  )
}
