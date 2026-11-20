'use client'

// A marca dos campos que fazem o cliente passar de pré-cadastro a
// regularizado (decisão do produto, 26/10/2026; ALT-4). A regra é do
// servidor e automática: nome, CPF/CNPJ, telefone ou celular e endereço
// completo (CEP, estado, cidade, bairro, rua). A mesma marca, com a dica
// própria, aponta o que só a nota fiscal pede (Lista Lite 19/11, item 9):
// número do endereço (ou S/N), razão social de PJ e a IE do contribuinte.

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function RegularizadoMark({ hint }: { hint?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="ml-0.5 cursor-help text-warning-600"
            aria-label="Obrigatório para o cliente regularizado"
          >
            *
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px]">
          {hint ||
            'Obrigatório para o cliente regularizado: os dados mínimos para vender a prazo e emitir nota.'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
