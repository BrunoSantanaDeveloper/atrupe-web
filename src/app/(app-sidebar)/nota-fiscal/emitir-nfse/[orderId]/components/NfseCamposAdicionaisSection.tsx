'use client'

// React
import { useEffect, useState } from 'react'

// UI
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buttonVariants } from '@/components/ui/button'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import { cn } from '@/lib/utils'

// Icons
import { IconAdjustments } from '@tabler/icons-react'

/**
 * Campos adicionais da emissão de NFS-e — indicadores da Reforma Tributária,
 * tributos aproximados e INSS. Nomes e semântica conforme o layout
 * Layout_Recepcao_NFSe_Reforma_Tributaria v8 do InvoiCy.
 *
 * Todos opcionais: vazio omite o campo do payload e a nota sai como antes.
 * Sentinela 'none' nos selects — o Radix reserva '' para limpar a seleção.
 */
export interface NfseCamposAdicionais {
  cIndOp?: string
  indFinal?: number
  indDest?: number
  tpEnteGov?: number
  tpOper?: number
  tribAproxFederal?: number
  tribAproxEstadual?: number
  tribAproxMunicipal?: number
  aliquotaInss?: number
  valorInss?: number
}

const IND_FINAL_OPTIONS = [
  { value: 'none', label: 'Não informar' },
  { value: '0', label: 'Não' },
  { value: '1', label: 'Sim' },
]

const IND_DEST_OPTIONS = [
  { value: 'none', label: 'Não informar' },
  { value: '0', label: '0 — O tomador é o adquirente e destinatário' },
  { value: '1', label: '1 — Destinatário diverso do tomador/adquirente' },
]

// Só 1..4: o layout do InvoiCy (v4 e v8) não tem "9 — Outro"; ele e o
// xTpEnteGov são de uso específico do padrão IPM de prefeitura, que nenhum
// emissor da base usa. O backend continua aceitando o 9 por compatibilidade.
const TP_ENTE_GOV_OPTIONS = [
  { value: 'none', label: 'Nenhum' },
  { value: '1', label: '1 — União' },
  { value: '2', label: '2 — Estado' },
  { value: '3', label: '3 — Distrito Federal' },
  { value: '4', label: '4 — Município' },
]

// Redação idêntica à do InvoiCy Web, que é a que o cliente conhece.
const TP_OPER_OPTIONS = [
  { value: 'none', label: 'Nenhum' },
  { value: '1', label: '1 – Fornecimento com pagamento posterior' },
  {
    value: '2',
    label: '2 – Recebimento do pagamento com fornecimento já realizado',
  },
  { value: '3', label: '3 – Fornecimento com pagamento já realizado' },
  {
    value: '4',
    label: '4 – Recebimento do pagamento com fornecimento posterior',
  },
  {
    value: '5',
    label: '5 – Fornecimento e recebimento do pagamento concomitantes',
  },
]

interface Props {
  valores: NfseCamposAdicionais
  onChange: (valores: NfseCamposAdicionais) => void
  /**
   * Serviço escolhido sem CST ou sem Classificação Tributária IBS/CBS. O
   * grupo IBSCBS da DPS é tudo ou nada: sem os dois, o backend descarta os
   * indicadores abaixo em vez de gerar um grupo incompleto, que a prefeitura
   * recusa (E1235). O descarte é silencioso no payload, então quem preencheu
   * precisa ver aqui que aquilo não vai sair na nota.
   */
  servicoSemIbsCbs?: boolean
  /**
   * Serviço com CST IBS/CBS e sem Indicador de Operação resolvido (nem aqui,
   * nem no padrão do emissor). Declarado o grupo, a prefeitura exige o cIndOp
   * — recusa E0860 — e a emissão fica bloqueada até preencher.
   */
  cIndOpObrigatorio?: boolean
}

// Só os campos que moram no grupo IBSCBS. Tributos aproximados e INSS saem
// em Valores e não dependem do CST.
const CAMPOS_DO_GRUPO_IBSCBS: (keyof NfseCamposAdicionais)[] = [
  'cIndOp',
  'indFinal',
  'indDest',
  'tpEnteGov',
  'tpOper',
]

