// O desenho do fluxo é feito pelo sistema (FL-5): ninguém arrasta caixa nem
// desenha linha. Cada etapa vai para a coluna da sua profundidade na
// dependência (quantas etapas vêm antes dela, no caminho mais longo), e a
// linha dentro da coluna segue a posição de quem ela depende, para as
// ligações cruzarem o menos possível.

export type FlowNodeInput = {
  id: string
  dependsOn: string[]
}

export type FlowPosition = {
  x: number
  y: number
  col: number
  row: number
}

export type FlowEdge = { from: string; to: string }

export type FlowLayout = {
  positions: Map<string, FlowPosition>
  edges: FlowEdge[]
  width: number
  height: number
  columns: number
  // Etapas fora do caminho principal: o fluxo de um produto é sempre ligado
  // (FL-12), e o que ficou solto recebe aviso
  detached: Set<string>
}

export const NODE_W = 240
export const NODE_H = 76
export const COL_GAP = 72
export const ROW_GAP = 20
export const PAD = 20
// Espaço à direita da última coluna, para o "+" depois da caixa
const TAIL = 32

export const layoutFlow = (nodes: FlowNodeInput[]): FlowLayout => {
  const ids = new Set(nodes.map((node) => node.id))
  const index = new Map(nodes.map((node, position) => [node.id, position]))
  const byId = new Map(nodes.map((node) => [node.id, node]))

  // Profundidade: o caminho mais longo até a etapa. Um laço (não deveria
  // existir) é cortado para o desenho não travar
  const depth = new Map<string, number>()
  const visiting = new Set<string>()
  const depthOf = (id: string): number => {
    const known = depth.get(id)
    if (known !== undefined) return known
    if (visiting.has(id)) return 0
    visiting.add(id)
    const node = byId.get(id)
    const parents = (node?.dependsOn || []).filter((parent) => ids.has(parent))
    const value = parents.length
      ? 1 + Math.max(...parents.map((parent) => depthOf(parent)))
      : 0
    visiting.delete(id)
    depth.set(id, value)
    return value
  }
  nodes.forEach((node) => depthOf(node.id))

  const columns = nodes.length ? 1 + Math.max(...Array.from(depth.values())) : 0

  // Linha dentro da coluna: a média das linhas de quem a etapa depende
  // (barycenter), e a ordem de criação como desempate
  const positions = new Map<string, FlowPosition>()
  let rows = 0
  for (let col = 0; col < columns; col++) {
    const members = nodes.filter((node) => depth.get(node.id) === col)
    const keyed = members.map((node) => {
      const parentRows = node.dependsOn
        .map((parent) => positions.get(parent)?.row)
        .filter((row): row is number => row !== undefined)
      const center = parentRows.length
        ? parentRows.reduce((sum, row) => sum + row, 0) / parentRows.length
        : Number.MAX_SAFE_INTEGER
      return { node, center, order: index.get(node.id) || 0 }
    })
    keyed.sort((a, b) => a.center - b.center || a.order - b.order)
    keyed.forEach(({ node }, row) => {
      positions.set(node.id, {
        col,
        row,
        x: PAD + col * (NODE_W + COL_GAP),
        y: PAD + row * (NODE_H + ROW_GAP),
      })
    })
    rows = Math.max(rows, keyed.length)
  }

  const edges: FlowEdge[] = nodes.flatMap((node) =>
    node.dependsOn
      .filter((parent) => ids.has(parent))
      .map((parent) => ({ from: parent, to: node.id })),
  )

  // Componentes ligados, sem direção: o maior é o produto; o resto está solto
  const parent = new Map<string, string>()
  const find = (id: string): string => {
    const current = parent.get(id) ?? id
    if (current === id) return id
    const root = find(current)
    parent.set(id, root)
    return root
  }
  const union = (a: string, b: string) => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }
  edges.forEach((edge) => union(edge.from, edge.to))
  const groups = new Map<string, string[]>()
  nodes.forEach((node) => {
    const root = find(node.id)
    groups.set(root, [...(groups.get(root) || []), node.id])
  })
  let main: string[] = []
  groups.forEach((members) => {
    if (
      members.length > main.length ||
      (members.length === main.length &&
        (index.get(members[0]) || 0) < (index.get(main[0]) || 0))
    ) {
      main = members
    }
  })
  const mainSet = new Set(main)
  const detached = new Set(
    nodes.map((node) => node.id).filter((id) => !mainSet.has(id)),
  )

  return {
    positions,
    edges,
    columns,
    width: nodes.length
      ? PAD * 2 + columns * NODE_W + (columns - 1) * COL_GAP + TAIL
      : 0,
    height: nodes.length ? PAD * 2 + rows * NODE_H + (rows - 1) * ROW_GAP : 0,
    detached,
  }
}

// Caminho da ligação: uma curva de uma caixa à outra, saindo pela direita e
// chegando pela esquerda. A ligação que pula colunas (a impressão que vai
// direto para a instalação, passando pela coluna do acabamento) desce para o
// vão entre as linhas e segue por ele, para não parecer que atravessa a caixa
// do meio
export const edgePath = (from: FlowPosition, to: FlowPosition) => {
  const x0 = from.x + NODE_W
  const y0 = from.y + NODE_H / 2
  const x1 = to.x
  const y1 = to.y + NODE_H / 2

  if (to.col - from.col <= 1) {
    const mid = (x0 + x1) / 2
    return {
      d: `M ${x0} ${y0} C ${mid} ${y0}, ${mid} ${y1}, ${x1} ${y1}`,
      midX: (x0 + x1) / 2,
      midY: (y0 + y1) / 2,
    }
  }

  // O vão logo abaixo da caixa de origem (ou acima, quando o destino está
  // mais alto): nunca passa por dentro de uma caixa
  const yb =
    to.row < from.row ? from.y - ROW_GAP / 2 : from.y + NODE_H + ROW_GAP / 2
  const xa = x0 + COL_GAP / 2
  const xb = x1 - COL_GAP / 2
  const d = [
    `M ${x0} ${y0}`,
    `C ${xa} ${y0}, ${xa} ${yb}, ${xa + 8} ${yb}`,
    `L ${xb - 8} ${yb}`,
    `C ${xb} ${yb}, ${xb} ${y1}, ${x1} ${y1}`,
  ].join(' ')
  return { d, midX: (xa + xb) / 2, midY: yb }
}
