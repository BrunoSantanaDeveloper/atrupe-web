// Vitrine dos papéis tipográficos — design/openspec/changes/tipografia-e-hierarquia
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableGroupRow,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Heading, Text } from '@/components/ui/typography'
import { TYPOGRAPHY_ROLES, type TypographyRole } from '@/lib/typography-roles'

export const metadata = { title: 'Tipografia · Sandbox' }

const SAMPLE: Record<TypographyRole, string> = {
  'page-title': 'Orçamentos',
  'page-subtitle': 'Propostas enviadas e em digitação',
  'section-title': 'Condições de pagamento',
  'card-title': 'Resumo do mês',
  'dialog-title': 'Novo cliente',
  'object-title': 'Orçamento #1234',
  'kpi-value': 'R$ 48.230,00',
  'kpi-hero': 'R$ 312.904,50',
  'kpi-label': 'Faturamento no período',
  body: 'Texto corrido, células de tabela e descrições.',
  'body-strong': 'Gráfica Exemplo Ltda.',
  secondary: 'contato@exemplo.com.br',
  caption: 'Atualizado às 14:32',
  label: 'Nome da empresa',
  helper: 'Aparece no cabeçalho dos documentos.',
  eyebrow: 'Setor de impressão',
  'table-header': 'Valor',
  'nav-item': 'Fluxo financeiro',
  'nav-group': 'Operação',
}

export default function TipografiaSandbox() {
  const roles = Object.entries(TYPOGRAPHY_ROLES) as [
    TypographyRole,
    (typeof TYPOGRAPHY_ROLES)[TypographyRole],
  ][]

  return (
    <main className="min-h-screen space-y-8 bg-gray-100 p-6">
      <header className="space-y-1">
        <Heading as="h1">Papéis tipográficos</Heading>
        <Text variant="page-subtitle">
          Cada texto da interface pertence a um destes papéis.
        </Text>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Escala</CardTitle>
          <CardDescription>
            Nome do papel, medida e exemplo. Use a classe `type-&lt;papel&gt;`
            ou os componentes `Heading` e `Text`.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <dl className="divide-y divide-gray-200">
            {roles.map(([name, spec]) => (
              <div
                key={name}
                className="grid grid-cols-[180px_160px_1fr] items-baseline gap-4 py-3"
              >
                <dt className="type-body-strong">{name}</dt>
                <dd className="type-caption tabular-nums">
                  {spec.size} · {spec.weight}
                </dd>
                <dd className={`type-${name}`}>{SAMPLE[name]}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <Heading as="h2">Em contexto</Heading>
        <div className="grid grid-cols-4 gap-4">
          {[
            ['Faturamento', 'R$ 48.230,00'],
            ['Orçamentos aprovados', '37'],
            ['Ticket médio', 'R$ 1.303,51'],
            ['Em aberto', 'R$ 9.870,00'],
          ].map(([label, value]) => (
            <Card key={label} className="space-y-1 p-5">
              <Text variant="kpi-label">{label}</Text>
              <Text variant="kpi-value">{value}</Text>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Últimos orçamentos</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead numeric>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableGroupRow>Outubro de 2026</TableGroupRow>
              {[
                [
                  'Gráfica Exemplo Ltda.',
                  'contato@exemplo.com.br',
                  'R$ 1.250,00',
                ],
                [
                  'Comunicação Visual Sul',
                  'compras@cvsul.com.br',
                  'R$ 12.480,90',
                ],
              ].map(([name, email, value]) => (
                <TableRow key={name}>
                  <TableCell>
                    <Text variant="body-strong">{name}</Text>
                    <Text variant="secondary">{email}</Text>
                  </TableCell>
                  <TableCell>
                    <Badge status variant="successLight">
                      Aprovado
                    </Badge>
                  </TableCell>
                  <TableCell numeric>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Árvore sem cabeçalho</CardTitle>
            <CardDescription>
              Como o plano de contas: a linha de grupo mede as colunas pelas
              linhas de dado.
            </CardDescription>
          </CardHeader>
          <Table data-testid="tabela-sem-cabecalho">
            <TableBody>
              <TableGroupRow>Receitas</TableGroupRow>
              <TableRow>
                <TableCell className="type-body-strong pl-10">
                  1.1 Vendas
                </TableCell>
                <TableCell numeric>R$ 48.230,00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </section>
    </main>
  )
}
