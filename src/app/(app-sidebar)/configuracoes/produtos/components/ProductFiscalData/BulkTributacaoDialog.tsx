'use client'

/**
 * BulkTributacaoDialog
 *
 * Corrige a tributação de vários produtos de uma vez: CST de ICMS, alíquota,
 * redução da base, origem da mercadoria e CFOPs.
 *
 * Existe por causa da troca de regime fiscal. No Simples Nacional todo produto
 * nasce com CSOSN (padrão 102) e, quando a empresa passa a Regime Normal, a
 * base inteira para de emitir de uma vez — "o código 102 é CSOSN e não vale no
 * Regime Normal" — sem jeito de abrir 119 cadastros um por um.
 *
 * As opções não são escritas aqui: vêm de
 * GET /fiscal/product/bulk-tributacao/opcoes, que responde conforme o regime do
 * emissor (CST no Regime Normal, CSOSN no Simples) e diz quais códigos exigem
 * alíquota ou redução de base. Assim a tela não mantém uma segunda tabela
 * fiscal, que divergiria da do cálculo da nota.
 *
 * A alíquota sugerida é a interna da UF do emissor, com a procedência que o
 * backend informa: parte dos padrões por UF não foi conferida na legislação
 * estadual, e quem decide a alíquota é o contador do cliente.
 */

// React
import { useEffect, useMemo, useRef, useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FeaturedIcon } from '@/components/ui/featured-icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Icons
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconReceiptTax,
} from '@tabler/icons-react'

// Actions
import { createItemNew, getItem } from '@/actions/_cruds'

// Hooks
import { useQuery, useQueryClient } from '@tanstack/react-query'

// Types
// Mesmo contrato de escopo da alteração de NCM em massa: os produtos marcados,
// ou todos os que correspondem ao filtro da listagem.
import type { BulkNcmScope } from './BulkNcmDialog'

interface OpcaoCst {
  code: string
  label: string
  description: string
  exigeAliquota: boolean
  exigeReducao: boolean
  exigeRegraSt: boolean
}

interface OpcoesTributacao {
  emitCrt: number | null
  regime: 'NORMAL' | 'SIMPLES'
  uf: string | null
  aliquotaInternaSugerida: {
    uf: string
    aliquota: number
    origem: 'padrao' | 'ajustado'
    revisado: boolean
  } | null
  cstOptions: OpcaoCst[]
  incompativeis: number
  semCadastroFiscal: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  scope: BulkNcmScope
  onApplied?: () => void
}

/** Tabela A do layout: origem da mercadoria. */
const ORIGENS = [
  { code: '0', label: '0 - Nacional' },
  { code: '1', label: '1 - Estrangeira: importação direta' },
  { code: '2', label: '2 - Estrangeira: adquirida no mercado interno' },
  { code: '3', label: '3 - Nacional com conteúdo de importação acima de 40%' },
  { code: '4', label: '4 - Nacional por processo produtivo básico' },
  { code: '5', label: '5 - Nacional com conteúdo de importação até 40%' },
  {
    code: '6',
    label: '6 - Estrangeira: importação direta, sem similar nacional',
  },
  {
    code: '7',
    label: '7 - Estrangeira: mercado interno, sem similar nacional',
  },
  { code: '8', label: '8 - Nacional com conteúdo de importação acima de 70%' },
]

/** Campo numérico em percentual, aceitando vírgula como o usuário digita. */
function parsePercentual(valor: string): number | null {
  const normalizado = valor.replace(',', '.').trim()
  if (!normalizado) return null
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : null
}