export function NfseCamposAdicionaisSection({
  valores,
  onChange,
  servicoSemIbsCbs = false,
  cIndOpObrigatorio = false,
}: Props) {
  const indicadoresPreenchidos = CAMPOS_DO_GRUPO_IBSCBS.some(
    (campo) => valores[campo] !== undefined && valores[campo] !== '',
  )
  const avisarDescarte = servicoSemIbsCbs && indicadoresPreenchidos

  // O bloco é fechado por padrão. Quando o Indicador de Operação vira
  // obrigatório, deixá-lo escondido seria pedir um campo que não se vê.
  const [aberto, setAberto] = useState<string>('')
  useEffect(() => {
    if (cIndOpObrigatorio) setAberto('campos-adicionais')
  }, [cIndOpObrigatorio])

  const setCampo = <K extends keyof NfseCamposAdicionais>(
    campo: K,
    valor: NfseCamposAdicionais[K],
  ) => onChange({ ...valores, [campo]: valor })

  const selectNumerico = (campo: keyof NfseCamposAdicionais, raw: string) => {
    setCampo(campo, raw === 'none' ? undefined : Number(raw))
  }

  const numeroOuUndefined = (raw: string) => {
    if (raw.trim() === '') return undefined
    const n = Number(raw.replace(',', '.'))
    return Number.isFinite(n) ? n : undefined
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden">
      {/* Fechado por padrão: são campos que a maioria das emissões não usa. */}
      <Accordion
        type="single"
        collapsible
        value={aberto}
        onValueChange={setAberto}
      >
        <AccordionItem value="campos-adicionais" className="p-0 m-0 border-0">
          <CardHeader className="flex flex-row items-center justify-between py-4 bg-white border-b border-gray-100">
            <div className="flex gap-3 items-center">
              <FeaturedIcon variant="neutralOutline" Icon={IconAdjustments} />
              <div>
                <CardTitle className="text-gray-700 font-semibold text-base">
                  Campos adicionais
                </CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Indicadores da Reforma Tributária, tributos aproximados e INSS
                  — opcionais
                </p>
              </div>
            </div>
            <AccordionTrigger
              className={cn(
                buttonVariants({ variant: 'neutralLight', size: 'icon' }),
                'mr-0 [&>svg]:text-gray [&>svg]:size-5',
              )}
            />
          </CardHeader>
          {cIndOpObrigatorio && (
            <div className="px-6 py-3 bg-error-50 border-b border-error-200">
              <p className="text-xs text-error-700">
                O serviço escolhido tem CST IBS/CBS, então o{' '}
                <strong>Indicador de Operação é obrigatório</strong> — sem ele a
                prefeitura recusa a nota (E0860). Preencha abaixo ou cadastre um
                padrão em Configurações &gt; Nota Fiscal &gt; Reforma
                Tributária.
              </p>
            </div>
          )}
          {avisarDescarte && (
            <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
              <p className="text-xs text-amber-800">
                Os indicadores da Reforma preenchidos aqui{' '}
                <strong>não serão enviados</strong>: o serviço escolhido não tem
                CST e Classificação Tributária IBS/CBS. Cadastre os dois em
                Configurações &gt; Lista de Serviços para que eles saiam na
                nota.
              </p>
            </div>
          )}
          <AccordionContent>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cIndOp">
                    Indicador de Operação
                    {cIndOpObrigatorio && (
                      <span className="text-error-600"> *</span>
                    )}
                  </Label>
                  <Input
                    id="cIndOp"
                    placeholder="Ex: 100301"
                    maxLength={6}
                    value={valores.cIndOp ?? ''}
                    aria-invalid={cIndOpObrigatorio}
                    className={
                      cIndOpObrigatorio
                        ? 'border-error-500 focus-visible:ring-error-500'
                        : undefined
                    }
                    onChange={(e) =>
                      setCampo(
                        'cIndOp',
                        e.target.value.replace(/\D/g, '') || undefined,
                      )
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    Tabela Anexo VII (6 dígitos)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label>Uso ou Consumo Pessoal</Label>
                  <Select
                    value={
                      valores.indFinal !== undefined
                        ? String(valores.indFinal)
                        : 'none'
                    }
                    onValueChange={(v) => selectNumerico('indFinal', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IND_FINAL_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 lg:col-span-2">
                  <Label>Destinatário dos serviços</Label>
                  <Select
                    value={
                      valores.indDest !== undefined
                        ? String(valores.indDest)
                        : 'none'
                    }
                    onValueChange={(v) => selectNumerico('indDest', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {IND_DEST_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* tpOper é o campo "Operação com Entes Governamentais" do
                    InvoiCy Web. Fica sempre visível e independe do ente: o
                    layout o prevê também para serviços sobre bens imóveis. */}
                <div className="space-y-1.5 lg:col-span-2">
                  <Label>Operação com Entes Governamentais</Label>
                  <Select
                    value={
                      valores.tpOper !== undefined
                        ? String(valores.tpOper)
                        : 'none'
                    }
                    onValueChange={(v) => selectNumerico('tpOper', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TP_OPER_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-gray-500">
                    Também usado em serviços sobre bens imóveis (tpOper)
                  </p>
                </div>

                <div className="space-y-1.5 lg:col-span-2">
                  <Label>Ente Governamental</Label>
                  <Select
                    value={
                      valores.tpEnteGov !== undefined
                        ? String(valores.tpEnteGov)
                        : 'none'
                    }
                    onValueChange={(v) => selectNumerico('tpEnteGov', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TP_ENTE_GOV_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-gray-500">
                    Só quando o tomador é administração pública direta,
                    autarquia ou fundação (tpEnteGov)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                {(
                  [
                    ['tribAproxFederal', 'Trib. Aprox. Fed (R$)'],
                    ['tribAproxEstadual', 'Trib. Aprox. Est (R$)'],
                    ['tribAproxMunicipal', 'Trib. Aprox. Mun (R$)'],
                    ['aliquotaInss', '% INSS'],
                    ['valorInss', 'Valor INSS (R$)'],
                  ] as const
                ).map(([campo, rotulo]) => (
                  <div key={campo} className="space-y-1.5">
                    <Label htmlFor={campo}>{rotulo}</Label>
                    <Input
                      id={campo}
                      type="number"
                      min="0"
                      step="0.01"
                      value={valores[campo] ?? ''}
                      onChange={(e) =>
                        setCampo(campo, numeroOuUndefined(e.target.value))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
