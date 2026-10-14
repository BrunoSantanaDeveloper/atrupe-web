import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FileEdit, Calendar, Hash } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { getItem } from '@/actions/_cruds'
import { NfeCorrectionEvent } from '@/types/fiscal/nfe'

interface CorrectionHistorySectionProps {
  nfeId: string
  status: string
}

export function CorrectionHistorySection({
  nfeId,
  status,
}: CorrectionHistorySectionProps) {
  // Apenas busca o histórico se o status permitir
  const { data: corrections = [], isLoading } = useQuery<NfeCorrectionEvent[]>({
    queryKey: ['nfe-corrections', nfeId],
    queryFn: async () => {
      const result = await getItem({
        route: `/fiscal/nfe/${nfeId}/corrections`,
      })
      if (!result.success) throw new Error(result.message)
      return result.data || []
    },
    enabled: !!nfeId && ['AUTHORIZED', 'CORRECTION_SENT'].includes(status),
  })

  if (
    !['AUTHORIZED', 'CORRECTION_SENT'].includes(status) ||
    (!isLoading && corrections.length === 0)
  ) {
    return null
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 backdrop-blur-sm overflow-hidden mb-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="history" className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileEdit className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-foreground">
                  Cartas de Correção (CC-e)
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  {isLoading
                    ? 'Carregando...'
                    : `${corrections.length} evento(s) de correção`}
                </span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-1">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <span className="text-sm text-muted-foreground">
                  Buscando histórico...
                </span>
              </div>
            ) : (
              <div className="space-y-4 mt-2">
                {corrections.map((event) => (
                  <div
                    key={event.id}
                    className="relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-[-24px] before:w-px before:bg-border last:before:hidden"
                  >
                    <div className="absolute left-1 top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-background" />
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                          <Hash className="w-3 h-3 text-muted-foreground" />
                          Sequência {event.sequenciaEvento}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {event.dataEvento
                            ? format(
                                new Date(event.dataEvento),
                                "dd/MM/yyyy 'às' HH:mm",
                                { locale: ptBR },
                              )
                            : format(
                                new Date(event.createdAt),
                                "dd/MM/yyyy 'às' HH:mm",
                                { locale: ptBR },
                              )}
                        </div>
                      </div>

                      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                        <span className="type-eyebrow block mb-1">
                          Texto da Correção
                        </span>
                        {event.correcao}
                      </div>

                      {event.protocolo && (
                        <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Protocolo:
                          </span>
                          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
                            {event.protocolo}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
