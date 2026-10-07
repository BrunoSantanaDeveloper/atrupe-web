'use client'

import { useMemo, useState } from 'react'
import { useRouter } from '@/hooks/useRouter'
import { IconAlertTriangle, IconRotate } from '@tabler/icons-react'
import { Save } from 'lucide-react'
import { toast } from 'sonner'

import {
  updateIcmsAliquotas,
  type IcmsAliquotaInterna,
} from '@/actions/systemSettings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/** Percentual em texto; vazio significa "sem valor", diferente de zero. */
function paraNumero(valor: string): number | null {
  const limpo = valor.trim().replace(',', '.')
  if (!limpo) return null
  const n = Number(limpo)
  return Number.isFinite(n) ? n : null
}

export function IcmsAliquotasForm({
  initialData,
}: {
  initialData: IcmsAliquotaInterna[]
}) {
  const router = useRouter()
  const [linhas, setLinhas] = useState<IcmsAliquotaInterna[]>(initialData)
  const [edicoes, setEdicoes] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const naoRevisadas = useMemo(
    () => linhas.filter((l) => !l.revisado).length,
    [linhas],
  )

  const alterou = Object.keys(edicoes).length > 0

  function valorExibido(linha: IcmsAliquotaInterna) {
    return edicoes[linha.uf] ?? String(linha.aliquota)
  }

  function editar(uf: string, valor: string) {
    setEdicoes((e) => ({ ...e, [uf]: valor }))
  }

  /** Volta a UF ao padrão do sistema: o backend interpreta null como "remover o ajuste". */
  function restaurarPadrao(uf: string) {
    setEdicoes((e) => ({ ...e, [uf]: '' }))
  }

  async function salvar() {
    // Só as UFs tocadas vão no corpo — enviar todas transformaria cada padrão
    // em ajuste manual, e a coluna "origem" deixaria de significar algo.
    const aliquotas: Record<string, number | null> = {}
    for (const [uf, texto] of Object.entries(edicoes)) {
      aliquotas[uf] = paraNumero(texto)
    }

    const invalidas = Object.entries(aliquotas).filter(
      ([, v]) => v !== null && (v < 0 || v > 100),
    )
    if (invalidas.length > 0) {
      toast.error(
        `Alíquota fora de 0 a 100 em: ${invalidas.map(([uf]) => uf).join(', ')}`,
      )
      return
    }

    setIsSaving(true)
    const toastId = toast.loading('Salvando alíquotas...')
    try {
      const res = await updateIcmsAliquotas(aliquotas)
      if (!res.success || !res.data) {
        toast.error(res.message, { id: toastId })
        return
      }
      setLinhas(res.data)
      setEdicoes({})
      toast.success('Alíquotas internas atualizadas.', { id: toastId })
      router.refresh()
    } catch {
      toast.error('Não foi possível atualizar as alíquotas.', { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <IconAlertTriangle className="size-5 text-brand-600" />
          <CardTitle>Alíquota interna de ICMS por UF</CardTitle>
        </div>
        <CardDescription>
          Usada no cálculo do Regime Normal: DIFAL, substituição tributária e a
          alíquota interna do destino no ajuste da MVA. Alterar aqui afeta todas
          as empresas.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="p-6 space-y-4">
        {naoRevisadas > 0 && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <strong>{naoRevisadas}</strong> de {linhas.length} alíquotas ainda
            não foram conferidas na legislação estadual. Elas já são usadas no
            cálculo — convém revisá-las com a contabilidade antes de liberar o
            Regime Normal para novas empresas.
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">UF</TableHead>
              <TableHead className="w-40">Alíquota (%)</TableHead>
              <TableHead>Procedência</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {linhas.map((linha) => {
              const tocada = edicoes[linha.uf] !== undefined
              return (
                <TableRow key={linha.uf}>
                  <TableCell className="font-medium">{linha.uf}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={valorExibido(linha)}
                      placeholder="padrão"
                      onChange={(e) => editar(linha.uf, e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    {linha.origem === 'ajustado' ? (
                      <Badge variant="successLight">Ajustada</Badge>
                    ) : linha.revisado ? (
                      <Badge variant="successLight">Padrão conferido</Badge>
                    ) : (
                      <Badge variant="warningLight">Padrão sem conferir</Badge>
                    )}
                    {tocada && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        alterada, não salva
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {linha.origem === 'ajustado' && (
                      <Button
                        type="button"
                        variant="neutralOutline"
                        size="sm"
                        LeftIcon={IconRotate}
                        onClick={() => restaurarPadrao(linha.uf)}
                      >
                        Padrão
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="flex justify-end">
          <Button
            type="button"
            RightIcon={Save}
            disabled={!alterou || isSaving}
            isLoading={isSaving}
            onClick={salvar}
          >
            Salvar alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
