// Status da composição do produto (área 8, §3.4.1). Seguem a convenção de
// cor do design.md §6.2.

// Types
import type { BadgeType } from '@/types/coreTypes'
import type { AssemblyStatus } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Situação do produto composto (IP-14): compor leva tempo, e o vendedor não
// pode pegar no orçamento um produto pela metade
export const assemblyStatusObj: {
  [key in AssemblyStatus]: BadgeType & { help: string }
} = {
  DRAFT: {
    text: 'Em edição',
    variant: 'neutralLight',
    help: 'Não aparece no orçamento enquanto a composição é montada.',
  },
  RELEASED: {
    text: 'Liberado para venda',
    variant: 'successLight',
    help: 'O vendedor encontra o produto no orçamento.',
  },
  PART: {
    text: 'Parte',
    variant: 'blueLight',
    help: 'Serve para compor outros produtos e não aparece no orçamento.',
  },
}

// Marcas de ajuste: o que deixou de seguir o processo ou a base
export const assemblyOverrideObj: { [key: string]: BadgeType } = {
  LOCAL_RULES: { text: 'Regras próprias', variant: 'warningLight' },
  VARIATION_CHANGED: { text: 'Alterado nesta variação', variant: 'blueLight' },
  VARIATION_INHERITS: { text: 'Acompanha a base', variant: 'neutralLight' },
}
