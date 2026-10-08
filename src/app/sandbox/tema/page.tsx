'use client'

// Vitrine do tema claro/escuro — design/openspec/changes/tema-claro-escuro
import { useState } from 'react'
import { toast } from 'sonner'

// UI
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

// Components
import { ThemeToggleGroup } from '@/components/layout/ThemeToggleGroup'

const GRAY_SWATCHES = [
  'bg-gray-25',
  'bg-gray-50',
  'bg-gray-100',
  'bg-gray-200',
  'bg-gray-300',
  'bg-gray-400',
  'bg-gray-500',
  'bg-gray-600',
  'bg-gray-700',
  'bg-gray-800',
  'bg-gray-900',
]
// Classes escritas por extenso: o Tailwind não gera classes montadas em tempo de execução
const COLOR_SWATCHES = [
  [
    'bg-brand-25',
    'bg-brand-50',
    'bg-brand-100',
    'bg-brand-200',
    'bg-brand-300',
    'bg-brand-400',
    'bg-brand-500',
    'bg-brand-600',
    'bg-brand-700',
    'bg-brand-800',
    'bg-brand-900',
  ],
  [
    'bg-error-25',
    'bg-error-50',
    'bg-error-100',
    'bg-error-200',
    'bg-error-300',
    'bg-error-400',
    'bg-error-500',
    'bg-error-600',
    'bg-error-700',
    'bg-error-800',
    'bg-error-900',
  ],
  [
    'bg-warning-25',
    'bg-warning-50',
    'bg-warning-100',
    'bg-warning-200',
    'bg-warning-300',
    'bg-warning-400',
    'bg-warning-500',
    'bg-warning-600',
    'bg-warning-700',
    'bg-warning-800',
    'bg-warning-900',
  ],
  [
    'bg-success-25',
    'bg-success-50',
    'bg-success-100',
    'bg-success-200',
    'bg-success-300',
    'bg-success-400',
    'bg-success-500',
    'bg-success-600',
    'bg-success-700',
    'bg-success-800',
    'bg-success-900',
  ],
  [
    'bg-blue-25',
    'bg-blue-50',
    'bg-blue-100',
    'bg-blue-200',
    'bg-blue-300',
    'bg-blue-400',
    'bg-blue-500',
    'bg-blue-600',
    'bg-blue-700',
    'bg-blue-800',
    'bg-blue-900',
  ],
]

const BUTTON_VARIANTS = [
  'primary',
  'default',
  'primaryOutline',
  'outline',
  'light',
  'ghost',
  'success',
  'warning',
  'error',
  'neutral',
  'neutralOutline',
  'neutralLight',
] as const

const BADGE_VARIANTS = [
  'default',
  'light',
  'outline',
  'successLight',
  'warningLight',
  'errorLight',
  'neutralLight',
] as const

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

function Swatch({ label, style }: { label: string; style: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-10 w-14 rounded-md border border-gray-200 ${style}`} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}

export default function TemaSandbox() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Tema</h1>
          <p className="text-gray-600">
            Tokens e componentes no tema claro e no escuro.
          </p>
        </div>
        <ThemeToggleGroup />
      </div>

      <Section title="Superfícies e neutros">
        <div className="flex flex-wrap gap-3">
          <Swatch label="white" style="bg-white" />
          {GRAY_SWATCHES.map((style) => (
            <Swatch key={style} label={style.slice(3)} style={style} />
          ))}
        </div>
      </Section>

      <Section title="Hierarquia de texto">
        <Card className="p-6 space-y-1">
          <p className="text-gray-900">Texto principal (gray-900)</p>
          <p className="text-gray-700">Texto secundário (gray-700)</p>
          <p className="text-gray-600">Texto terciário (gray-600)</p>
          <p className="text-gray-500">Texto de apoio (gray-500)</p>
          <p className="text-gray-400">Texto de exemplo (gray-400)</p>
          <p className="text-brand-600">Link (brand-600)</p>
          <p className="text-error-600">Erro (error-600)</p>
        </Card>
      </Section>

      <Section title="Escalas coloridas">
        <div className="space-y-3">
          {COLOR_SWATCHES.map((row) => (
            <div key={row[0]} className="flex flex-wrap gap-3">
              {row.map((style) => (
                <Swatch key={style} label={style.slice(3)} style={style} />
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Botões">
        <div className="flex flex-wrap gap-3">
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
          <Button variant="primary" disabled>
            desabilitado
          </Button>
        </div>
      </Section>

      <Section title="Etiquetas">
        <div className="flex flex-wrap gap-3">
          {BADGE_VARIANTS.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Formulário">
        <Card className="p-6 grid gap-4 md:grid-cols-2">
          <Input placeholder="Texto de exemplo" />
          <Input defaultValue="Valor preenchido" />
          <Textarea placeholder="Observações" />
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Checkbox defaultChecked /> Marcado
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Switch defaultChecked /> Ligado
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <Switch /> Desligado
            </label>
          </div>
        </Card>
      </Section>

      <Section title="Avisos">
        <div className="grid gap-3 md:grid-cols-3">
          <Alert>
            <AlertTitle>Padrão</AlertTitle>
            <AlertDescription>Mensagem informativa.</AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>Algo precisa de revisão.</AlertDescription>
          </Alert>
          <Alert variant="error">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>Não foi possível salvar.</AlertDescription>
          </Alert>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="neutralOutline" onClick={() => toast('Aviso')}>
            Aviso simples
          </Button>
          <Button
            variant="neutralOutline"
            onClick={() => toast.success('Orçamento salvo')}
          >
            Aviso de sucesso
          </Button>
          <Button
            variant="neutralOutline"
            onClick={() => toast.error('Falha ao salvar')}
          >
            Aviso de erro
          </Button>
        </div>
      </Section>

      <Section title="Tabela">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Gráfica Exemplo</TableCell>
                <TableCell>
                  <Badge variant="successLight">Aprovado</Badge>
                </TableCell>
                <TableCell className="text-right">R$ 1.250,00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Comunicação Visual Ltda</TableCell>
                <TableCell>
                  <Badge variant="warningLight">Pendente</Badge>
                </TableCell>
                <TableCell className="text-right">R$ 870,40</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </Section>

      <Section title="Camadas">
        <div className="flex flex-wrap items-start gap-6">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="primary">Abrir modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modal</DialogTitle>
                <DialogDescription>
                  Conteúdo sobre a camada escura.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="neutralOutline">Abrir menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              <DropdownMenuItem>Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Card>
            <CardHeader>
              <CardTitle>Calendário</CardTitle>
              <CardDescription>Dia selecionado em destaque.</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </CardContent>
          </Card>
          <div className="space-y-2">
            <p className="text-sm text-gray-700">Campo de data nativo</p>
            <input
              type="date"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            />
          </div>
        </div>
      </Section>
    </div>
  )
}
