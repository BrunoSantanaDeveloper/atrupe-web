// Marcação visual da revisão (24/09/2026)
//
// Convenção pedida pelo time para conseguir percorrer o sistema e enxergar,
// sem abrir documento nenhum, o que é novo e o que ainda é espaço reservado:
//
//   azul     — tela criada nesta rodada de desenvolvimento (PRO/LITE), pronta
//              para ser revisada
//   vermelho — recurso decidido e ainda NÃO desenvolvido: o espaço existe na
//              tela, o comportamento não
//
// É marcação temporária de revisão. Sai antes de ir para produção: basta
// apagar este arquivo e as referências a `reviewTextClass` e `ReviewMark`.
export type ReviewMarkKind = 'new' | 'todo'

export const REVIEW_LEGEND: Record<ReviewMarkKind, string> = {
  new: 'Tela nova, criada nesta revisão',
  todo: 'Recurso ainda não desenvolvido',
}

// Só a cor da fonte, para não competir com o estado de selecionado do menu.
// Usa os tokens do projeto: blue-600 (#1570EF) e error-600 (#D92D20).
export const reviewTextClass = (kind?: ReviewMarkKind) => {
  if (kind === 'new') return '!text-blue-600'
  if (kind === 'todo') return '!text-error-600'

  return ''
}
