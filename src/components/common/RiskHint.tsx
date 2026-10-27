'use client'

// O (!) ao lado de uma opção que abre uma brecha: ao clicar, explica a
// função e o risco. Usado nas liberações do produto (editar valor e
// descrição), que vendem o que não está cadastrado mas furam o limite de
// desconto se usadas em todo produto (ALT-8, decisão de 24/10/2026)

import { IconAlertCircle } from '@tabler/icons-react'

import { Icon } from '@/components/ui/icon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function RiskHint({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Sobre: ${title}`}
          className="inline-flex shrink-0 items-center justify-center rounded-full text-warning-600 hover:text-warning-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-300"
        >
          <Icon icon={IconAlertCircle} size="sm" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-2 text-sm text-gray-700">
        <p className="font-semibold text-gray-900">{title}</p>
        {children}
      </PopoverContent>
    </Popover>
  )
}

/** Os dois textos das liberações do produto, iguais onde aparecerem. */
export function AllowEditValueHint() {
  return (
    <RiskHint title="Permitir editar valor">
      <p>
        O vendedor pode mudar o preço deste produto no orçamento. Baixar o preço
        conta como desconto e respeita o limite do vendedor, medido sobre o
        preço do cadastro.
      </p>
      <p>
        Deixe ligado só nos produtos de preço variável. Para vender algo que não
        está cadastrado, use o Produto base do setor.
      </p>
    </RiskHint>
  )
}

export function AllowEditDescriptionHint() {
  return (
    <RiskHint title="Permitir editar descrição">
      <p>
        O vendedor pode trocar o nome deste produto na proposta, mas para o
        sistema ele continua sendo este produto.
      </p>
      <p>
        Vender outro item com o nome trocado distorce os relatórios de venda, a
        produção e o estoque. Para algo que não está cadastrado, use o Produto
        base do setor.
      </p>
    </RiskHint>
  )
}
