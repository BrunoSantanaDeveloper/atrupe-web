'use client'

// Novidades do sistema (19/11/2026): o Super Admin escreve cada atualização,
// escolhe os planos e publica. Publicada, ela acende o sino dos usuários,
// abre o aviso "O que mudou" no painel (quando em destaque) e entra na página
// Novidades do cliente.

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  IconEdit,
  IconPlus,
  IconSend,
  IconArrowBackUp,
  IconTrash,
} from '@tabler/icons-react'

import { Topbar } from '@/components/common/Topbar'
import { Badge } from '@/components/ui/badge'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SelectBasic } from '@/components/common/form/FormSelect'
import { ReleaseNoteItems } from '@/components/common/ReleaseNotes/ReleaseNoteItems'
import { formatToLocaleDateTime } from '@/lib/formatDate'

import {
  createItemNew,
  deleteItemNew,
  getItem,
  updateItemNew,
} from '@/actions/_cruds'
import {
  RELEASE_LIST_KEY,
  RELEASE_SUMMARY_KEY,
  type ReleaseItemKind,
  type ReleaseNote,
} from '@/hooks/queries/useReleaseNotes'

type AdminReleaseNote = ReleaseNote & {
  createdByName: string | null
  createdAt: string
  seenCount: number
}

type Draft = {
  id?: string
  title: string
  summary: string
  version: string
  plans: string[]
  highlight: boolean
  items: { kind: ReleaseItemKind; text: string }[]
}

const ADMIN_KEY = ['release-notes', 'admin']

const PLANS = [
  { value: 'START', label: 'Start' },
  { value: 'LITE', label: 'Lite' },
  { value: 'PRO', label: 'Pro' },
  { value: 'ELITE', label: 'Elite' },
  { value: 'FULL', label: 'Full' },
  { value: 'TRIAL', label: 'Teste (trial)' },
]

const KIND_OPTIONS = [
  { value: 'NEW', label: 'Novo' },
  { value: 'IMPROVEMENT', label: 'Melhoria' },
  { value: 'FIX', label: 'Correção' },
]

const EMPTY: Draft = {
  title: '',
  summary: '',
  version: '',
  plans: [],
  highlight: true,
  items: [{ kind: 'NEW', text: '' }],
}

const statusOf = (
  note: AdminReleaseNote,
): {
  text: string
  variant: 'neutralLight' | 'warningLight' | 'successLight'
} => {
  if (!note.publishedAt) return { text: 'Rascunho', variant: 'neutralLight' }
  return new Date(note.publishedAt) > new Date()
    ? { text: 'Agendada', variant: 'warningLight' }
    : { text: 'Publicada', variant: 'successLight' }
}

