'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IconPlus, IconTrash, IconPencil, IconX } from '@tabler/icons-react'

import { deleteItemNew, getData, putItemNew } from '@/actions/_cruds'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/components/ui/use-toast'

/**
 * As 27 unidades federativas. Nao existe lista compartilhada no projeto e so'
 * esta tela precisa dela hoje — quando uma segunda precisar, extrair.
 */
const UFS = [
  'AC',
  'AL',
  'AM',
  'AP',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MG',
  'MS',
  'MT',
  'PA',
  'PB',
  'PE',
  'PI',
  'PR',
  'RJ',
  'RN',
  'RO',
  'RR',
  'RS',
  'SC',
  'SE',
  'SP',
  'TO',
]

export interface StRule {
  ufDestino: string
  mva?: number | null
  aliquotaInterna?: number | null
  reducaoBase?: number | null
  fcpStRate?: number | null
}

type Rascunho = {
  ufDestino: string
  mva: string
  aliquotaInterna: string
  reducaoBase: string
  fcpStRate: string
}

const RASCUNHO_VAZIO: Rascunho = {
  ufDestino: '',
  mva: '',
  aliquotaInterna: '',
  reducaoBase: '',
  fcpStRate: '',
}

/** Campo vazio significa "nao definido", que e' diferente de zero. */
function paraNumero(valor: string): number | undefined {
  const limpo = valor.trim().replace(',', '.')
  if (!limpo) return undefined
  const n = Number(limpo)
  return Number.isFinite(n) ? n : undefined
}

function paraTexto(valor?: number | null): string {
  return valor === null || valor === undefined ? '' : String(valor)
}

const percentual = (valor?: number | null) =>
  valor === null || valor === undefined ? '—' : `${valor}%`

async function buscarRegras(productId: string): Promise<StRule[]> {
  const res = await getData({ route: `/fiscal/product/${productId}/st-rules` })
  // Em falha, getData nao devolve `data`. Sem este erro explicito a tela
  // mostraria "nenhuma regra" — e o usuario emitiria acreditando que o produto
  // nao tem ST em nenhuma UF.
  if (!res?.success) {
    throw new Error(
      res?.message ?? 'Não foi possível carregar as regras de ST.',
    )
  }
  return (res.data as StRule[]) ?? []
}

/**
 * Regras de substituicao tributaria por UF de destino.
 *
 * A MVA vem de protocolo entre estados e varia por destino: o campo unico no
 * cadastro do produto serve de padrao, e cada linha aqui o sobrepoe para a UF
 * correspondente. Quem vende para um estado so' nao precisa desta tabela.
 *
 * Fica FORA do formulario principal de propósito: e' outro recurso, com
 * endpoints proprios, e formulario aninhado em HTML nao e' valido.
 */
