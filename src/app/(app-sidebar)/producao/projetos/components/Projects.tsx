'use client'

// Acompanhamento dos projetos (GP-8, GP-18, PCP-4): cada venda aprovada vira
// um projeto, com as tarefas geradas da composição. Situação na URL
// (?status=), abas segmentadas no Topbar, card com ícone de destaque
// (design.md §18.4). Enquanto a API não cria o projeto ao aprovar o
// orçamento, há um botão de exemplo que faz o mesmo com um produto de
// exemplo.

// React / Next
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { ActionButton } from '@/components/common/ActionButton'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { PermissionGate } from '@/components/common/PermissionGate'
import { ListDataTotalEmpty } from '@/components/common/TableEmptyState'

// Types
import type { ProjectStatus } from '../../gerenciador/manager'

// Actions
import {
  getProjects,
  createProjectFromSale,
} from '@/actions/production-manager'
import { getQuotationProducts } from '@/actions/quotation-composition'

// Hooks / Store / Consts
import { projectStatusObj, PRODUCTION_MANAGE } from '@/consts/productionManager'

// Third-party
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Icons
import {
  IconPlus,
  IconSearch,
  IconListCheck,
  IconClipboardList,
  IconAlertTriangle,
} from '@tabler/icons-react'

const date = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')

const tabs: { value: ProjectStatus; label: string }[] = [
  { value: 'PRODUCTION', label: 'Em produção' },
  { value: 'STANDBY', label: 'Stand-by' },
  { value: 'DONE', label: 'Concluídos' },
  { value: 'CANCELED', label: 'Cancelados' },
]

export function Projects() {
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const status = (params.get('status') as ProjectStatus) || 'PRODUCTION'
  const [exampleOpen, setExampleOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['production-projects'],
    queryFn: () => getProjects(),
  })
  const all = data?.data || []
  const projects = all.filter((item) => item.status === status)

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <Topbar
          review="new"
          title="Projetos"
          supportText="As vendas em produção, com as tarefas de cada item"
          paramName="status"
          activeTab={status}
          tabs={tabs.map((tab) => ({
            value: tab.value,
            tab: tab.value,
            label: tab.label,
            count: all.filter((item) => item.status === tab.value).length,
          }))}
          primaryCta={
            <PermissionGate permissions={PRODUCTION_MANAGE}>
              <Button
                variant="neutralOutline"
                LeftIcon={IconPlus}
                onClick={() => setExampleOpen(true)}
              >
                Projeto da venda aprovada (exemplo)
              </Button>
            </PermissionGate>
          }
        />

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FeaturedIcon variant="neutralOutline" Icon={IconClipboardList} />
              <div>
                <CardTitle>Projetos</CardTitle>
                <CardDescription>
                  O projeto nasce quando a venda é aprovada: uma tarefa para
                  cada etapa da composição dos itens.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {isLoading ? (
            <TableSkeleton cols={6} rows={4} />
          ) : !projects.length ? (
            <ListDataTotalEmpty
              icon={IconListCheck}
              title={`Nenhum projeto para o status: ${tabs.find((tab) => tab.value === status)?.label}`}
              description="O projeto nasce quando a venda é aprovada."
            />
          ) : (
            <CardContent>
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[12%]">Venda</TableHead>
                    <TableHead className="w-[26%]">Cliente</TableHead>
                    <TableHead className="w-[14%]">Aprovação</TableHead>
                    <TableHead className="w-[18%]">Entrega</TableHead>
                    <TableHead className="w-[24%]">Tarefas</TableHead>
                    <TableHead className="w-[6%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.number}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-800">
                          {project.client}
                        </p>
                        <p className="text-xs text-gray">
                          {project.deliveryType}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        {date(project.approvedAt)}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-800">
                          {date(project.due)}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {project.late && (
                            <Badge variant="errorLight">Em atraso</Badge>
                          )}
                          {!project.late && project.risk && (
                            <Badge variant="warningLight">
                              Entrega em risco
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full bg-success-500"
                              style={{
                                width: `${project.total ? (project.done / project.total) * 100 : 0}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-700">
                            {project.done} / {project.total}
                          </span>
                          {project.alerts > 0 && (
                            <span className="flex items-center gap-1 text-xs text-error-700">
                              <IconAlertTriangle className="size-3.5" />
                              {project.alerts}
                            </span>
                          )}
                        </div>
                        <Badge
                          variant={projectStatusObj[project.status].variant}
                          className="mt-1"
                        >
                          {projectStatusObj[project.status].text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <ActionButton
                            Icon={IconSearch}
                            tooltip={`Abrir ${project.number}`}
                            link={`/producao/projetos/${project.id}`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          )}
        </Card>
      </div>

      <ExampleProjectDialog
        open={exampleOpen}
        onOpenChange={setExampleOpen}
        onCreated={() =>
          queryClient.invalidateQueries({ queryKey: ['production-projects'] })
        }
      />
    </TooltipProvider>
  )
}

// O que a API vai fazer ao aprovar o orçamento (PCP-4), chamado à mão com um
// produto de exemplo, para o fluxo ser conferido de ponta a ponta
function ExampleProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}) {
  const [number, setNumber] = useState('')
  const [client, setClient] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [width, setWidth] = useState('1')
  const [height, setHeight] = useState('1')
  const [due, setDue] = useState('')
  const [saving, setSaving] = useState(false)

  const { data: productsRes } = useQuery({
    queryKey: ['quotation-products'],
    queryFn: () => getQuotationProducts(),
    enabled: open,
  })
  const products = (productsRes?.data || []).filter(
    (product) => product.hasComposition,
  )

  const create = async () => {
    const product = products.find((item) => item.id === productId)
    if (!product) return
    setSaving(true)
    const res = await createProjectFromSale({
      number,
      client,
      seller: 'Natihely',
      deliveryType: 'Cliente retira',
      due,
      items: [
        {
          productId: product.id,
          name: product.name,
          measure: {
            quantity: Number(quantity) || 1,
            width: Number(width.replace(',', '.')) || 1,
            height: Number(height.replace(',', '.')) || 1,
          },
        },
      ],
    })
    setSaving(false)
    if (!res.success || !res.data) return toast.error(res.message)
    toast.success(`Projeto criado com ${res.data.tasks} tarefa(s), em stand-by`)
    onCreated()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <FeaturedIcon variant="neutralOutline" Icon={IconPlus} />
            <div>
              <DialogTitle>Projeto da venda aprovada</DialogTitle>
              <DialogDescription>
                Exemplo do que a aprovação do orçamento vai fazer: o projeto
                nasce em stand-by, com uma tarefa por etapa da composição.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="example-number">Número da venda</Label>
            <Input
              id="example-number"
              placeholder="Ex.: 1027-V1"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="example-client">Cliente</Label>
            <Input
              id="example-client"
              value={client}
              onChange={(event) => setClient(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <SelectBasic
              name="example-product"
              label="Produto com composição"
              options={products.map((product) => ({
                value: product.id,
                label: `${product.name} · ${product.sector}`,
              }))}
              value={productId}
              onChange={(value) => value && setProductId(String(value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="example-qty">Quantidade</Label>
            <Input
              id="example-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="example-width">Largura (m)</Label>
              <Input
                id="example-width"
                inputMode="decimal"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="example-height">Altura (m)</Label>
              <Input
                id="example-height"
                inputMode="decimal"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="example-due">Entrega</Label>
            <Input
              id="example-due"
              type="date"
              value={due}
              onChange={(event) => setDue(event.target.value)}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            isLoading={saving}
            disabled={!number.trim() || !client.trim() || !productId}
            onClick={create}
          >
            Criar projeto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