export function BulkTributacaoDialog({
  open,
  onOpenChange,
  scope,
  onApplied,
}: Props) {
  const queryClient = useQueryClient()

  const [cst, setCst] = useState('')
  const [aliquota, setAliquota] = useState('')
  const [reducao, setReducao] = useState('')
  const [origem, setOrigem] = useState('')
  const [cfopInterno, setCfopInterno] = useState('')
  const [cfopExterno, setCfopExterno] = useState('')
  const [mostrarOutros, setMostrarOutros] = useState(false)
  const [somenteOutroRegime, setSomenteOutroRegime] = useState(true)
  const [somenteSemAliquota, setSomenteSemAliquota] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const aliquotaTocada = useRef(false)

  const escopoTodos = scope.kind === 'all'
  const totalDoEscopo =
    scope.kind === 'selected' ? scope.productIds.length : scope.total

  const { data: resposta, isLoading: carregandoOpcoes } = useQuery({
    queryKey: ['bulk-tributacao-opcoes'],
    queryFn: () => getItem({ route: '/fiscal/product/bulk-tributacao/opcoes' }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  })
  const opcoes = resposta?.data as OpcoesTributacao | undefined

  // Corpo da requisição sem os valores a gravar: é o que define quantos
  // produtos a correção atinge, e o que a contagem precisa saber.
  const escopoRequest = useMemo(
    () =>
      escopoTodos
        ? { scope: 'ALL' as const, filters: scope.filters }
        : { productIds: scope.kind === 'selected' ? scope.productIds : [] },
    [escopoTodos, scope],
  )

  // Quantos produtos a correção atinge de fato. Com o filtro "só os do outro
  // regime" o número é menor que o total da seleção, e é ele que a tela mostra
  // antes de aplicar.
  const { data: contagem } = useQuery({
    queryKey: ['bulk-tributacao-count', escopoRequest, somenteOutroRegime],
    queryFn: () =>
      createItemNew({
        route: '/fiscal/product/bulk-tributacao/count',
        data: {
          ...escopoRequest,
          onlyIncompatibleRegime: somenteOutroRegime,
        },
      }),
    enabled: open && totalDoEscopo > 0,
  })
  const alvos = (contagem?.data?.total ?? null) as number | null

  const cstSelecionado = opcoes?.cstOptions.find((opcao) => opcao.code === cst)
  const sugestao = opcoes?.aliquotaInternaSugerida

  // Cada abertura recomeça limpa: um CST escolhido antes não deve reaparecer
  // numa seleção diferente e ser aplicado sem querer.
  useEffect(() => {
    if (!open) return
    aliquotaTocada.current = false
    setCst('')
    setAliquota('')
    setReducao('')
    setOrigem('')
    setCfopInterno('')
    setCfopExterno('')
    setMostrarOutros(false)
    setSomenteOutroRegime(true)
    setSomenteSemAliquota(true)
    setError(null)
  }, [open])

  // Alíquota da UF entra como sugestão quando o CST escolhido exige uma, e
  // nunca por cima do que o usuário já mexeu — inclusive quando ele apagou o
  // campo de propósito, que sem o controle de "tocado" seria reenchido.
  useEffect(() => {
    if (aliquotaTocada.current) return
    if (!cstSelecionado?.exigeAliquota || !sugestao) return
    setAliquota(String(sugestao.aliquota))
  }, [cstSelecionado, sugestao])

  function montarCorpo() {
    const corpo: Record<string, unknown> = {
      ...escopoRequest,
      onlyIncompatibleRegime: somenteOutroRegime,
      onlyMissingRate: somenteSemAliquota,
    }

    if (cst) corpo.icmsCst = cst
    if (origem) corpo.icmsOrigin = origem

    for (const [campo, valor] of [
      ['icmsRate', aliquota],
      ['icmsReducao', reducao],
    ] as const) {
      if (!valor.trim()) continue
      const numero = parsePercentual(valor)
      if (numero === null || numero < 0 || numero > 100) {
        return {
          erro:
            campo === 'icmsRate'
              ? 'A alíquota de ICMS deve ser um número entre 0 e 100.'
              : 'A redução da base deve ser um número entre 0 e 100.',
        }
      }
      corpo[campo] = numero
    }

    for (const [campo, valor] of [
      ['cfopInState', cfopInterno],
      ['cfopOutState', cfopExterno],
    ] as const) {
      if (valor && !/^[0-9]{4}$/.test(valor)) {
        return { erro: 'O CFOP deve ter 4 dígitos. Ex.: 5101 ou 6101.' }
      }
      if (valor) corpo[campo] = valor
    }

    const temCampo = [
      'icmsCst',
      'icmsRate',
      'icmsReducao',
      'icmsOrigin',
      'cfopInState',
      'cfopOutState',
    ].some((campo) => corpo[campo] !== undefined)

    if (!temCampo) {
      return {
        erro:
          'Escolha o que corrigir: CST de ICMS, alíquota, redução da base, ' +
          'origem da mercadoria ou CFOP.',
      }
    }

    return { corpo }
  }

  async function handleSubmit() {
    const { corpo, erro } = montarCorpo()

    if (erro || !corpo) {
      setError(erro ?? 'Verifique os campos informados.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createItemNew({
        route: '/fiscal/product/bulk-tributacao',
        data: corpo,
      })

      if (!result.success) {
        // A mensagem do backend é a que sabe o que ficaria bloqueado (ex.:
        // "118 produto(s) ficariam com o CST 00 sem alíquota"), então ela
        // aparece no campo e não só num toast que desaparece.
        setError(result.message || 'Erro ao corrigir a tributação.')
        return
      }

      const { updated = 0, created = 0, ignored = 0 } = result.data || {}
      const alterados = updated + created

      toast.success(
        `Tributação corrigida em ${alterados} produto${alterados === 1 ? '' : 's'}.` +
          (ignored > 0 ? ` ${ignored} ignorado(s).` : ''),
      )

      await queryClient.invalidateQueries({ queryKey: ['product-list'] })
      await queryClient.invalidateQueries({ queryKey: ['product-fiscal-data'] })
      await queryClient.invalidateQueries({
        queryKey: ['bulk-tributacao-opcoes'],
      })

      onApplied?.()
      onOpenChange(false)
    } catch {
      setError('Erro ao corrigir a tributação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nomeRegime =
    opcoes?.regime === 'NORMAL' ? 'Regime Normal' : 'Simples Nacional'
  const codigoDoOutroRegime =
    opcoes?.regime === 'NORMAL'
      ? 'CSOSN, do Simples Nacional'
      : 'CST, do Regime Normal'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <FeaturedIcon variant="neutralOutline" Icon={IconReceiptTax} />
              <span>Corrigir tributação em massa</span>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>Regime do emissor:</span>
            {carregandoOpcoes ? (
              <span className="text-gray-400">carregando…</span>
            ) : (
              <Badge variant="neutralLight">
                {nomeRegime}
                {opcoes?.emitCrt ? ` (CRT ${opcoes.emitCrt})` : ''}
              </Badge>
            )}
            {opcoes?.uf && <Badge variant="neutralLight">{opcoes.uf}</Badge>}
          </div>

          {!!opcoes?.incompativeis && (
            <div className="flex gap-2 rounded-md border border-warning-200 bg-warning-50 p-3">
              <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-600" />
              <p className="text-sm text-warning-700">
                <strong>{opcoes.incompativeis} produto(s)</strong> da empresa
                estão com código {codigoDoOutroRegime} e não emitem neste
                regime.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-600">
            A correção será aplicada a{' '}
            <strong>
              {alvos ?? totalDoEscopo} produto
              {(alvos ?? totalDoEscopo) === 1 ? '' : 's'}
            </strong>
            {escopoTodos
              ? ' da lista atual, incluindo as outras páginas'
              : ' da seleção'}
            . Os campos não informados abaixo são preservados em cada produto.
          </p>

          <div className="space-y-2">
            <Label htmlFor="bulk-cst">CST de ICMS</Label>
            <Select
              value={cst}
              onValueChange={(valor) => {
                setCst(valor)
                setError(null)
              }}
            >
              <SelectTrigger id="bulk-cst">
                <SelectValue
                  placeholder={
                    carregandoOpcoes ? 'Carregando…' : 'Não alterar o CST'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(opcoes?.cstOptions ?? []).map((opcao) => (
                  <SelectItem key={opcao.code} value={opcao.code}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Somente os códigos válidos no {nomeRegime} são oferecidos.
            </p>
          </div>

          {cstSelecionado?.exigeAliquota && (
            <div className="space-y-2">
              <Label htmlFor="bulk-aliquota">Alíquota de ICMS (%)</Label>
              <Input
                id="bulk-aliquota"
                value={aliquota}
                inputMode="decimal"
                placeholder="0,00"
                onChange={(event) => {
                  aliquotaTocada.current = true
                  setAliquota(event.target.value)
                  setError(null)
                }}
              />
              {sugestao ? (
                <p className="text-xs text-gray-500">
                  Alíquota interna de {sugestao.uf}:{' '}
                  <strong>{sugestao.aliquota}%</strong>
                  {sugestao.origem === 'padrao' && !sugestao.revisado
                    ? ' (padrão do sistema, ainda não conferido na legislação estadual — confirme com o contador)'
                    : ''}
                  {String(sugestao.aliquota) !== aliquota && (
                    <button
                      type="button"
                      className="ml-2 text-brand-600 underline"
                      onClick={() => {
                        aliquotaTocada.current = true
                        setAliquota(String(sugestao.aliquota))
                      }}
                    >
                      Usar {sugestao.aliquota}%
                    </button>
                  )}
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  O CST {cstSelecionado.code} destaca ICMS próprio e exige
                  alíquota: sem ela a emissão continua bloqueada.
                </p>
              )}
              <label className="flex cursor-pointer items-start gap-2 pt-1">
                <Checkbox
                  checked={somenteSemAliquota}
                  onCheckedChange={(checked) =>
                    setSomenteSemAliquota(checked === true)
                  }
                />
                <span className="text-sm text-gray-700">
                  Preencher a alíquota somente de quem está sem
                  <span className="block text-xs text-gray-500">
                    Preserva a alíquota de quem já foi ajustado à mão, que
                    costuma ser a exceção conferida da base. O CST é aplicado a
                    todos de qualquer forma.
                  </span>
                </span>
              </label>
            </div>
          )}

          {cstSelecionado?.exigeRegraSt && (
            <div className="flex gap-2 rounded-lg border border-warning-200 bg-warning-50 p-3">
              <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-warning-600" />
              <p className="text-sm text-warning-700">
                O CST {cstSelecionado.code} tem substituição tributária: cada
                produto também precisa da regra de ST da UF de destino (MVA e
                alíquota interna de lá), cadastrada no próprio produto. A
                correção em massa não preenche esses dados — a MVA vem de
                protocolo entre estados por NCM.
              </p>
            </div>
          )}

          {cstSelecionado?.exigeReducao && (
            <div className="space-y-2">
              <Label htmlFor="bulk-reducao">
                Redução da base de cálculo (%)
              </Label>
              <Input
                id="bulk-reducao"
                value={reducao}
                inputMode="decimal"
                placeholder="0,00"
                onChange={(event) => {
                  setReducao(event.target.value)
                  setError(null)
                }}
              />
              <p className="text-xs text-gray-500">
                Entre 0 e 100, sem incluir os extremos.
              </p>
            </div>
          )}

          {mostrarOutros ? (
            <div className="space-y-4 rounded-md border border-gray-200 p-3">
              <div className="space-y-2">
                <Label htmlFor="bulk-origem">Origem da mercadoria</Label>
                <Select
                  value={origem}
                  onValueChange={(valor) => {
                    setOrigem(valor)
                    setError(null)
                  }}
                >
                  <SelectTrigger id="bulk-origem">
                    <SelectValue placeholder="Não alterar" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORIGENS.map((opcao) => (
                      <SelectItem key={opcao.code} value={opcao.code}>
                        {opcao.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="bulk-cfop-interno">CFOP no estado</Label>
                  <Input
                    id="bulk-cfop-interno"
                    value={cfopInterno}
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="5101"
                    onChange={(event) => {
                      setCfopInterno(event.target.value.replace(/[^0-9]/g, ''))
                      setError(null)
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk-cfop-externo">CFOP fora do estado</Label>
                  <Input
                    id="bulk-cfop-externo"
                    value={cfopExterno}
                    maxLength={4}
                    inputMode="numeric"
                    placeholder="6101"
                    onChange={(event) => {
                      setCfopExterno(event.target.value.replace(/[^0-9]/g, ''))
                      setError(null)
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="text-sm text-brand-600 underline"
              onClick={() => setMostrarOutros(true)}
            >
              Corrigir também origem da mercadoria e CFOP
            </button>
          )}

          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-gray-200 p-3">
            <Checkbox
              checked={somenteOutroRegime}
              onCheckedChange={(checked) =>
                setSomenteOutroRegime(checked === true)
              }
            />
            <span className="text-sm text-gray-700">
              Aplicar somente a produtos com código do outro regime
              <span className="block text-xs text-gray-500">
                Preserva quem já está com um código válido no {nomeRegime},
                inclusive ajustado à mão; atinge quem ficou com{' '}
                {codigoDoOutroRegime} ou está sem CST.
              </span>
            </span>
          </label>

          {error && <p className="text-sm text-error-600">{error}</p>}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="neutralOutline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            RightIcon={IconCircleCheck}
            disabled={isSubmitting || carregandoOpcoes}
            isLoading={isSubmitting}
          >
            Aplicar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
