// Tamanhos de ícone (design/openspec/changes/icones): fonte única para o
// componente Icon (src/components/ui/icon.tsx) e para os tokens do Tailwind
// (`size-icon-sm|md|lg`, tailwind.config.ts). Sem React aqui, para o
// Tailwind conseguir importar.
//
//   sm 16: texto em linha, botão pequeno, chip, badge
//   md 20: botão médio e grande, ação de linha, campo, item de menu, barra
//          lateral
//   lg 24: cabeçalho, estado vazio, spinner de página

export const ICON_SIZE = { sm: 16, md: 20, lg: 24 } as const
export type IconSize = keyof typeof ICON_SIZE

// Traço do Tabler: 2 até 20 px, 1,5 a partir de 24 px (o desenho fica pesado
// demais com 2 no tamanho grande)
export const ICON_STROKE: Record<IconSize, number> = { sm: 2, md: 2, lg: 1.5 }

/** `{ 'icon-sm': '1rem', … }` para o `spacing` do Tailwind. */
export const iconSpacing = Object.fromEntries(
  Object.entries(ICON_SIZE).map(([k, px]) => [`icon-${k}`, `${px / 16}rem`]),
) as Record<`icon-${IconSize}`, string>