export function ProductStRules({ productId }: { productId: string }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [rascunho, setRascunho] = useState<Rascunho | null>(null)

  const {
    data: regras = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['product-st-rules', productId],
    queryFn: () => buscarRegras(productId),
    enabled: !!productId,
  })

  const invalidar = () =>
    queryClient.invalidateQueries({ queryKey: ['product-st-rules', productId] })

  const salvar = useMutation({
    mutationFn: async (r: Rascunho) =>
      putItemNew({
        route: `/fiscal/product/${productId}/st-rules`,
        data: {
          ufDestino: r.ufDestino,
          mva: paraNumero(r.mva),
          aliquotaInterna: paraNumero(r.aliquotaInterna),
          reducaoBase: paraNumero(r.reducaoBase),
          fcpStRate: paraNumero(r.fcpStRate),
        },
      }),
    onSuccess: (res) => {
      if (!res?.success) {
        toast({ title: res?.message ?? 'Não foi possível salvar a regra.' })
        return
      }
      setRascunho(null)
      invalidar()
      toast({ title: 'Regra de ST salva.' })
    },
  })

  const remover = useMutation({
    mutationFn: async (uf: string) =>
      deleteItemNew({
        route: `/fiscal/product/${productId}/st-rules/${uf}`,
      }),
    onSuccess: (res) => {
      if (!res?.success) {
        toast({ title: res?.message ?? 'Não foi possível remover a regra.' })
        return
      }
      invalidar()
      toast({ title: 'Regra de ST removida.' })
    },
  })

  // Ao editar, a UF fica travada: trocá-la criaria outra regra em vez de
  // alterar esta, e a antiga continuaria valendo sem ninguém perceber.
  const editando =
    !!rascunho && regras.some((r) => r.ufDestino === rascunho.ufDestino)

  const ufsDisponiveis = UFS.filter(
    (uf) => !regras.some((r) => r.ufDestino === uf),
  )

  const campo = (chave: keyof Omit<Rascunho, 'ufDestino'>, rotulo: string) => (
    <div className="space-y-1">
      <Label className="text-xs">{rotulo}</Label>
      <Input
        type="number"
        step="0.01"
        min="0"
        placeholder="—"
        value={rascunho?.[chave] ?? ''}
        onChange={(e) =>
          setRascunho((r) => (r ? { ...r, [chave]: e.target.value } : r))
        }
      />
    </div>
  )

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium">Substituição tributária por UF</h3>
          <p className="text-xs text-muted-foreground mt-1">
            A MVA vem de protocolo entre estados e muda conforme o destino. Sem
            regra para a UF, valem os campos de ST acima como padrão.
          </p>
        </div>
        {!rascunho && (
          <Button
            type="button"
            variant="neutralOutline"
            size="sm"
            LeftIcon={IconPlus}
            disabled={ufsDisponiveis.length === 0}
            onClick={() => setRascunho(RASCUNHO_VAZIO)}
          >
            Adicionar UF
          </Button>
        )}
      </div>

      {rascunho && (
        <div className="rounded-md border p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">UF de destino</Label>
              <Select
                value={rascunho.ufDestino}
                disabled={editando}
                onValueChange={(uf) =>
                  setRascunho((r) => (r ? { ...r, ufDestino: uf } : r))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {(editando ? [rascunho.ufDestino] : ufsDisponiveis).map(
                    (uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            {campo('mva', 'MVA (%)')}
            {campo('aliquotaInterna', 'Alíq. interna (%)')}
            {campo('reducaoBase', 'Redução BC (%)')}
            {campo('fcpStRate', 'FCP-ST (%)')}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="neutralOutline"
              size="sm"
              LeftIcon={IconX}
              onClick={() => setRascunho(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!rascunho.ufDestino || salvar.isPending}
              isLoading={salvar.isPending}
              onClick={() => salvar.mutate(rascunho)}
            >
              Salvar regra
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando regras…</p>
      ) : isError ? (
        <p className="text-sm text-red-600">
          {(error as Error)?.message ??
            'Não foi possível carregar as regras de ST.'}
        </p>
      ) : regras.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma regra cadastrada. O produto usa os campos de ST acima em todas
          as UFs.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UF</TableHead>
              <TableHead>MVA</TableHead>
              <TableHead>Alíq. interna</TableHead>
              <TableHead>Redução BC</TableHead>
              <TableHead>FCP-ST</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {regras.map((r) => (
              <TableRow key={r.ufDestino}>
                <TableCell className="font-medium">{r.ufDestino}</TableCell>
                <TableCell>{percentual(r.mva)}</TableCell>
                <TableCell>{percentual(r.aliquotaInterna)}</TableCell>
                <TableCell>{percentual(r.reducaoBase)}</TableCell>
                <TableCell>{percentual(r.fcpStRate)}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    <Button
                      type="button"
                      variant="neutralOutline"
                      size="sm"
                      LeftIcon={IconPencil}
                      aria-label={`Editar regra de ${r.ufDestino}`}
                      onClick={() =>
                        setRascunho({
                          ufDestino: r.ufDestino,
                          mva: paraTexto(r.mva),
                          aliquotaInterna: paraTexto(r.aliquotaInterna),
                          reducaoBase: paraTexto(r.reducaoBase),
                          fcpStRate: paraTexto(r.fcpStRate),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="neutralOutline"
                      size="sm"
                      LeftIcon={IconTrash}
                      aria-label={`Remover regra de ${r.ufDestino}`}
                      disabled={remover.isPending}
                      onClick={() => remover.mutate(r.ufDestino)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
