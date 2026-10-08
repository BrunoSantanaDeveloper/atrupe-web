'use client'

// "O que vem depois?" (FL-5): o diálogo que preenche a etapa nova. Primeiro
// os processos marcados como usuais depois desta etapa, e "ver todos" para o
// resto (FL-7); ou a etapa montada aqui mesmo (IP-29); ou outro produto como
// parte (IP-9). Serve ao produto e ao item montado no orçamento (ORC-11).

// React
import { useEffect, useMemo, useState } from 'react'

// UI
import {
  Dialog,
  DialogBody,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Components
import { SelectBasic } from '@/components/common/form/FormSelect'

// Types
import type { NextStepCandidates, ProcessCatalogItem } from '../assembly'

// Hooks / Store / Consts
import { sectorIconByName } from '@/consts/sectors'

// Icons
import { IconSearch } from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Utils
import { cn } from '@/lib/utils'
import { afterBaseObj } from '@/consts/processes'

export type PartCandidate = {
  productId: string
  name: string
  code: string
  status: string
  stages: number
}

type Mode = 'process' | 'own' | 'part'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  // undefined enquanto carrega
  candidates?: NextStepCandidates | null
  // Nome da etapa de que a nova vai depender, para o título da lista
  afterName?: string | null
  sectors: string[]
  parts?: PartCandidate[]
  // Na variação só entra processo cadastrado: a etapa só dela sai inteira
  allowOwn?: boolean
  allowPart?: boolean
  onPickProcess: (processId: string) => void
  onCreateOwn: (name: string, sector: string) => void
  onPickPart?: (productId: string) => void
}

const normalize = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

function ProcessRow({
  process,
  onPick,
}: {
  process: ProcessCatalogItem
  onPick: () => void
}) {
  const Icon = sectorIconByName(process.sector)
  return (
    <button
      type="button"
      onClick={onPick}
      className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-left hover:border-brand-300 hover:bg-brand-25"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-800">
          {process.name}
        </span>
        <span className="block text-xs text-gray">{process.sector}</span>
      </span>
      {process.afterBase === 'INHERIT' && (
        <Badge variant="neutralLight">{afterBaseObj.INHERIT.label}</Badge>
      )}
    </button>
  )
}

