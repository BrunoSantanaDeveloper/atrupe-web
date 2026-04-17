'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { IconSettings } from '@tabler/icons-react'

interface NfseDadosFiscaisSectionProps {
  codigoServico: string
  aliquotaIss: number
  issRetido: boolean
  discriminacao: string
  onCodigoServicoChange: (value: string) => void
  onAliquotaIssChange: (value: number) => void
  onIssRetidoChange: (value: boolean) => void
  onDiscriminacaoChange: (value: string) => void
}

export function NfseDadosFiscaisSection({
  codigoServico,
  aliquotaIss,
  issRetido,
  discriminacao,
  onCodigoServicoChange,
  onAliquotaIssChange,
  onIssRetidoChange,
  onDiscriminacaoChange,
}: NfseDadosFiscaisSectionProps) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <Accordion type="single" collapsible defaultValue="fiscais">
        <AccordionItem value="fiscais" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconSettings} />
              <CardTitle className="text-gray-700 font-semibold text-base">
                Dados Fiscais do Serviço
              </CardTitle>
            </div>
            <AccordionTrigger
              className={cn(
                buttonVariants({
                  variant: 'neutralLight',
                  size: 'icon',
                }),
                'mr-0 [&>svg]:text-gray [&>svg]:size-5',
              )}
            />
          </CardHeader>
          <AccordionContent>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="codigoServico">Código do Serviço *</Label>
                  <Input
                    id="codigoServico"
                    value={codigoServico}
                    onChange={(e) => onCodigoServicoChange(e.target.value)}
                    placeholder="Ex: 1.01"
                  />
                  <p className="text-xs text-gray-500">
                    Código conforme LC 116/03
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aliquotaIss">Alíquota ISS (%)</Label>
                  <Input
                    id="aliquotaIss"
                    type="number"
                    step="0.01"
                    value={aliquotaIss || ''}
                    onChange={(e) =>
                      onAliquotaIssChange(Number(e.target.value))
                    }
                    placeholder="Ex: 5.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ISS Retido</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={issRetido}
                      onCheckedChange={onIssRetidoChange}
                    />
                    <span className="text-sm text-gray-600">
                      {issRetido ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discriminacao">
                  Discriminação do Serviço *
                </Label>
                <Textarea
                  id="discriminacao"
                  value={discriminacao}
                  onChange={(e) => onDiscriminacaoChange(e.target.value)}
                  placeholder="Descreva detalhadamente os serviços prestados..."
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Esta descrição aparecerá na NFS-e
                </p>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
