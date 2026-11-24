// As produções (PS-1, "O que a sua empresa produz?"): o que um setor produz
// (Maicol, 23/11/2026). A empresa cria os setores e liga as produções à mão;
// o treinamento explica como agrupar. A mesma lista do back
// (src/core/sector/productions.ts); ela cresce com o tempo.
export const PRODUCTIONS = [
  { key: 'impressao_solvente', label: 'Impressão solvente' },
  { key: 'impressao_uv', label: 'Impressão UV' },
  { key: 'sublimacao', label: 'Sublimação' },
  { key: 'recorte', label: 'Recorte' },
  { key: 'serigrafia', label: 'Serigrafia' },
  { key: 'serralheria', label: 'Serralheria' },
  { key: 'marcenaria', label: 'Marcenaria' },
  { key: 'brindes', label: 'Brindes' },
  { key: 'grafica_rapida', label: 'Gráfica rápida' },
  { key: 'offset', label: 'Offset' },
  { key: 'locacao', label: 'Locação' },
] as const