export function NextStepDialog({
  open,
  onOpenChange,
  title,
  description,
  candidates,
  afterName,
  sectors,
  parts = [],
  allowOwn = true,
  allowPart = true,
  onPickProcess,
  onCreateOwn,
  onPickPart,
}: Props) {
  const [mode, setMode] = useState<Mode>('process')
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [name, setName] = useState('')
  const [sector, setSector] = useState('')

  useEffect(() => {
    if (!open) return
    setMode('process')
    setSearch('')
    setShowAll(false)
    setName('')
    setSector(sectors[0] || '')
  }, [open, sectors])

  const usualIds = useMemo(
    () => new Set((candidates?.usual || []).map((item) => item.id)),
    [candidates],
  )
  const term = normalize(search.trim())
  const matches = (item: ProcessCatalogItem) =>
    !term ||
    normalize(item.name).includes(term) ||
    normalize(item.sector).includes(term)

  const usual = (candidates?.usual || []).filter(matches)
  // Com busca, a lista inteira já aparece: ninguém abre "ver todos" para
  // procurar o que digitou
  const rest = (candidates?.all || []).filter(
    (item) =>
      matches(item) && (!candidates?.usual.length || !usualIds.has(item.id)),
  )
  const showRest = !candidates?.usual.length || showAll || !!term

  // O resto agrupado por setor, para a lista longa ter onde se apoiar
  const grouped = useMemo(() => {
    const map = new Map<string, ProcessCatalogItem[]>()
    rest.forEach((item) =>
      map.set(item.sector, [...(map.get(item.sector) || []), item]),
    )
    return Array.from(map.entries())
  }, [rest])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {description ||
                  'A etapa pode ser preenchida por um processo cadastrado, montada aqui mesmo, ou ser outro produto usado como parte.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="max-h-[calc(100vh-260px)] space-y-4 overflow-y-auto">
          {(allowOwn || allowPart) && (
            <Tabs value={mode} className="w-full">
              <TabsList>
                <TabsTrigger value="process" onClick={() => setMode('process')}>
                  Processo cadastrado
                </TabsTrigger>
                {allowOwn && (
                  <TabsTrigger value="own" onClick={() => setMode('own')}>
                    Montar aqui
                  </TabsTrigger>
                )}
                {allowPart && (
                  <TabsTrigger value="part" onClick={() => setMode('part')}>
                    Parte
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          )}

          {mode === 'process' && (
            <div className="space-y-4">
              <Input
                value={search}
                placeholder="Buscar processo pelo nome ou setor"
                startAdornment={<IconSearch aria-hidden size={ICON_SIZE.sm} />}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Buscar processo"
              />
              {!candidates ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  {usual.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-800">
                        {`Costumam vir depois de ${afterName?.toLowerCase() || 'esta etapa'}`}
                      </p>
                      {usual.map((process) => (
                        <ProcessRow
                          key={process.id}
                          process={process}
                          onPick={() => onPickProcess(process.id)}
                        />
                      ))}
                    </div>
                  )}
                  {!showRest && rest.length > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      className="px-0"
                      onClick={() => setShowAll(true)}
                    >
                      Ver todos os processos ({rest.length})
                    </Button>
                  )}
                  {showRest && (
                    <div
                      className={cn(
                        'space-y-4',
                        usual.length > 0 && 'border-t border-gray-200 pt-4',
                      )}
                    >
                      {usual.length > 0 && !term && (
                        <p className="text-sm font-medium text-gray-800">
                          Todos os processos
                        </p>
                      )}
                      {grouped.map(([group, items]) => (
                        <div key={group} className="space-y-2">
                          <p className="type-eyebrow">{group}</p>
                          {items.map((process) => (
                            <ProcessRow
                              key={process.id}
                              process={process}
                              onPick={() => onPickProcess(process.id)}
                            />
                          ))}
                        </div>
                      ))}
                      {!grouped.length && !usual.length && (
                        <p className="text-sm text-gray">
                          {term
                            ? 'Nenhum processo com esse nome.'
                            : 'Nenhum processo cadastrado ainda.'}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {mode === 'own' && allowOwn && (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                if (name.trim() && sector) onCreateOwn(name, sector)
              }}
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="next-step-name">Nome da etapa</Label>
                  <Input
                    id="next-step-name"
                    autoFocus
                    placeholder="Ex.: Solda da estrutura, Pintura"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
                <SelectBasic
                  name="next-step-sector"
                  label="Setor"
                  className="w-full"
                  options={sectors.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                  value={sector}
                  onChange={(value) => setSector(value)}
                />
              </div>
              <p className="text-sm text-gray">
                A etapa é deste produto. Depois de criada, acrescente os
                recursos e o tempo que o setor usa nela.
              </p>
              <Button type="submit" disabled={!name.trim() || !sector}>
                Criar etapa
              </Button>
            </form>
          )}

          {mode === 'part' && allowPart && (
            <div className="space-y-2">
              <p className="text-sm text-gray">
                Outro produto com composição, usado dentro deste: o quadro de
                ferro da placa, o painel de ACM da fachada. A caixa abre e
                mostra o que a parte tem por dentro.
              </p>
              {parts.length ? (
                parts.map((item) => (
                  <button
                    key={item.productId}
                    type="button"
                    onClick={() => onPickPart?.(item.productId)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-left hover:border-brand-300 hover:bg-brand-25"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-gray-800">
                        {item.name}
                      </span>
                      <span className="block text-xs text-gray">
                        {[
                          item.code,
                          `${item.stages} ${item.stages === 1 ? 'etapa' : 'etapas'}`,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </span>
                    {item.status === 'PART' && (
                      <Badge variant="blueLight">Parte</Badge>
                    )}
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray">
                  Nenhum outro produto com composição. Monte a composição da
                  parte no produto dela, com a situação &quot;Parte&quot;.
                </p>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------------------------------------------------------------------
 * "Ligar a…" (FL-5): a etapa passa a depender também de outra. É assim que a
 * instalação espera os dois caminhos (FL-4)
 * ------------------------------------------------------------------------- */

export function LinkStageDialog({
  open,
  onOpenChange,
  block,
  stages,
  onPick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  block: { id: string; name: string; dependsOn: string[] } | null
  stages: { id: string; name: string; sector: string }[]
  onPick: (toId: string) => void
}) {
  const options = stages.filter(
    (stage) => stage.id !== block?.id && !block?.dependsOn.includes(stage.id),
  )
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div>
              <DialogTitle>
                {block ? `${block.name} vem depois de…` : 'Ligar a…'}
              </DialogTitle>
              <DialogDescription>
                A etapa passa a depender também da que você escolher: na
                produção, ela só é liberada quando as duas terminarem.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="space-y-2">
          {options.length ? (
            options.map((stage) => {
              const Icon = sectorIconByName(stage.sector)
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => onPick(stage.id)}
                  className="flex w-full items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 text-left hover:border-brand-300 hover:bg-brand-25"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-600">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-gray-800">
                      {stage.name}
                    </span>
                    <span className="block text-xs text-gray">
                      {stage.sector}
                    </span>
                  </span>
                </button>
              )
            })
          ) : (
            <p className="text-sm text-gray">Não há outra etapa para ligar.</p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
