'use client'

// A locação no gerenciador de produção do ELITE (16/11/2026): a impressão, a
// instalação e a retirada viram tarefas, e a foto da veiculação é exigida
// para concluir a instalação e vai para o cliente (LC-11). A manutenção do
// bem tira o bem da reserva.

import { useState } from 'react'
import { IconCamera, IconCheck, IconSend, IconTool } from '@tabler/icons-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { addDays, formatDate, today, type RentalProduct } from '../data'
import type { RentalDraft } from './RentalQuotationItem'

export function RentalProduction({
  product,
  draft,
}: {
  product: RentalProduct
  draft: RentalDraft
}) {
  const [photo, setPhoto] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [sent, setSent] = useState(false)

  const start = draft.start || today()
  const end = draft.end || addDays(start, 13)
  const isMedia = product.mode !== 'QUANTITY'

  const tasks = isMedia
    ? [
        {
          name: 'Impressão do material',
          sector: 'Impressão',
          date: addDays(start, -2),
        },
        { name: 'Instalação no ponto', sector: 'Instalação', date: start },
        { name: 'Retirada do material', sector: 'Instalação', date: end },
      ]
    : [
        {
          name: 'Separação das peças',
          sector: 'Expedição',
          date: addDays(start, -1),
        },
        { name: 'Entrega e montagem', sector: 'Instalação', date: start },
        { name: 'Desmontagem e conferência', sector: 'Instalação', date: end },
      ]

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tarefas da locação</CardTitle>
          <CardDescription>
            {product.name}. O orçamento aprovado gera as tarefas com as datas do
            período, cada uma no setor dela, com equipe e veículo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-6 pb-6">
          {tasks.map((task, index) => (
            <div
              key={task.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {task.name}
                </p>
                <p className="text-sm text-gray">
                  {task.sector} · {formatDate(task.date)}
                </p>
              </div>
              {index === 1 && installed ? (
                <Badge variant="successLight">Concluída</Badge>
              ) : (
                <Badge variant="neutralLight">A fazer</Badge>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              {isMedia ? 'Comprovação de veiculação' : 'Conferência das peças'}
            </CardTitle>
            <CardDescription>
              {isMedia
                ? 'A instalação só conclui com a foto do material no ponto. A foto vai para o cliente.'
                : 'A entrega só conclui com a foto da montagem e a conferência das quantidades.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="neutralOutline"
                LeftIcon={IconCamera}
                disabled={photo}
                onClick={() => setPhoto(true)}
              >
                {photo ? 'Foto anexada' : 'Anexar a foto'}
              </Button>
              <Button
                type="button"
                LeftIcon={IconCheck}
                disabled={!photo || installed}
                onClick={() => setInstalled(true)}
              >
                Concluir a instalação
              </Button>
              <Button
                type="button"
                variant="neutralOutline"
                LeftIcon={IconSend}
                disabled={!installed || sent}
                onClick={() => {
                  setSent(true)
                  toast.success('Comprovação enviada ao cliente.')
                }}
              >
                {sent ? 'Enviada ao cliente' : 'Enviar ao cliente'}
              </Button>
            </div>
            {!photo && (
              <p className="text-sm text-warning-700">
                Falta a foto: anexe para poder concluir a instalação.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manutenção do bem</CardTitle>
            <CardDescription>
              A tarefa de manutenção tira o bem da reserva no período, como uma
              locação: ninguém vende o painel parado para conserto.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <IconTool className="size-5 text-gray" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Troca dos refletores
                </p>
                <p className="text-sm text-gray">
                  {formatDate(addDays(end, 1))} a {formatDate(addDays(end, 2))}{' '}
                  · bem indisponível para reserva
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