export default function AdminReleaseNotesPage() {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)

  const { data: notes, isLoading } = useQuery({
    queryKey: ADMIN_KEY,
    queryFn: async () => {
      const res = await getItem({ route: '/release-notes/admin' })
      return res.success ? (res.data as AdminReleaseNote[]) : []
    },
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ADMIN_KEY })
    queryClient.invalidateQueries({ queryKey: RELEASE_SUMMARY_KEY })
    queryClient.invalidateQueries({ queryKey: RELEASE_LIST_KEY })
  }

  const run = async (
    action: () => Promise<{ success: boolean; message?: string }>,
    done: string,
  ) => {
    const res = await action()
    if (!res.success) {
      toast.error(res.message || 'Não foi possível concluir')
      return false
    }
    toast.success(done)
    refresh()
    return true
  }

  const save = async () => {
    if (!draft) return
    const body = {
      title: draft.title,
      summary: draft.summary,
      version: draft.version || null,
      plans: draft.plans,
      highlight: draft.highlight,
      items: draft.items.filter((item) => item.text.trim()),
    }
    setSaving(true)
    const ok = await run(
      () =>
        draft.id
          ? updateItemNew({
              route: `/release-notes/admin/${draft.id}`,
              data: body,
            })
          : createItemNew({ route: '/release-notes/admin', data: body }),
      draft.id ? 'Novidade salva' : 'Rascunho criado',
    )
    setSaving(false)
    if (ok) setDraft(null)
  }

  const edit = (note: AdminReleaseNote) =>
    setDraft({
      id: note.id,
      title: note.title,
      summary: note.summary,
      version: note.version ?? '',
      plans: note.plans,
      highlight: note.highlight,
      items: note.items.length ? note.items : [{ kind: 'NEW', text: '' }],
    })

  const setItem = (index: number, patch: Partial<Draft['items'][number]>) =>
    setDraft((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item, i) =>
              i === index ? { ...item, ...patch } : item,
            ),
          }
        : current,
    )

  return (
    <div className="space-y-5">
      <Topbar
        title="Novidades do sistema"
        supportText="O que cada atualização trouxe, para os usuários dos planos escolhidos"
        primaryCta={
          <Button LeftIcon={IconPlus} onClick={() => setDraft({ ...EMPTY })}>
            Nova novidade
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : notes?.length ? (
        <div className="space-y-4">
          {notes.map((note) => {
            const status = statusOf(note)
            return (
              <Card key={note.id}>
                <CardContent className="space-y-3 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="type-card-title">{note.title}</h2>
                        <Badge variant={status.variant}>{status.text}</Badge>
                        {note.highlight ? (
                          <Badge variant="blueLight">Aviso no painel</Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-gray-600">{note.summary}</p>
                      <p className="text-xs text-gray-500">
                        {[
                          note.version,
                          note.plans.length
                            ? `Planos: ${note.plans
                                .map(
                                  (plan) =>
                                    PLANS.find((item) => item.value === plan)
                                      ?.label ?? plan,
                                )
                                .join(', ')}`
                            : 'Todos os planos',
                          note.publishedAt
                            ? `Publicada em ${formatToLocaleDateTime(note.publishedAt)}`
                            : null,
                          `${note.seenCount} ${note.seenCount === 1 ? 'usuário viu' : 'usuários viram'}`,
                          note.createdByName
                            ? `por ${note.createdByName}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="neutralOutline"
                        size="sm"
                        LeftIcon={IconEdit}
                        onClick={() => edit(note)}
                      >
                        Editar
                      </Button>
                      {note.publishedAt ? (
                        <Button
                          variant="neutralOutline"
                          size="sm"
                          LeftIcon={IconArrowBackUp}
                          onClick={() =>
                            run(
                              () =>
                                createItemNew({
                                  route: `/release-notes/admin/${note.id}/unpublish`,
                                  data: {},
                                }),
                              'Voltou a rascunho',
                            )
                          }
                        >
                          Voltar a rascunho
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          LeftIcon={IconSend}
                          onClick={() => {
                            if (
                              window.confirm(
                                'Publicar agora? Os usuários dos planos escolhidos são avisados no sino e no painel.',
                              )
                            ) {
                              run(
                                () =>
                                  createItemNew({
                                    route: `/release-notes/admin/${note.id}/publish`,
                                    data: {},
                                  }),
                                'Novidade publicada',
                              )
                            }
                          }}
                        >
                          Publicar
                        </Button>
                      )}
                      <Button
                        variant="errorOutline"
                        size="sm"
                        LeftIcon={IconTrash}
                        onClick={() => {
                          if (window.confirm('Apagar esta novidade?')) {
                            run(
                              () =>
                                deleteItemNew({
                                  route: `/release-notes/admin/${note.id}`,
                                }),
                              'Novidade apagada',
                            )
                          }
                        }}
                      >
                        Apagar
                      </Button>
                    </div>
                  </div>
                  <ReleaseNoteItems items={note.items} />
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-sm text-gray-600">
            Nenhuma novidade ainda. Crie a primeira com &quot;Nova
            novidade&quot;.
          </CardContent>
        </Card>
      )}

      <Dialog open={!!draft} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>
              {draft?.id ? 'Editar novidade' : 'Nova novidade'}
            </DialogTitle>
            <DialogDescription>
              Nasce como rascunho. Os usuários só veem depois de publicar.
            </DialogDescription>
          </DialogHeader>
          {draft ? (
            <DialogBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
                <div className="space-y-2">
                  <Label htmlFor="release-title">Título</Label>
                  <Input
                    id="release-title"
                    value={draft.title}
                    maxLength={120}
                    onChange={(event) =>
                      setDraft({ ...draft, title: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="release-version">Versão (opcional)</Label>
                  <Input
                    id="release-version"
                    value={draft.version}
                    maxLength={40}
                    placeholder="Novembro de 2026"
                    onChange={(event) =>
                      setDraft({ ...draft, version: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="release-summary">Resumo</Label>
                <Textarea
                  id="release-summary"
                  value={draft.summary}
                  maxLength={300}
                  rows={2}
                  onChange={(event) =>
                    setDraft({ ...draft, summary: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Planos (nenhum marcado = todos)</Label>
                <div className="flex flex-wrap gap-4">
                  {PLANS.map((plan) => (
                    <label
                      key={plan.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={draft.plans.includes(plan.value)}
                        onCheckedChange={(checked) =>
                          setDraft({
                            ...draft,
                            plans: checked
                              ? [...draft.plans, plan.value]
                              : draft.plans.filter(
                                  (item) => item !== plan.value,
                                ),
                          })
                        }
                      />
                      {plan.label}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={draft.highlight}
                  onCheckedChange={(checked) =>
                    setDraft({ ...draft, highlight: checked })
                  }
                />
                Mostrar o aviso &quot;O que mudou&quot; no painel, na primeira
                abertura depois de publicar
              </label>
              <div className="space-y-3">
                <Label>Mudanças</Label>
                {draft.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid items-end gap-2 sm:grid-cols-[160px_1fr_auto]"
                  >
                    <SelectBasic
                      name={`release-kind-${index}`}
                      className="w-full"
                      options={KIND_OPTIONS}
                      value={item.kind}
                      onChange={(value) =>
                        setItem(index, { kind: value as ReleaseItemKind })
                      }
                    />
                    <Input
                      value={item.text}
                      maxLength={400}
                      placeholder="O que mudou, do jeito que o cliente entende"
                      onChange={(event) =>
                        setItem(index, { text: event.target.value })
                      }
                    />
                    <Button
                      type="button"
                      size="iconMd"
                      variant="neutralOutline"
                      aria-label="Tirar a mudança"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          items: draft.items.filter((_, i) => i !== index),
                        })
                      }
                    >
                      <Icon icon={IconTrash} size="sm" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="neutralOutline"
                  size="sm"
                  LeftIcon={IconPlus}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      items: [...draft.items, { kind: 'NEW', text: '' }],
                    })
                  }
                >
                  Acrescentar mudança
                </Button>
              </div>
            </DialogBody>
          ) : null}
          <DialogFooter>
            <Button variant="neutralOutline" onClick={() => setDraft(null)}>
              Cancelar
            </Button>
            <Button
              isLoading={saving}
              disabled={!draft?.title.trim() || !draft?.summary.trim()}
              onClick={save}
            >
              Salvar rascunho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
