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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FeaturedIcon } from '@/components/ui/featured-icon'

// Icons
import {
  IconListDetails,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'

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
  codClassificacao?: string | null
  isDefault: boolean
}

export function useListaServicosNfse() {
  const [servicos, setServicos] = useState<NfseServicoItem[]>([])

  const carregar = useCallback(async () => {
    try {
      const r = await getItem({ route: '/fiscal/nfse-servicos' })
      if (r.success && Array.isArray(r.data)) {
        setServicos(r.data as NfseServicoItem[])
      }
    } catch {
      // Lista é opcional na emissão: sem ela os campos seguem manuais.
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { servicos, recarregar: carregar }
}

// ─── Select usado nas telas de emissão ──────────────────────────────────────

interface SelectProps {
  servicos: NfseServicoItem[]
  selecionadoId: string | null
  onSelecionar: (servico: NfseServicoItem | null) => void
}

export function ListaServicosSelect({
  servicos,
  selecionadoId,
  onSelecionar,
}: SelectProps) {
  if (servicos.length === 0) return null

  return (
    <div className="space-y-1.5">
      <Label>Lista de Serviços</Label>
      <Select
        value={selecionadoId ?? 'none'}
        onValueChange={(id) => {
          if (id === 'none') {
            onSelecionar(null)
            return
          }
          const servico = servicos.find((s) => s.id === id)
          if (servico) onSelecionar(servico)
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Escolher da lista cadastrada" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">— Preencher manualmente —</SelectItem>
          {servicos.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.codigo} — {s.descricao}
              {s.aliquotaIss != null ? ` (ISS ${s.aliquotaIss}%)` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-[11px] text-gray-500">
        Escolher um item preenche código, alíquota e a classificação fiscal da
        nota
      </p>
    </div>
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
  const { servicos, recarregar } = useListaServicosNfse()
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
              <FeaturedIcon variant="neutralOutline" Icon={IconListDetails} />
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
                {editandoId ? 'Salvar alterações' : 'Adicionar'}
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
                      <IconPencil size={16} />
                    </Button>
                    <Button
                      variant="errorGhost"
                      size="iconSm"
                      onClick={() => remover(s)}
                      aria-label={`Remover ${s.codigo}`}
                    >
                      <IconTrash size={16} />
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
