'use client'

// O fluxo da composição como desenho (FL-5): cada etapa é uma caixa com o
// ícone do setor, ligada às que vêm antes dela. As caixas são posicionadas
// pelo sistema (flow-layout.ts); o que a pessoa faz é responder "o que vem
// depois?": um "+" depois de cada caixa, um "+" no meio da ligação para
// inserir uma etapa, "+ novo caminho" fora das caixas e "ligar a…" no menu
// da caixa para o ponto de encontro (FL-4).
//
// Serve à composição do produto, à parte que abre (IP-9) e ao item montado
// no orçamento (ORC-11). Não mostra custo: quem usa decide o que vai no
// subtítulo de cada caixa.

// React
import { Fragment, useEffect, useState, type ReactNode } from 'react'

// UI
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

// Types
import type { BadgeType } from '@/types/coreTypes'

// Hooks / Store / Consts
import { sectorIconByName } from '@/consts/sectors'
import { PAD, NODE_H, NODE_W, edgePath, layoutFlow } from './flow-layout'

// Icons
import {
  IconPlus,
  IconChevronUp,
  IconChevronDown,
  IconDotsVertical,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { ICON_SIZE } from '@/components/ui/icon'

// Utils
import { cn } from '@/lib/utils'

export type FlowNode = {
  id: string
  name: string
  sector: string
  dependsOn: string[]
  // Uma linha curta embaixo do nome: "Processo cadastrado", "Parte · 3
  // etapas", o preço da etapa no orçamento
  subtitle?: string
  badge?: BadgeType
  // A parte (IP-9): o que ela tem por dentro, para a caixa abrir
  part?: FlowNode[] | null
  tone?: 'default' | 'error'
}

export type FlowMenuItem = {
  label: string
  icon?: React.ElementType
  onSelect: () => void
  destructive?: boolean
  disabled?: boolean
  // Separador antes deste item
  separator?: boolean
}

interface Props {
  nodes: FlowNode[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  // Só desenha: sem "+", sem menu
  readOnly?: boolean
  onAddAfter?: (node: FlowNode) => void
  onInsertBetween?: (from: FlowNode, to: FlowNode) => void
  onAddPath?: () => void
  addPathLabel?: string
  menu?: (node: FlowNode) => FlowMenuItem[]
  // A parte aberta (IP-9), uma por vez em cada nível
  expandedPartId?: string | null
  onTogglePart?: (id: string) => void
  // O que aparece quando não há etapa
  empty?: ReactNode
  // Nível da parte dentro da parte: muda o id do marcador da seta
  depth?: number
  className?: string
}

const PLUS =
  'absolute z-10 flex size-6 items-center justify-center rounded-full border border-brand-300 bg-white text-brand-600 shadow-sm hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200'

export function FlowCanvas({
  nodes,
  selectedId,
  onSelect,
  readOnly,
  onAddAfter,
  onInsertBetween,
  onAddPath,
  addPathLabel = 'Novo caminho',
  menu,
  expandedPartId,
  onTogglePart,
  empty,
  depth = 0,
  className,
}: Props) {
  const layout = layoutFlow(nodes)
  const byId = new Map(nodes.map((node) => [node.id, node]))

  // O menu da caixa dentro de um modal: Esc fecha só o menu. O Dialog e o
  // DropdownMenu do Radix não compartilham a pilha de camadas neste projeto,
  // e os dois fechariam juntos; o Esc é tratado antes, na captura da janela
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  useEffect(() => {
    if (!openMenuId) return
    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      setOpenMenuId(null)
    }
    window.addEventListener('keydown', handler, { capture: true })
    return () =>
      window.removeEventListener('keydown', handler, { capture: true })
  }, [openMenuId])
  const expanded = expandedPartId ? byId.get(expandedPartId) : undefined
  const marker = `flow-arrow-${depth}`

  return (
    <div className={cn('space-y-3', className)}>
      {nodes.length ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-gray-50">
          <div
            className="relative"
            style={{
              width: layout.width,
              height: layout.height,
              minWidth: '100%',
            }}
          >
            <svg
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
              style={{ width: layout.width, height: layout.height }}
            >
              <defs>
                <marker
                  id={marker}
                  viewBox="0 0 10 10"
                  refX="9"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" className="fill-gray-300" />
                </marker>
              </defs>
              {layout.edges.map((edge) => {
                const from = layout.positions.get(edge.from)
                const to = layout.positions.get(edge.to)
                if (!from || !to) return null
                const path = edgePath(from, to)
                return (
                  <path
                    key={`${edge.from}-${edge.to}`}
                    d={path.d}
                    className="fill-none stroke-gray-300"
                    strokeWidth={1.5}
                    markerEnd={`url(#${marker})`}
                  />
                )
              })}
            </svg>

            {nodes.map((node) => {
              const position = layout.positions.get(node.id)
              if (!position) return null
              const Icon = sectorIconByName(node.sector)
              const selected = selectedId === node.id
              const detached = layout.detached.has(node.id)
              const items = !readOnly && menu ? menu(node) : []

              return (
                <Fragment key={node.id}>
                  <div
                    className={cn(
                      'absolute flex items-center gap-2.5 rounded-xl border bg-white py-2 pl-2.5 pr-1.5 shadow-sm transition-colors',
                      selected
                        ? 'border-brand-500 ring-2 ring-brand-100'
                        : 'border-gray-200 hover:border-brand-300',
                      detached && 'border-dashed border-warning-400',
                      node.tone === 'error' && 'border-error-300',
                      onSelect && 'cursor-pointer',
                    )}
                    style={{
                      left: position.x,
                      top: position.y,
                      width: NODE_W,
                      height: NODE_H,
                    }}
                    onClick={() => onSelect?.(node.id)}
                    title={
                      detached
                        ? 'Este caminho não se liga ao resto do produto'
                        : undefined
                    }
                  >
                    <span
                      className={cn(
                        'flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 text-gray-600',
                        selected &&
                          'border-brand-100 bg-brand-25 text-brand-700',
                      )}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left focus-visible:outline-none"
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelect?.(node.id)
                      }}
                      aria-pressed={selected}
                    >
                      <span
                        className="line-clamp-2 text-sm font-medium leading-5 text-gray-800"
                        title={node.name}
                      >
                        {node.name}
                      </span>
                      {/* O badge, quando existe, toma o lugar do subtítulo:
                          a caixa tem altura fixa */}
                      {node.badge ? (
                        <Badge
                          variant={node.badge.variant}
                          className="mt-0.5 h-4 px-1.5 text-xs"
                        >
                          {node.badge.text}
                        </Badge>
                      ) : (
                        <span className="block truncate text-xs leading-4 text-gray">
                          {node.subtitle || node.sector}
                        </span>
                      )}
                    </button>
                    {node.part && onTogglePart && (
                      <Button
                        type="button"
                        size="iconSm"
                        variant="neutralGhost"
                        className="shrink-0"
                        aria-label={
                          expandedPartId === node.id
                            ? 'Fechar a parte'
                            : 'Abrir a parte'
                        }
                        onClick={(event) => {
                          event.stopPropagation()
                          onTogglePart(node.id)
                        }}
                      >
                        {expandedPartId === node.id ? (
                          <IconChevronUp aria-hidden size={ICON_SIZE.sm} />
                        ) : (
                          <IconChevronDown aria-hidden size={ICON_SIZE.sm} />
                        )}
                      </Button>
                    )}
                    {items.length > 0 && (
                      <DropdownMenu
                        open={openMenuId === node.id}
                        onOpenChange={(open) =>
                          setOpenMenuId(open ? node.id : null)
                        }
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            size="iconSm"
                            variant="neutralGhost"
                            className="shrink-0"
                            aria-label={`Ações de ${node.name}`}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <IconDotsVertical aria-hidden size={ICON_SIZE.sm} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(event) => event.stopPropagation()}
                        >
                          {items.map((item, index) => (
                            <Fragment key={`${node.id}-${index}`}>
                              {item.separator && <DropdownMenuSeparator />}
                              <DropdownMenuItem
                                disabled={item.disabled}
                                onSelect={item.onSelect}
                                className={cn(
                                  'gap-2',
                                  item.destructive &&
                                    'text-error-600 focus:text-error-700',
                                )}
                              >
                                {item.icon && (
                                  <item.icon className="size-4" aria-hidden />
                                )}
                                {item.label}
                              </DropdownMenuItem>
                            </Fragment>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* "+" depois da caixa: a etapa seguinte. Usar de novo na
                      mesma caixa divide o fluxo (FL-5) */}
                  {!readOnly && onAddAfter && (
                    <button
                      type="button"
                      className={PLUS}
                      style={{
                        left: position.x + NODE_W - 12,
                        top: position.y + NODE_H / 2 - 12,
                      }}
                      aria-label={`Etapa depois de ${node.name}`}
                      title={`Etapa depois de ${node.name}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        onAddAfter(node)
                      }}
                    >
                      <IconPlus aria-hidden size={ICON_SIZE.sm} />
                    </button>
                  )}
                </Fragment>
              )
            })}

            {/* "+" no meio da ligação: inserir uma etapa entre duas */}
            {!readOnly &&
              onInsertBetween &&
              layout.edges.map((edge) => {
                const from = layout.positions.get(edge.from)
                const to = layout.positions.get(edge.to)
                const fromNode = byId.get(edge.from)
                const toNode = byId.get(edge.to)
                if (!from || !to || !fromNode || !toNode) return null
                const path = edgePath(from, to)
                return (
                  <button
                    key={`mid-${edge.from}-${edge.to}`}
                    type="button"
                    className={cn(PLUS, 'size-5 border-gray-300 text-gray-500')}
                    style={{ left: path.midX - 10, top: path.midY - 10 }}
                    aria-label={`Inserir etapa entre ${fromNode.name} e ${toNode.name}`}
                    title={`Inserir entre ${fromNode.name} e ${toNode.name}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      onInsertBetween(fromNode, toNode)
                    }}
                  >
                    <IconPlus aria-hidden size={ICON_SIZE.sm} />
                  </button>
                )
              })}
          </div>
        </div>
      ) : (
        empty
      )}

      {/* Sem etapa, o estado vazio já traz a ação: o botão de baixo só
          aparece com o desenho */}
      {(!readOnly && onAddPath && (nodes.length > 0 || !empty)) ||
      layout.detached.size > 0 ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3"
          style={{ paddingLeft: nodes.length ? 0 : PAD }}
        >
          {!readOnly && onAddPath && (nodes.length > 0 || !empty) ? (
            <Button
              type="button"
              size="sm"
              variant="neutralOutline"
              LeftIcon={IconPlus}
              onClick={onAddPath}
            >
              {addPathLabel}
            </Button>
          ) : (
            <span />
          )}
          {/* O fluxo de um produto é sempre ligado (FL-12): aviso, não
              bloqueio */}
          {layout.detached.size > 0 && (
            <p className="flex items-center gap-1.5 text-sm text-warning-700">
              <IconAlertTriangle
                size={ICON_SIZE.sm}
                className="shrink-0"
                aria-hidden
              />
              Este caminho não se liga ao resto do produto: ligue a uma etapa ou
              crie outro produto.
            </p>
          )}
        </div>
      ) : null}

      {/* A parte aberta (IP-9): o que ela tem por dentro, só para ver */}
      {expanded?.part && (
        <div className="rounded-xl border border-blue-200 bg-blue-25 p-4">
          <p className="mb-3 text-sm text-gray-700">
            Dentro de <strong>{expanded.name}</strong>, calculado na medida
            desta etapa. Para mudar o que a parte leva, abra a composição dela.
          </p>
          <FlowCanvas nodes={expanded.part} readOnly depth={depth + 1} />
        </div>
      )}
    </div>
  )
}
