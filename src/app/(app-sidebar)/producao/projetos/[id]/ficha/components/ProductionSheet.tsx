'use client'

// A ficha de produção (GP-7, GP-19), como a do legado: o cabeçalho da ordem
// e, por item, cada etapa como "SETOR – ETAPA", com medida, os campos da
// venda, o consumo e a observação — sem valores. Os acabamentos vêm
// recuados embaixo da base. Feita para imprimir.

// UI
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// Components
import { Topbar } from '@/components/common/Topbar'
import { SectorIcon } from '@/components/common/SectorIcon'
import { duration } from '../../../../gerenciador/components/TaskDetailDialog'

// Actions
import { getProject } from '@/actions/production-manager'

// Third-party
import { useQuery } from '@tanstack/react-query'

// Icons
import { IconPrinter } from '@tabler/icons-react'

// Utils
import { cn } from '@/lib/utils'

const num = (value: number) =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 3 })

const date = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')

export function ProductionSheet({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['production-project', id],
    queryFn: () => getProject({ id }),
  })
  const detail = data?.data
  // Topbar já na tela; abaixo, a forma da folha
  if (isLoading || !detail)
    return (
      <div className="space-y-5">
        <Topbar
          title="Ficha de produção"
          previousPage={`/producao/projetos/${id}`}
        />
        <div className="mx-auto max-w-[820px] space-y-4 rounded-xl border border-gray-200 bg-white p-8">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    )

  const { project, tasks } = detail
  const items = Array.from(new Set(tasks.map((task) => task.itemName)))

  return (
    <div className="space-y-5">
      <div className="print:hidden">
        <Topbar
          review="new"
          title="Ficha de produção"
          previousPage={`/producao/projetos/${id}`}
          supportText={`${project.number} · ${project.client}`}
          primaryCta={
            <Button LeftIcon={IconPrinter} onClick={() => window.print()}>
              Imprimir
            </Button>
          }
        />
      </div>

      <div className="mx-auto max-w-[820px] rounded-xl border border-gray-200 bg-white p-8 text-sm print:max-w-none print:border-0 print:p-0">
        <div className="flex items-start justify-between gap-6 border-b border-gray-300 pb-4">
          <div>
            <p className="type-eyebrow">Ficha de produção</p>
            <p className="text-xl font-semibold text-gray-900">
              Ordem {project.number}
            </p>
            <p className="text-gray-700">{project.client}</p>
          </div>
          <div className="space-y-1 text-right text-gray-700">
            <p>Vendedor: {project.seller}</p>
            <p>Entrega: {project.deliveryType}</p>
            <p className="font-medium text-gray-900">
              Prazo: {date(project.due)}
            </p>
          </div>
        </div>

        {items.map((item, index) => (
          <div
            key={item}
            className="border-b border-gray-200 py-4 last:border-0"
          >
            <p className="mb-3 bg-gray-100 px-2 py-1 font-semibold text-gray-900 print:bg-gray-100">
              {index + 1}. {item}
            </p>
            {tasks
              .filter((task) => task.itemName === item)
              .map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'mb-3',
                    task.baseTaskId && 'ml-6 border-l-2 border-gray-300 pl-3',
                  )}
                >
                  {/* O setor na cor dele, também no papel (área 9 §4.14) */}
                  <p className="type-eyebrow flex items-center gap-2">
                    <SectorIcon name={task.sector} size="sm" />
                    {task.sector} – {task.stageName}
                    <span className="ml-2 font-mono text-xs font-normal text-gray">
                      #{task.code}
                    </span>
                    {task.completedBy && (
                      <span className="ml-2 text-xs font-normal normal-case text-gray">
                        concluída por {task.completedBy}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-700">
                    {task.measureText}
                    {task.fields.length ? ` · ${task.fields.join(' · ')}` : ''}
                    {task.estimatedMinutes
                      ? ` · tempo previsto ${duration(task.estimatedMinutes)}`
                      : ''}
                  </p>
                  <table className="mt-1 w-full">
                    <tbody>
                      {task.consumption.map((line, lineIndex) => (
                        <tr key={lineIndex} className="text-gray-700">
                          <td className="w-[110px] py-0.5 pr-3 text-right italic text-gray">
                            {line.quantity === null
                              ? '-'
                              : line.unit === 'min'
                                ? duration(line.quantity)
                                : `${num(line.quantity)} ${line.unit}`}
                          </td>
                          <td className="py-0.5">{line.resource}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {task.note && (
                    <p className="mt-1 font-medium text-gray-900">
                      Observação de produção: {task.note}
                    </p>
                  )}
                  {task.attachments.length > 0 && (
                    <p className="mt-1 text-xs text-gray">
                      Anexos:{' '}
                      {task.attachments
                        .map((attachment) => {
                          const current = attachment.versions.find(
                            (version) => version.current,
                          )
                          return `${attachment.name}${current ? ` v${current.version}` : ''}`
                        })
                        .join(' · ')}
                    </p>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}
