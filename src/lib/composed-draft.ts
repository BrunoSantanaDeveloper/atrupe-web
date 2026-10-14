// O rascunho do item montado no orçamento (ORC-11, Fase 4.5) usa o mesmo
// editor de composição do produto: o "produto" do editor é o id
// "qdraft:<orçamento>:<rascunho>", e as ações mandam as rotas para o
// orçamento (src/actions/assembly.ts, hostOf)

export const DRAFT_HOST_PREFIX = 'qdraft:'

export const draftHostOf = (quotationId: string, draftId: string) =>
  `${DRAFT_HOST_PREFIX}${quotationId}:${draftId}`

export const parseDraftHost = (host: string) => {
  if (!host.startsWith(DRAFT_HOST_PREFIX)) return null
  const [, quotationId, draftId] = host.split(':')
  return quotationId && draftId ? { quotationId, draftId } : null
}
