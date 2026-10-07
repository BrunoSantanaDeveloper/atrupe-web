'use client'

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
  CardContent,
  CardDescription,
} from '@/components/ui/card'

// Components
import { Topbar } from '@/components/common/Topbar'
import { TableSkeletonRows } from '@/components/common/TableSkeleton'

// Actions
import { getProductivity } from '@/actions/production'

// Hooks / Store / Consts
import { cn } from '@/lib/utils'

// Third-party
import { useQuery } from '@tanstack/react-query'

const formatMinutes = (minutes: number) => {
  const hours = Math.floor(minutes / 60)

  return hours
    ? `${hours}h${minutes % 60 ? ` ${minutes % 60}min` : ''}`
    : `${minutes} min`
}

// Eficiência = tempo previsto ÷ tempo realizado. Acima de 100% a equipe fez
// mais rápido que o previsto; abaixo, mais devagar.
const efficiencyLabel = (value: number | null) =>
  value === null ? '-' : `${value.toString().replace('.', ',')}%`

export function Productivity() {
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['productivity'],
    queryFn: () => getProductivity(),
  })

  // Sem retorno antecipado: Topbar e cartões já na tela, e as tabelas com
  // linhas de esqueleto enquanto os números chegam
  const bySector = data?.data?.bySector || []
  const people = data?.data?.people || []

  return (
    <div className="space-y-5">
      <Topbar
        review="new"
        title="Produtividade"
        supportText="Tempo previsto pela composição contra o tempo realizado na produção"
      />

      <Card>
        <CardHeader>
          <CardTitle>Por setor</CardTitle>
          <CardDescription>
            O tempo previsto vem da composição do produto; o realizado vem do
            apontamento das etapas. A diferença mostra onde o planejamento e a
            operação não batem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[680px]">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[28%]">Setor</TableHead>
                <TableHead className="w-[16%] text-right">
                  Etapas concluídas
                </TableHead>
                <TableHead className="w-[18%] text-right">Previsto</TableHead>
                <TableHead className="w-[18%] text-right">Realizado</TableHead>
                <TableHead className="w-[20%] text-right">Eficiência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableSkeletonRows cols={5} rows={4} />
              ) : (
                bySector.map((sector) => (
                  <TableRow key={sector.sector}>
                    <TableCell className="font-medium">
                      {sector.sector}
                    </TableCell>
                    <TableCell className="text-right">
                      {sector.stages}
                    </TableCell>
                    <TableCell className="text-right">
                      {sector.planned ? formatMinutes(sector.planned) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {sector.actual ? formatMinutes(sector.actual) : '-'}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-medium',
                        sector.efficiency !== null &&
                          sector.efficiency < 100 &&
                          'text-error-700',
                      )}
                    >
                      {efficiencyLabel(sector.efficiency)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="text-sm text-gray">
          Eficiência abaixo de 100% significa que a etapa levou mais tempo que o
          previsto. Isso não é erro por si: pode ser tempo mal estimado na
          composição ou dificuldade na execução.
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Por colaborador</CardTitle>
          <CardDescription>
            Mesma comparação, para quem executou a etapa. Serve para achar
            treinamento necessário, não para ranquear pessoas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || people.length ? (
            <Table className="min-w-[680px]">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[28%]">Colaborador</TableHead>
                  <TableHead className="w-[16%] text-right">Etapas</TableHead>
                  <TableHead className="w-[18%] text-right">Previsto</TableHead>
                  <TableHead className="w-[18%] text-right">
                    Realizado
                  </TableHead>
                  <TableHead className="w-[20%] text-right">
                    Eficiência
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableSkeletonRows cols={5} rows={4} />
                ) : (
                  people.map((person) => (
                    <TableRow key={person.assignee}>
                      <TableCell className="font-medium">
                        {person.assignee}
                      </TableCell>
                      <TableCell className="text-right">
                        {person.stages}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMinutes(person.planned)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatMinutes(person.actual)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          person.efficiency !== null &&
                            person.efficiency < 100 &&
                            'text-error-700',
                        )}
                      >
                        {efficiencyLabel(person.efficiency)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-gray">
              Nenhuma etapa concluída com responsável informado ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
