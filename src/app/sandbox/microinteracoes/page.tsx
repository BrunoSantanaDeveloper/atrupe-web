'use client'

// Vitrine de movimento e carregamento — design/openspec/changes/archive/2026-10-07-microinteracoes
import { useState } from 'react'

// UI
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Components
import { FetchingRegion } from '@/components/common/FetchingRegion'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'
import { startNavigationProgress } from '@/components/layout/NavigationProgress'

// Hooks
import { useRouter } from '@/hooks/useRouter'
import { useAlertDialog } from '@/store/useAlertDialog'

// Icons
import { IconDeviceFloppy, IconTrash } from '@tabler/icons-react'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const ROWS = [
  ['Gráfica Central', 'Varejo', 'Regularizado'],
  ['Placas Norte', 'Indústria', 'Pré-cadastro'],
  ['Studio Letreiro', 'Serviços', 'Regularizado'],
  ['Adesivos & Cia', 'Varejo', 'Inativo'],
]

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {children}
    </section>
  )
}

export default function MicrointeracoesSandbox() {
  const router = useRouter()
  const { open: openAlertDialog } = useAlertDialog()

  const [buttonsLoading, setButtonsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [skeletonKey, setSkeletonKey] = useState(0)
  const [page, setPage] = useState(1)
  const [tableState, setTableState] = useState<'loading' | 'idle' | 'fetching'>(
    'idle',
  )

  async function handleSave() {
    setSaving(true)
    await wait(1500)
    setSaving(false)
  }

  async function loadTable(next: number, first = false) {
    setTableState(first ? 'loading' : 'fetching')
    await wait(900)
    setPage(next)
    setTableState('idle')
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Microinterações</h1>
          <p className="text-gray-600">
            Movimento e carregamento. Para conferir o movimento reduzido, ative
            a opção de acessibilidade do sistema operacional.
          </p>
        </div>
      </div>

      <Section
        title="Botão em progresso"
        description="Mantém a cor e a largura; o spinner fica no lugar do conteúdo e acompanha o tamanho."
      >
        <div className="flex items-center gap-3">
          <Switch
            id="buttons-loading"
            checked={buttonsLoading}
            onCheckedChange={setButtonsLoading}
          />
          <label htmlFor="buttons-loading" className="text-sm text-gray-700">
            Em progresso
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" isLoading={buttonsLoading}>
            Salvar alterações
          </Button>
          <Button
            variant="default"
            LeftIcon={IconDeviceFloppy}
            isLoading={buttonsLoading}
          >
            Com ícone
          </Button>
          <Button variant="secondaryOutline" isLoading={buttonsLoading}>
            Contorno
          </Button>
          <Button variant="destructive" isLoading={buttonsLoading}>
            Excluir
          </Button>
          <Button size="sm" isLoading={buttonsLoading}>
            Pequeno
          </Button>
          <Button size="lg" isLoading={buttonsLoading}>
            Grande
          </Button>
          <Button
            size="icon"
            LeftIcon={IconTrash}
            aria-label="Excluir"
            isLoading={buttonsLoading}
          />
          <Button disabled>Desabilitado</Button>
        </div>
        <Button onClick={handleSave} isLoading={saving}>
          Salvar (1,5 s)
        </Button>
      </Section>

      <Section
        title="Esqueleto"
        description="Visível no fundo da página e no cartão; entra com atraso de 150 ms e pulsa suave."
      >
        <Button
          variant="secondaryOutline"
          size="sm"
          onClick={() => setSkeletonKey((key) => key + 1)}
        >
          Recarregar esqueletos
        </Button>
        <div key={skeletonKey} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Card className="p-6 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        </div>
      </Section>

      <Section
        title="Listagem"
        description="Primeira carga: cabeçalho real e linhas de esqueleto. Troca de página: dados anteriores esmaecidos com barra fina até os novos chegarem."
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondaryOutline"
            size="sm"
            onClick={() => loadTable(1, true)}
          >
            Primeira carga
          </Button>
          <Button
            variant="secondaryOutline"
            size="sm"
            onClick={() => loadTable(page === 1 ? 2 : 1)}
          >
            Ir para a página {page === 1 ? 2 : 1}
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <FetchingRegion isFetching={tableState === 'fetching'}>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Cliente</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableState === 'loading' ? (
                    <TableSkeletonRows cols={3} rows={4} />
                  ) : (
                    ROWS.map(([name, group, status]) => (
                      <TableRow key={name}>
                        <TableCell className="font-semibold">
                          {name} {page > 1 ? `(página ${page})` : ''}
                        </TableCell>
                        <TableCell>{group}</TableCell>
                        <TableCell>{status}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </FetchingRegion>
          </CardContent>
        </Card>
        <Card>
          <ListSkeleton cols={3} rows={3} filters={2} />
        </Card>
      </Section>

      <Section
        title="Modais e painéis"
        description="Modal com zoom do centro (200 ms) e saída mais rápida (150 ms); painel lateral em 300 ms. A confirmação fica aberta com o botão em progresso até a ação terminar."
      >
        <div className="flex flex-wrap gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondaryOutline">Abrir modal</Button>
            </DialogTrigger>
            <DialogContent className="p-6">
              <DialogHeader>
                <DialogTitle>Modal</DialogTitle>
                <DialogDescription>
                  Entra do centro, sem deslizar.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Button
            variant="secondaryOutline"
            onClick={() =>
              openAlertDialog({
                title: 'Excluir registro',
                description: 'A exclusão leva 1,5 s nesta demonstração.',
                confirmLabel: 'Excluir',
                cancelLabel: 'Cancelar',
                iconTone: 'error',
                confirmVariant: 'error',
                toastMsg: { success: 'Registro excluído' },
                onConfirm: async () => {
                  await wait(1500)
                },
              })
            }
          >
            Confirmar exclusão
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondaryOutline">Abrir painel</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Painel lateral</SheetTitle>
                <SheetDescription>300 ms para entrar.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </Section>

      <Section
        title="Abas"
        description="O conteúdo da aba nova entra com fade."
      >
        <Tabs defaultValue="dados">
          <TabsList>
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="enderecos">Endereços</TabsTrigger>
          </TabsList>
          <TabsContent value="dados">
            <Card className="p-6 text-gray-700">Conteúdo de Dados.</Card>
          </TabsContent>
          <TabsContent value="enderecos">
            <Card className="p-6 text-gray-700">Conteúdo de Endereços.</Card>
          </TabsContent>
        </Tabs>
      </Section>

      <Section
        title="Troca de página"
        description="A barra no topo só aparece se a troca passar de 150 ms."
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondaryOutline"
            onClick={() => router.push(`?troca=${Date.now()}`)}
          >
            Troca rápida
          </Button>
          <Button
            variant="secondaryOutline"
            onClick={async () => {
              // Simula a página nova demorando 1,5 s para chegar
              startNavigationProgress()
              await wait(1500)
              router.push(`?troca=${Date.now()}`)
            }}
          >
            Troca lenta (1,5 s)
          </Button>
        </div>
      </Section>
    </div>
  )
}
