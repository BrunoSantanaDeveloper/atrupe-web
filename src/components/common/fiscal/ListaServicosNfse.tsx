'use client'

import { useCallback, useEffect, useState } from 'react'

// UI
import { toast } from 'sonner'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

// Icons
import {
  IconCheck,
  IconChevronDown,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Lib
import { cn } from '@/lib/utils'

// Actions
import {
  createItemNew,
  deleteItemNew,
  getItem,
  updateItemNew,
} from '@/actions/_cruds'

/**
 * Lista de serviços da empresa para NFS-e — espelha a "Lista de Serviços" do
 * InvoiCy Web. A empresa cadastra várias combinações de código LC 116 +
 * classificação fiscal e escolhe qual usar no ato da emissão.
 */
export interface NfseServicoItem {
  id: string
  codigo: string
  descricao: string
  aliquotaIss?: number | null
  codTribMunicipio?: string | null
  cnae?: string | null
  nbs?: string | null
  codTribNacional?: string | null
  cstIbsCbs?: string | null
  codClassificacao?: string | null
  isDefault: boolean
}

/**
 * @param rota Telas de emissão usam a raiz (permissão de emitir); o
 * gerenciador usa /config (permissão de configuração) — sem isso quem só
 * configura via a lista vazia e recadastrava em duplicata.
 */
export function useListaServicosNfse(rota = '/fiscal/nfse-servicos') {
  const [servicos, setServicos] = useState<NfseServicoItem[]>([])
  const [carregado, setCarregado] = useState(false)

  const carregar = useCallback(async () => {
    try {
      const r = await getItem({ route: rota })
      if (r.success && Array.isArray(r.data)) {
        setServicos(r.data as NfseServicoItem[])
      }
    } catch {
      // Lista é opcional na emissão: sem ela os campos seguem manuais.
    } finally {
      // "A resposta chegou", com ou sem itens. Sem esta flag, quem aplica o
      // serviço padrão não distingue lista vazia de lista ainda carregando e
      // sobrescreveria o que o usuário já tivesse escolhido.
      setCarregado(true)
    }
  }, [rota])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { servicos, carregado, recarregar: carregar }
}

/**
 * Serviço da lista correspondente ao código padrão do emissor.
 *
 * O padrão continua sendo o "Código de Serviço Padrão (LC 116)" do emissor —
 * é o que o usuário configura e o que a conferência de emissão chama de
 * padrão. A lista entra quando tem um item com o mesmo código: aí a emissão
 * ganha junto a classificação fiscal (NBS, CNAE, CST e classificação do
 * IBS/CBS), que antes só viajava se alguém clicasse no seletor.
 *
 * Comparação exata de propósito: `codigoServico` do emissor não passa por
 * validação de formato no backend, então comparar só os dígitos deixaria
 * '105' ambíguo entre 1.05 e 10.5.
 */
export function encontrarServicoPadrao(
  servicos: NfseServicoItem[],
  codigoEmissor?: string | null,
): NfseServicoItem | null {
  const alvo = (codigoEmissor ?? '').trim()
  if (!alvo) return null
  return servicos.find((s) => s.codigo.trim() === alvo) ?? null
}

// ─── Campo de código de serviço usado nas telas de emissão ──────────────────

interface ComboboxProps {
  id?: string
  servicos: NfseServicoItem[]
  /** Código que vai na nota, venha da lista ou digitado. */
  codigo: string
  servicoEscolhidoId: string | null
  onEscolherServico: (servico: NfseServicoItem) => void
  /** Código digitado à mão: desfaz o vínculo com o item da lista. */
  onCodigoManual: (codigo: string) => void
  disabled?: boolean
}

/**
 * Campo único de código de serviço: mostra o padrão já preenchido e, ao
 * abrir, lista os serviços cadastrados nas configurações.
 *
 * Antes eram dois controles para a mesma decisão — um select "Lista de
 * Serviços" num card à parte e o input "Código do Serviço" logo abaixo —, e
 * editar o input depois de escolher da lista deixava o código de um item com
 * a classificação fiscal de outro.
 */
export function CodigoServicoCombobox({
  id,
  servicos,
  codigo,
  servicoEscolhidoId,
  onEscolherServico,
  onCodigoManual,
  disabled,
}: ComboboxProps) {
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState('')

  const escolhido = servicos.find((s) => s.id === servicoEscolhidoId) ?? null
  const buscaLimpa = busca.trim()
  const jaExisteNaLista = servicos.some((s) => s.codigo.trim() === buscaLimpa)

  // Sem lista cadastrada não há o que escolher: o campo é o input de sempre.
  if (servicos.length === 0) {
    return (
      <Input
        id={id}
        value={codigo}
        onChange={(e) => onCodigoManual(e.target.value)}
        placeholder="Ex: 1.01"
        disabled={disabled}
      />
    )
  }

  const usarCodigoManual = (valor: string) => {
    onCodigoManual(valor)
    setBusca('')
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(aberto) => {
        setOpen(aberto)
        if (!aberto) setBusca('')
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="input"
          size="md"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full h-10 px-3 text-sm', !codigo && 'text-gray-400')}
        >
          <span className="flex-1 truncate text-left">
            {escolhido ? (
              <>
                {escolhido.codigo} — {escolhido.descricao}
              </>
            ) : codigo ? (
              <>
                {codigo} <span className="text-gray-400">(fora da lista)</span>
              </>
            ) : (
              'Escolher da lista ou digitar o código'
            )}
          </span>
          {escolhido?.aliquotaIss != null && (
            <Badge variant="blueLight" className="shrink-0">
              ISS {escolhido.aliquotaIss}%
            </Badge>
          )}
          <IconChevronDown
            aria-hidden
            size={ICON_SIZE.md}
            className={cn(
              'shrink-0 text-gray-400 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[var(--radix-popover-trigger-width)] min-w-[320px]"
        align="start"
        sideOffset={4}
      >
        <Command>
          <CommandInput
            placeholder="Buscar serviço ou digitar código (ex: 24.01)"
            value={busca}
            onValueChange={setBusca}
          />
          <CommandList>
            <CommandEmpty>
              {buscaLimpa
                ? 'Nenhum serviço cadastrado com esse código.'
                : 'Nenhum serviço cadastrado.'}
            </CommandEmpty>

            <CommandGroup heading="Serviços cadastrados">
              {servicos.map((s) => (
                <CommandItem
                  key={s.id}
                  value={`${s.codigo} ${s.descricao}`}
                  onSelect={() => {
                    onEscolherServico(s)
                    setBusca('')
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                >
                  <IconCheck
                    aria-hidden
                    size={ICON_SIZE.md}
                    className={cn(
                      'shrink-0 transition-opacity',
                      escolhido?.id === s.id
                        ? 'opacity-100 text-brand-600'
                        : 'opacity-0',
                    )}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-gray-800 truncate">
                      {s.codigo} — {s.descricao}
                    </span>
                    {s.aliquotaIss != null && (
                      <span className="text-xs text-gray-400">
                        ISS {s.aliquotaIss}%
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Código fora da lista continua válido: a prefeitura aceita
                qualquer código da LC 116, e o backend não exige cadastro. */}
            {buscaLimpa && !jaExisteNaLista && (
              <>
                <CommandSeparator />
                <CommandGroup forceMount>
                  <CommandItem
                    forceMount
                    value="__codigo_manual__"
                    onSelect={() => usarCodigoManual(buscaLimpa)}
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer text-brand-600"
                  >
                    <IconPlus
                      aria-hidden
                      size={ICON_SIZE.md}
                      className="shrink-0"
                    />
                    <span className="font-medium">
                      Usar o código &ldquo;{buscaLimpa}&rdquo; sem cadastrar
                    </span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─── Gerenciador (Configurações → Emissores → NFS-e) ────────────────────────

const FORM_VAZIO = {
  codigo: '',
  descricao: '',
  aliquotaIss: '',
  codTribMunicipio: '',
  cnae: '',
  nbs: '',
  codTribNacional: '',
  cstIbsCbs: '',
  codClassificacao: '',
}

interface ManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ListaServicosManagerDialog({
  open,
  onOpenChange,
}: ManagerProps) {
  const { servicos, recarregar } = useListaServicosNfse(
    '/fiscal/nfse-servicos/config',
  )
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (open) recarregar()
  }, [open, recarregar])

  const iniciarEdicao = (s: NfseServicoItem) => {
    setEditandoId(s.id)
    setForm({
      codigo: s.codigo,
      descricao: s.descricao,
      aliquotaIss: s.aliquotaIss != null ? String(s.aliquotaIss) : '',
      codTribMunicipio: s.codTribMunicipio ?? '',
      cnae: s.cnae ?? '',
      nbs: s.nbs ?? '',
      codTribNacional: s.codTribNacional ?? '',
      cstIbsCbs: s.cstIbsCbs ?? '',
      codClassificacao: s.codClassificacao ?? '',
    })
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setForm(FORM_VAZIO)
  }

  const salvar = async () => {
    if (!form.codigo.trim() || !form.descricao.trim()) {
      toast.error('Código e descrição são obrigatórios')
      return
    }

    setSalvando(true)
    try {
      const payload = {
        codigo: form.codigo.trim(),
        descricao: form.descricao.trim(),
        aliquotaIss: form.aliquotaIss ? Number(form.aliquotaIss) : undefined,
        codTribMunicipio: form.codTribMunicipio.trim() || undefined,
        cnae: form.cnae.trim() || undefined,
        nbs: form.nbs.trim() || undefined,
        codTribNacional: form.codTribNacional.trim() || undefined,
        cstIbsCbs: form.cstIbsCbs.trim() || undefined,
        codClassificacao: form.codClassificacao.trim() || undefined,
      }

      const r = editandoId
        ? await updateItemNew({
            route: `/fiscal/nfse-servicos/${editandoId}`,
            data: payload,
          })
        : await createItemNew({ route: '/fiscal/nfse-servicos', data: payload })

      if (!r.success) {
        throw new Error(r.message || 'Erro ao salvar serviço')
      }

      toast.success(editandoId ? 'Serviço atualizado' : 'Serviço cadastrado')
      cancelarEdicao()
      recarregar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao salvar serviço')
    } finally {
      setSalvando(false)
    }
  }

  const remover = async (s: NfseServicoItem) => {
    try {
      const r = await deleteItemNew({ route: `/fiscal/nfse-servicos/${s.id}` })
      if (!r.success) throw new Error(r.message || 'Erro ao remover')
      toast.success(`Serviço ${s.codigo} removido`)
      if (editandoId === s.id) cancelarEdicao()
      recarregar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Erro ao remover serviço')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[860px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-4">
              <div>
                <span>Lista de Serviços — NFS-e</span>
                <p className="text-sm font-normal text-gray-500">
                  Cadastre os serviços da empresa para escolher no ato da
                  emissão
                </p>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription hidden></DialogDescription>
        </DialogHeader>

        <DialogBody className="max-h-[65vh] overflow-y-auto space-y-4">
          {/* Formulário de inclusão/edição */}
          <div className="rounded-lg border border-gray-200 p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">
              {editandoId ? 'Editar serviço' : 'Novo serviço'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label htmlFor="ls-codigo">Código (LC 116) *</Label>
                <Input
                  id="ls-codigo"
                  placeholder="13.05"
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                />
              </div>
              <div className="space-y-1 lg:col-span-2">
                <Label htmlFor="ls-descricao">Descrição *</Label>
                <Input
                  id="ls-descricao"
                  placeholder="Serviço de comunicação visual"
                  value={form.descricao}
                  onChange={(e) =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ls-aliquota">% ISS</Label>
                <Input
                  id="ls-aliquota"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.aliquotaIss}
                  onChange={(e) =>
                    setForm({ ...form, aliquotaIss: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ls-codmun">Cód. Trib. Município</Label>
                <Input
                  id="ls-codmun"
                  placeholder="001"
                  value={form.codTribMunicipio}
                  onChange={(e) =>
                    setForm({ ...form, codTribMunicipio: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ls-cnae">CNAE</Label>
                <Input
                  id="ls-cnae"
                  placeholder="3299003"
                  value={form.cnae}
                  onChange={(e) => setForm({ ...form, cnae: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ls-nbs">Código NBS</Label>
                <Input
                  id="ls-nbs"
                  placeholder="121012200"
                  value={form.nbs}
                  onChange={(e) => setForm({ ...form, nbs: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ls-codnac">Cód. Trib. Nacional</Label>
                <Input
                  id="ls-codnac"
                  placeholder="230101"
                  value={form.codTribNacional}
                  onChange={(e) =>
                    setForm({ ...form, codTribNacional: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ls-cst">CST IBS/CBS</Label>
                <Input
                  id="ls-cst"
                  placeholder="000"
                  value={form.cstIbsCbs}
                  onChange={(e) =>
                    setForm({ ...form, cstIbsCbs: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ls-classtrib">Class. Trib. IBS/CBS</Label>
                <Input
                  id="ls-classtrib"
                  placeholder="000001"
                  value={form.codClassificacao}
                  onChange={(e) =>
                    setForm({ ...form, codClassificacao: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              {editandoId && (
                <Button variant="neutralOutline" onClick={cancelarEdicao}>
                  Cancelar
                </Button>
              )}
              <Button
                onClick={salvar}
                disabled={salvando}
                isLoading={salvando}
                RightIcon={editandoId ? IconPencil : IconPlus}
              >
                {editandoId ? 'Salvar' : 'Adicionar'}
              </Button>
            </div>
          </div>

          {/* Lista */}
          {servicos.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum serviço cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {servicos.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="blueLight">{s.codigo}</Badge>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {s.descricao}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {[
                        s.aliquotaIss != null ? `ISS ${s.aliquotaIss}%` : null,
                        s.cnae ? `CNAE ${s.cnae}` : null,
                        s.nbs ? `NBS ${s.nbs}` : null,
                        s.codTribNacional ? `Nac. ${s.codTribNacional}` : null,
                        s.codClassificacao
                          ? `IBS/CBS ${s.codClassificacao}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'Sem classificação adicional'}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="neutralLight"
                      size="iconSm"
                      onClick={() => iniciarEdicao(s)}
                      aria-label={`Editar ${s.codigo}`}
                    >
                      <IconPencil aria-hidden size={ICON_SIZE.sm} />
                    </Button>
                    <Button
                      variant="errorGhost"
                      size="iconSm"
                      onClick={() => remover(s)}
                      aria-label={`Remover ${s.codigo}`}
                    >
                      <IconTrash aria-hidden size={ICON_SIZE.sm} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
