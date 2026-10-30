// Status da composição do produto (área 8, §3.4.1). Seguem a convenção de
// cor do design.md §6.2.

// Types
import type { BadgeType } from '@/types/coreTypes'
import type { AssemblyStatus } from '@/app/(app-sidebar)/configuracoes/produtos/[id]/composicao/assembly'

// Situação da composição (IP-14 revisto em 29/10/2026, GP-47): o produto
// vende sempre, pelo preço do cadastro; a composição em montagem não entra
// no custo. Quem aprova confirma que ela está completa e correta: só então a
// base de custos do produto passa a valer no orçamento
export const assemblyStatusObj: {
  [key in AssemblyStatus]: BadgeType & { help: string }
} = {
  DRAFT: {
    text: 'Em montagem',
    variant: 'warningLight',
    help: 'O produto vende pelo preço do cadastro; o item avisa "custo não conferido" até a composição ser aprovada.',
  },
  RELEASED: {
    text: 'Aprovada',
    variant: 'successLight',
    help: 'A composição confere: o custo e o preço sugerido valem no orçamento.',
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
