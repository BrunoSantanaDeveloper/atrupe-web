'use client'

// Produtividade pelo tempo vendido (GP-30 a GP-33): o que conta é o tempo
// vendido da tarefa, não o tempo gasto. Quem termina em 30 min um serviço
// vendido por 1 h acumula 1 h. Com mais de uma pessoa, o vendido é
// repartido na proporção do tempo que cada uma trabalhou (GP-32). Por
// pessoa só para quem tem permissão (PCP-3, GP-11): a tela de quem produz
// mostra o trabalho, não o desempenho.

// UI
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { FeaturedIcon } from '@/components/ui/featured-icon'
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
import { SectorIcon } from '@/components/common/SectorIcon'
import { duration } from '../../gerenciador/components/TaskDetailDialog'

// Actions
import { getProductivity } from '@/actions/production-manager'

// Hooks / Store / Consts
import { cn } from '@/lib/utils'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconChartBar, IconUsers } from '@tabler/icons-react'

const percent = (value: number | null) =>
  value === null ? '-' : `${value.toString().replace('.', ',')}%`

export function Productivity() {
  // Por pessoa só para quem tem a permissão: o servidor nem manda (PCP-3)
  const { data, isLoading } = useQuery({
    queryKey: ['productivity'],
    queryFn: () => getProductivity(),
  })

  if (isLoading) return <Skeleton className="h-[calc(100vh-150px)]" />

  const bySector = data?.data?.bySector || []
  const perPerson = !!data?.data?.people
  const people = data?.data?.people || []

  return (
    <div className="space-y-5">
      <Topbar
        review="new"
        title="Produtividade"
        supportText="Tempo vendido pela composição contra o tempo apontado na produção"
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FeaturedIcon variant="neutralOutline" Icon={IconChartBar} />
            <div>
              <CardTitle>Por setor</CardTitle>
              <CardDescription>
                Tarefas finalizadas. O vendido vem da composição; o apontado, do
                relógio. Produtividade = vendido ÷ apontado.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="min-w-[680px]">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[30%]">Setor</TableHead>
                <TableHead className="w-[14%] text-right">Tarefas</TableHead>
                <TableHead className="w-[18%] text-right">Vendido</TableHead>
                <TableHead className="w-[18%] text-right">Apontado</TableHead>
                <TableHead className="w-[20%] text-right">
                  Produtividade
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bySector.map((sector) => (
                <TableRow key={sector.sector}>
                  <TableCell>
                    <span className="flex items-center gap-2 font-medium">
                      <SectorIcon name={sector.sector} size="sm" />
                      {sector.sector}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{sector.tasks}</TableCell>
                  <TableCell className="text-right">
                    {sector.sold ? duration(sector.sold) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {sector.worked ? duration(sector.worked) : '-'}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-medium',
                      sector.productivity !== null &&
                        sector.productivity < 100 &&
                        'text-error-700',
                    )}
                  >
                    {percent(sector.productivity)}
                  </TableCell>
                </TableRow>
              ))}
              {!bySector.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-gray">
                    Nenhuma tarefa finalizada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="text-sm text-gray">
          Abaixo de 100 % a produção levou mais tempo do que foi vendido. Isso
          não é erro por si: pode ser tempo mal estimado na composição ou
          dificuldade na execução. O primeiro número é o diagnóstico; a meta
          nasce dele (GP-33).
        </CardFooter>
      </Card>

      {perPerson ? (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <FeaturedIcon variant="neutralOutline" Icon={IconUsers} />
              <div>
                <CardTitle>Por colaborador</CardTitle>
                <CardDescription>
                  O tempo vendido repartido na proporção do tempo que cada um
                  trabalhou na tarefa. Serve para calibrar a estimativa e a
                  bonificação, não para ranquear pessoas.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {people.length ? (
              <Table className="min-w-[680px]">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-[30%]">Colaborador</TableHead>
                    <TableHead className="w-[14%] text-right">
                      Tarefas
                    </TableHead>
                    <TableHead className="w-[18%] text-right">
                      Vendido
                    </TableHead>
                    <TableHead className="w-[18%] text-right">
                      Apontado
                    </TableHead>
                    <TableHead className="w-[20%] text-right">
                      Produtividade
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {people.map((person) => (
                    <TableRow key={person.collaboratorId}>
                      <TableCell className="font-medium">
                        {person.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {person.tasks}
                      </TableCell>
                      <TableCell className="text-right">
                        {duration(person.sold)}
                      </TableCell>
                      <TableCell className="text-right">
                        {duration(person.worked)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          person.productivity !== null &&
                            person.productivity < 100 &&
                            'text-error-700',
                        )}
                      >
                        {percent(person.productivity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-gray">
                Nenhuma tarefa finalizada com tempo apontado ainda.
              </p>
            )}
          </CardContent>
          <CardFooter className="text-sm text-gray">
            Tempo sem venda (manutenção, limpeza, refação) não entra aqui
            (GP-34).
          </CardFooter>
        </Card>
      ) : (
        <p className="text-sm text-gray">
          A produtividade por pessoa é lida por quem edita a produção (gerente).
        </p>
      )}
    </div>
  )
}
